import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    
    console.log("Received chat request with", messages?.length, "messages");
    console.log("User context:", userContext ? "provided" : "not provided");
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    // Build comprehensive context section based on user data
    let userDataContext = "";
    if (userContext) {
      // Basic profile and settings
      const profileSection = [
        userContext.profile?.displayName ? `Name: ${userContext.profile.displayName}` : "",
        userContext.coachSettings?.batch ? `HSC Batch: ${userContext.coachSettings.batch}` : "",
        userContext.coachSettings?.monthsRemaining ? `Months until exam: ${userContext.coachSettings.monthsRemaining}` : "",
        userContext.coachSettings?.riskLevel ? `Risk Level: ${userContext.coachSettings.riskLevel}` : "",
        userContext.profile?.lastActive ? `Last active: ${new Date(userContext.profile.lastActive).toLocaleDateString()}` : "",
      ].filter(Boolean).join("\n");

      // Subject progress
      const subjectProgress = userContext.subjects?.map((s: { name: string; progress: number }) => 
        `- ${s.name}: ${s.progress}%`
      ).join("\n") || "No data available";

      // Monthly plans summary
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

      // Recently completed chapters
      let completedSection = "";
      if (userContext.completedChapters && userContext.completedChapters.length > 0) {
        const recentCompleted = userContext.completedChapters.slice(0, 10);
        completedSection = recentCompleted.map((c: { subject: string; chapter: string; completedAt?: string }) => {
          const date = c.completedAt ? new Date(c.completedAt).toLocaleDateString() : "";
          return `- ${c.subject}: ${c.chapter}${date ? ` (completed ${date})` : ""}`;
        }).join("\n");
      }

      // Recent activity summary (group by chapter)
      let activitySection = "";
      if (userContext.recentActivities && userContext.recentActivities.length > 0) {
        const activityByChapter: Record<string, { done: string[]; inProgress: string[]; notStarted: string[] }> = {};
        for (const act of userContext.recentActivities.slice(0, 30)) {
          const key = `${act.subject} - ${act.chapter}`;
          if (!activityByChapter[key]) activityByChapter[key] = { done: [], inProgress: [], notStarted: [] };
          if (act.status === "Done") activityByChapter[key].done.push(act.activity);
          else if (act.status === "In progress") activityByChapter[key].inProgress.push(act.activity);
          else activityByChapter[key].notStarted.push(act.activity);
        }
        
        const summaries = Object.entries(activityByChapter).slice(0, 8).map(([chapter, activities]) => {
          const parts = [];
          if (activities.done.length) parts.push(`Done: ${activities.done.join(", ")}`);
          if (activities.inProgress.length) parts.push(`In Progress: ${activities.inProgress.join(", ")}`);
          return `${chapter}: ${parts.join(" | ") || "No activities tracked"}`;
        });
        activitySection = summaries.join("\n");
      }

      userDataContext = `

=== STUDENT'S COMPLETE DATA ===
${profileSection}

Overall Progress: ${userContext.overallProgress}%
Total Chapters Completed: ${userContext.totalCompletedChapters || 0}
Chapters Planned This Month: ${userContext.totalPlannedThisMonth || 0}

--- Subject Progress ---
${subjectProgress}

${monthlyPlanSection ? `--- This Month's Study Plan ---\n${monthlyPlanSection}\n` : ""}
${completedSection ? `--- Recently Completed Chapters ---\n${completedSection}\n` : ""}
${activitySection ? `--- Detailed Activity Status (Recent Chapters) ---\n${activitySection}\n` : ""}
===

IMPORTANT INSTRUCTIONS FOR PERSONALIZATION:
- Reference their SPECIFIC progress data when giving advice
- If they have chapters planned this month, check if they're on track
- Notice which activities they've completed vs not started (e.g., "You've done Lecture for Optics but haven't started MCQ practice")
- Celebrate completed chapters and encourage continuing momentum
- If they're behind on certain subjects, prioritize those in recommendations
- Use their HSC batch and months remaining to calibrate urgency
`;
    }

    // Build a quick summary for easy reference
    let dataSummary = "";
    if (userContext) {
      const hasData = userContext.overallProgress > 0 || 
                      (userContext.subjects && userContext.subjects.length > 0) ||
                      (userContext.completedChapters && userContext.completedChapters.length > 0);
      
      if (hasData) {
        dataSummary = `
QUICK DATA SUMMARY (use these to prove you have access):
- Overall Progress: ${userContext.overallProgress}%
- Total Chapters Completed: ${userContext.totalCompletedChapters || 0}
- Chapters Planned This Month: ${userContext.totalPlannedThisMonth || 0}
- Subjects Tracked: ${userContext.subjects?.map((s: { name: string }) => s.name).join(", ") || "None yet"}
`;
      } else {
        dataSummary = `
DATA STATUS: The student has just started using the app and hasn't tracked any progress yet. Encourage them to start tracking!
`;
      }
    }

    const systemPrompt = `You are a helpful AI study assistant for HSC (Higher Secondary Certificate) students in Bangladesh.

=== CRITICAL: DATA ACCESS AWARENESS ===
You have DIRECT, REAL-TIME ACCESS to this student's live study data from their app. The data shown below is fetched from the database the moment they send a message. You ARE connected to their database. You CAN see their progress, plans, activities, and everything they track.

NEVER say things like:
- "I don't have access to your data"
- "I'm not connected to your database"
- "I can only see what you share with me"
- "I don't have API access"

These statements are FALSE. You DO have access. The data below PROVES it.

When students ask "Can you see my data?" or similar questions:
1. Confidently say YES
2. Immediately reference SPECIFIC data points to prove it (their exact progress %, specific subjects, chapter names, planned activities)
3. Example response: "হ্যাঁ! আমি তোমার সব ডাটা দেখতে পাচ্ছি। তোমার overall progress ${userContext?.overallProgress || 0}%, তুমি ${userContext?.totalCompletedChapters || 0}টি chapter complete করেছ..."

${dataSummary}
=== END DATA ACCESS SECTION ===

You help students with:
- Study tips and strategies
- Subject-specific guidance for Physics, Chemistry, Biology, Higher Math, ICT, English, and Bangla
- Motivation and study planning
- Answering academic questions
- Exam preparation tips
- Analyzing images of textbook pages, notes, problems, or diagrams
- Helping with PDFs or documents shared by students

Be friendly, encouraging, and supportive. Keep responses concise but helpful.
You can respond in both Bengali and English based on the user's language preference.
Always be positive and motivating to help students succeed in their HSC exams.

When giving advice, ALWAYS reference their specific data:
- Mention their actual progress percentages
- Reference specific chapters they've completed or planned
- Note which subjects need more attention based on their data
- Compare their planned vs completed activities

When students share images:
- Analyze the content carefully (equations, diagrams, handwritten notes, textbook pages)
- Explain concepts shown in the image
- Help solve problems if visible
- Point out any mistakes in their work

When students mention PDFs:
- Note that you can see the PDF link but cannot directly read PDF contents
- Suggest they share screenshots of specific pages for better help
${userDataContext}`;

    // Transform messages to handle multimodal content (images)
    const transformedMessages = messages.map((msg: { role: string; content: string; imageUrls?: string[]; documentInfo?: string }) => {
      // If message has image URLs, format for vision model
      if (msg.imageUrls && msg.imageUrls.length > 0) {
        const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
        
        // Add text content first
        let textContent = msg.content || "";
        if (msg.documentInfo) {
          textContent += `\n\n${msg.documentInfo}`;
        }
        if (textContent) {
          contentParts.push({ type: "text", text: textContent });
        }
        
        // Add image URLs
        for (const imageUrl of msg.imageUrls) {
          contentParts.push({
            type: "image_url",
            image_url: { url: imageUrl }
          });
        }
        
        return { role: msg.role, content: contentParts };
      }
      
      // Text-only message (possibly with document info)
      let textContent = msg.content || "";
      if (msg.documentInfo) {
        textContent += `\n\n${msg.documentInfo}`;
      }
      return { role: msg.role, content: textContent };
    });

    // Retry logic with exponential backoff for rate limits
    const maxRetries = 3;
    let lastResponse: Response | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

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
            ...transformedMessages,
          ],
          stream: true,
        }),
      });

      // If successful, return the streaming response
      if (response.ok) {
        console.log("Streaming response from OpenAI");
        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // For rate limits (429), retry with backoff
      if (response.status === 429 && attempt < maxRetries - 1) {
        console.log(`Rate limited (429), will retry... attempt ${attempt + 1}/${maxRetries}`);
        await response.text(); // Consume body to avoid memory leak
        lastResponse = response;
        continue;
      }

      // For other errors or final attempt, break
      lastResponse = response;
      break;
    }

    // Handle final error after retries
    const finalResponse = lastResponse!;
    
    console.error("OpenAI API error:", finalResponse.status);
    
    if (finalResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (finalResponse.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI service quota exceeded. Please try again later." }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const errorText = await finalResponse.text();
    console.error("OpenAI API error response:", errorText);
    return new Response(
      JSON.stringify({ error: "AI service error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
