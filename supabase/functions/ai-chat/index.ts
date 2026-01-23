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
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    // Build context section based on user data
    let userDataContext = "";
    if (userContext) {
      userDataContext = `

=== STUDENT'S CURRENT DATA ===
${userContext.profile?.displayName ? `Name: ${userContext.profile.displayName}` : ""}
${userContext.profile?.email ? `Email: ${userContext.profile.email}` : ""}
${userContext.coachSettings?.batch ? `HSC Batch: ${userContext.coachSettings.batch}` : ""}
${userContext.coachSettings?.monthsRemaining ? `Months until exam: ${userContext.coachSettings.monthsRemaining}` : ""}
${userContext.coachSettings?.riskLevel ? `Risk Level: ${userContext.coachSettings.riskLevel}` : ""}

Overall Progress: ${userContext.overallProgress}%

Subject-wise Progress:
${userContext.subjects?.map((s: { name: string; progress: number }) => `- ${s.name}: ${s.progress}%`).join("\n") || "No data available"}
===

Use this data to provide personalized advice. Reference their actual progress when giving suggestions.
If they're behind on certain subjects, prioritize those in your recommendations.
`;
    }

    const systemPrompt = `You are a helpful AI study assistant for HSC (Higher Secondary Certificate) students in Bangladesh. 
You help students with:
- Study tips and strategies
- Subject-specific guidance for Physics, Chemistry, Biology, Higher Math, ICT, English, and Bangla
- Motivation and study planning
- Answering academic questions
- Exam preparation tips

Be friendly, encouraging, and supportive. Keep responses concise but helpful.
You can respond in both Bengali and English based on the user's language preference.
Always be positive and motivating to help students succeed in their HSC exams.
${userDataContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please try again later." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const errorText = await response.text();
      console.error("AI gateway error response:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Streaming response from AI gateway");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
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
