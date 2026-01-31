import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 20;

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "OpenAI quota exceeded. Please check your billing." }),
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
