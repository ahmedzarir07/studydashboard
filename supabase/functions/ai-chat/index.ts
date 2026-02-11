import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 20;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  let lastResponse: Response | null = null;
  let delay = INITIAL_RETRY_DELAY_MS;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, options);
    
    if (response.ok) return response;

    if (response.status === 429) {
      const errorText = await response.text();
      console.log(`Groq 429 response (attempt ${attempt + 1}):`, errorText);

      if (attempt < retries) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : delay;
        console.log(`Rate limited, retrying in ${waitTime}ms...`);
        await sleep(waitTime);
        delay *= 2;
        continue;
      }

      return new Response(errorText, {
        status: 429,
        statusText: "Too Many Requests",
        headers: response.headers,
      });
    }

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
    
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    // Build comprehensive user context
    let userDataContext = "";
    if (userContext) {
      const profileSection = [
        userContext.profile?.displayName ? `Name: ${userContext.profile.displayName}` : "",
        userContext.profile?.email ? `Email: ${userContext.profile.email}` : "",
        userContext.profile?.batch ? `Batch: ${userContext.profile.batch}` : "",
        userContext.profile?.groupName ? `Group: ${userContext.profile.groupName}` : "",
        userContext.profile?.boardName ? `Board: ${userContext.profile.boardName}` : "",
        userContext.profile?.studyType ? `Study Type: ${userContext.profile.studyType}` : "",
        userContext.profile?.phone ? `Phone: ${userContext.profile.phone}` : "",
        userContext.profile?.gender ? `Gender: ${userContext.profile.gender}` : "",
        userContext.profile?.address ? `Address: ${userContext.profile.address}` : "",
        userContext.profile?.passingYear ? `Passing Year: ${userContext.profile.passingYear}` : "",
        userContext.profile?.dateOfBirth ? `Date of Birth: ${userContext.profile.dateOfBirth}` : "",
        userContext.profile?.boardRoll ? `Board Roll: ${userContext.profile.boardRoll}` : "",
        userContext.profile?.registrationNumber ? `Registration: ${userContext.profile.registrationNumber}` : "",
        userContext.profile?.optionalSubjects?.length ? `Optional Subjects: ${userContext.profile.optionalSubjects.join(", ")}` : "",
        userContext.coachSettings?.batch ? `HSC Batch: ${userContext.coachSettings.batch}` : "",
        userContext.coachSettings?.monthsRemaining ? `Months until exam: ${userContext.coachSettings.monthsRemaining}` : "",
        userContext.coachSettings?.riskLevel ? `Risk Level: ${userContext.coachSettings.riskLevel}` : "",
        userContext.coachSettings?.completionPercentage !== undefined ? `Coach Completion: ${userContext.coachSettings.completionPercentage}%` : "",
      ].filter(Boolean).join("\n");

      const subjectProgress = userContext.subjects?.map((s: { name: string; progress: number }) => 
        `- ${s.name}: ${s.progress}%`
      ).join("\n") || "No data available";

      let monthlyPlanSection = "";
      if (userContext.monthlyPlans && userContext.monthlyPlans.length > 0) {
        const plansBySubject: Record<string, string[]> = {};
        for (const plan of userContext.monthlyPlans) {
          if (!plansBySubject[plan.subject]) plansBySubject[plan.subject] = [];
          plansBySubject[plan.subject].push(`${plan.chapter} (${plan.activities.join(", ")})${plan.goals ? ` [Goal: ${plan.goals}]` : ""}`);
        }
        monthlyPlanSection = Object.entries(plansBySubject)
          .map(([subject, chapters]) => `${subject}:\n  ${chapters.join("\n  ")}`)
          .join("\n");
      }

      let completedSection = "";
      if (userContext.completedChapters && userContext.completedChapters.length > 0) {
        completedSection = userContext.completedChapters.map((c: { subject: string; chapter: string; completedAt?: string }) => {
          const date = c.completedAt ? new Date(c.completedAt).toLocaleDateString() : "";
          return `- ${c.subject}: ${c.chapter}${date ? ` (completed ${date})` : ""}`;
        }).join("\n");
      }

      let recentActivitySection = "";
      if (userContext.recentActivities && userContext.recentActivities.length > 0) {
        recentActivitySection = userContext.recentActivities.map((a: { subject: string; chapter: string; activity: string; status: string; updatedAt?: string }) => {
          const date = a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "";
          return `- ${a.subject} > ${a.chapter} > ${a.activity}: ${a.status}${date ? ` (${date})` : ""}`;
        }).join("\n");
      }

      let resourcesSection = "";
      if (userContext.resources && userContext.resources.length > 0) {
        resourcesSection = userContext.resources.map((r: { subject: string; chapter: string; title: string }) =>
          `- ${r.subject} > ${r.chapter}: ${r.title}`
        ).join("\n");
      }

      userDataContext = `

=== STUDENT'S COMPLETE DATABASE ===
--- Profile Info ---
${profileSection}

--- Overall Stats ---
Overall Progress: ${userContext.overallProgress}%
Total Chapters Completed: ${userContext.totalCompletedChapters || 0}
Chapters Planned This Month: ${userContext.totalPlannedThisMonth || 0}
Total Resources Saved: ${userContext.totalResources || 0}

--- Subject Progress ---
${subjectProgress}

${monthlyPlanSection ? `--- This Month's Study Plan ---\n${monthlyPlanSection}\n` : ""}
${completedSection ? `--- Completed Chapters ---\n${completedSection}\n` : ""}
${recentActivitySection ? `--- Recent Study Activities ---\n${recentActivitySection}\n` : ""}
${resourcesSection ? `--- Saved Resources ---\n${resourcesSection}\n` : ""}
${userContext.userPreferences ? `--- User Preferences ---
Class: ${userContext.userPreferences.currentClass || "N/A"}
Weak Subjects: ${userContext.userPreferences.weakSubjects?.join(", ") || "N/A"}
Study Hours: ${userContext.userPreferences.studyHours || "N/A"}
Main Goal: ${userContext.userPreferences.mainGoal || "N/A"}
` : ""}===`;
    }

    const systemPrompt = `You are a helpful AI study assistant for HSC (Higher Secondary Certificate) students in Bangladesh.

You have FULL access to this student's complete study database shown below. You MUST proactively reference their specific data when giving advice. Never say you don't have access to their data.

You help students with:
- Study tips and strategies based on their actual progress
- Subject-specific guidance for Physics, Chemistry, Biology, Higher Math, ICT, English, and Bangla
- Motivation and study planning using their real data
- Answering academic questions
- Exam preparation tips
- Analyzing images of textbook pages, notes, problems, or diagrams

Be friendly, encouraging, and supportive. Keep responses concise but helpful.
You can respond in both Bengali and English based on the user's language preference.
Always be positive and motivating to help students succeed in their HSC exams.

When giving advice, ALWAYS reference their specific data:
- Mention their actual progress percentages
- Reference specific chapters they've completed or planned
- Note which subjects need more attention based on their data
- Use their profile info to personalize responses
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

    const truncatedMessages = transformedMessages.length > MAX_MESSAGES 
      ? transformedMessages.slice(-MAX_MESSAGES)
      : transformedMessages;
    
    console.log("Sending", truncatedMessages.length, "messages to Groq");

    const response = await fetchWithRetry("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          ...truncatedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error("Groq API error:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Too many requests. Please wait 30-60 seconds and try again.",
            type: "rate_limit"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: "Groq API key is invalid or expired.",
            type: "auth"
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await response.text();
      console.error("Groq API error response:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from Groq");
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
