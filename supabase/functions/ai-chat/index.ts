import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 20;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 200;

// Helper to detect if 429 is actually a billing/quota issue vs rate limit
function isBillingOrQuotaError(errorBody: string): boolean {
  const lower = errorBody.toLowerCase();
  return (
    lower.includes("insufficient_quota") ||
    lower.includes("billing") ||
    lower.includes("exceeded your current quota") ||
    lower.includes("you exceeded") ||
    lower.includes("account") ||
    lower.includes("plan") ||
    lower.includes("upgrade")
  );
}

// Helper to sleep for exponential backoff
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Make request with exponential backoff for true rate limits
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  let lastResponse: Response | null = null;
  let delay = INITIAL_RETRY_DELAY_MS;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, options);
    
    if (response.ok) {
      return response;
    }

    // For 429, check if it's billing or rate limit
    if (response.status === 429) {
      const errorText = await response.text();
      console.log(`OpenAI 429 response (attempt ${attempt + 1}):`, errorText);

      // If it's a billing/quota issue, don't retry - return immediately
      if (isBillingOrQuotaError(errorText)) {
        console.error("Billing/quota issue detected, not retrying");
        // Create a new response with the error text since we consumed it
        return new Response(errorText, {
          status: 429,
          statusText: "Too Many Requests",
          headers: response.headers,
        });
      }

      // True rate limit - retry with backoff
      if (attempt < retries) {
        // Check for Retry-After header
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay;
        console.log(`Rate limited, retrying in ${waitTime}ms...`);
        await sleep(waitTime);
        delay *= 2; // Exponential backoff
        continue;
      }

      // Max retries reached
      return new Response(errorText, {
        status: 429,
        statusText: "Too Many Requests",
        headers: response.headers,
      });
    }

    // For other errors, don't retry
    lastResponse = response;
    break;
  }

  return lastResponse!;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    
    console.log("Received chat request with", messages?.length, "messages");
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    // Build user context section
    let userDataContext = "";
    if (userContext) {
      const profileSection = [
        userContext.profile?.displayName ? `Name: ${userContext.profile.displayName}` : "",
        userContext.coachSettings?.batch ? `HSC Batch: ${userContext.coachSettings.batch}` : "",
        userContext.coachSettings?.monthsRemaining ? `Months until exam: ${userContext.coachSettings.monthsRemaining}` : "",
        userContext.coachSettings?.riskLevel ? `Risk Level: ${userContext.coachSettings.riskLevel}` : "",
      ].filter(Boolean).join("\n");

      const subjectProgress = userContext.subjects?.map((s: { name: string; progress: number }) => 
        `- ${s.name}: ${s.progress}%`
      ).join("\n") || "No data available";

      let monthlyPlanSection = "";
      if (userContext.monthlyPlans && userContext.monthlyPlans.length > 0) {
        const plansBySubject: Record<string, string[]> = {};
        for (const plan of userContext.monthlyPlans) {
          if (!plansBySubject[plan.subject]) plansBySubject[plan.subject] = [];
          plansBySubject[plan.subject].push(`${plan.chapter} (${plan.activities.join(", ")})`);
        }
        monthlyPlanSection = Object.entries(plansBySubject)
          .map(([subject, chapters]) => `${subject}:\n  ${chapters.join("\n  ")}`)
          .join("\n");
      }

      let completedSection = "";
      if (userContext.completedChapters && userContext.completedChapters.length > 0) {
        const recentCompleted = userContext.completedChapters.slice(0, 10);
        completedSection = recentCompleted.map((c: { subject: string; chapter: string; completedAt?: string }) => {
          const date = c.completedAt ? new Date(c.completedAt).toLocaleDateString() : "";
          return `- ${c.subject}: ${c.chapter}${date ? ` (completed ${date})` : ""}`;
        }).join("\n");
      }

      userDataContext = `

=== STUDENT'S DATA ===
${profileSection}

Overall Progress: ${userContext.overallProgress}%
Total Chapters Completed: ${userContext.totalCompletedChapters || 0}
Chapters Planned This Month: ${userContext.totalPlannedThisMonth || 0}

--- Subject Progress ---
${subjectProgress}

${monthlyPlanSection ? `--- This Month's Study Plan ---\n${monthlyPlanSection}\n` : ""}
${completedSection ? `--- Recently Completed Chapters ---\n${completedSection}\n` : ""}
===`;
    }

    const systemPrompt = `You are a helpful AI study assistant for HSC (Higher Secondary Certificate) students in Bangladesh.

You have access to this student's study data shown below. Reference their specific progress when giving advice.

You help students with:
- Study tips and strategies
- Subject-specific guidance for Physics, Chemistry, Biology, Higher Math, ICT, English, and Bangla
- Motivation and study planning
- Answering academic questions
- Exam preparation tips
- Analyzing images of textbook pages, notes, problems, or diagrams

Be friendly, encouraging, and supportive. Keep responses concise but helpful.
You can respond in both Bengali and English based on the user's language preference.
Always be positive and motivating to help students succeed in their HSC exams.

When giving advice, reference their specific data:
- Mention their actual progress percentages
- Reference specific chapters they've completed or planned
- Note which subjects need more attention based on their data
${userDataContext}`;

    // Transform messages for multimodal content
    const transformedMessages = messages.map((msg: { role: string; content: string; imageUrls?: string[]; documentInfo?: string }) => {
      if (msg.imageUrls && msg.imageUrls.length > 0) {
        const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
        
        let textContent = msg.content || "";
        if (msg.documentInfo) {
          textContent += `\n\n${msg.documentInfo}`;
        }
        if (textContent) {
          contentParts.push({ type: "text", text: textContent });
        }
        
        for (const imageUrl of msg.imageUrls) {
          contentParts.push({
            type: "image_url",
            image_url: { url: imageUrl }
          });
        }
        
        return { role: msg.role, content: contentParts };
      }
      
      let textContent = msg.content || "";
      if (msg.documentInfo) {
        textContent += `\n\n${msg.documentInfo}`;
      }
      return { role: msg.role, content: textContent };
    });

    // Truncate messages to prevent token overflow
    const truncatedMessages = transformedMessages.length > MAX_MESSAGES 
      ? transformedMessages.slice(-MAX_MESSAGES)
      : transformedMessages;
    
    console.log("Sending", truncatedMessages.length, "messages to OpenAI");

    const response = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...truncatedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status);
      
      if (response.status === 429) {
        // Read error body to determine if it's billing or rate limit
        const errorText = await response.text();
        console.error("OpenAI 429 error body:", errorText);
        
        if (isBillingOrQuotaError(errorText)) {
          // Billing/quota issue - return 402
          return new Response(
            JSON.stringify({ 
              error: "OpenAI billing/credits not enabled. Please add credits to your OpenAI account.",
              type: "billing"
            }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // True rate limit
        return new Response(
          JSON.stringify({ 
            error: "Too many requests. Please wait 30-60 seconds and try again.",
            type: "rate_limit"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "OpenAI billing/credits not enabled. Please add credits to your OpenAI account.",
            type: "billing"
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await response.text();
      console.error("OpenAI API error response:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from OpenAI");
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
