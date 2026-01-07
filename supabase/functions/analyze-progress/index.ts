import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are an AI progress analyst for HSC science students.

Analyze the provided study progress data and return:
- Clear overall insights
- Subject-wise strengths and weaknesses
- Specific problems in consistency or coverage
- Practical study actions for the next 3–7 days

Rules:
- Respond in Bangla ONLY
- Use short bullet points
- Follow exactly this structure:
  1. সার্বিক বিশ্লেষণ (Overall Analysis)
  2. বিষয়ভিত্তিক পর্যালোচনা (Subject-wise Insights)
  3. সমস্যা চিহ্নিতকরণ (Problems Detected)
  4. পরবর্তী ৩-৭ দিনের কর্মপরিকল্পনা (Actionable Suggestions)
- Do not ask questions
- Do not give motivational quotes
- Do not explain theory
- Do not solve academic questions
- Be concise and practical
- Focus on what needs improvement and specific actions`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { progressData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format progress data for AI
    const formattedData = formatProgressForAI(progressData);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: formattedData },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন। (Rate limit exceeded)" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "সার্ভিস সাময়িকভাবে অনুপলব্ধ। (Service unavailable)" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI বিশ্লেষণে সমস্যা হয়েছে।" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "বিশ্লেষণ তৈরি করা সম্ভব হয়নি।";

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-progress function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatProgressForAI(data: {
  overallProgress: number;
  subjects: Array<{ name: string; fullName: string; progress: number }>;
}): string {
  const lines = [
    `সার্বিক অগ্রগতি: ${data.overallProgress}%`,
    "",
    "বিষয়ভিত্তিক অগ্রগতি:",
  ];

  data.subjects.forEach((subject) => {
    lines.push(`- ${subject.fullName} (${subject.name}): ${subject.progress}%`);
  });

  // Add some context for the AI
  const lowProgress = data.subjects.filter((s) => s.progress < 30);
  const mediumProgress = data.subjects.filter((s) => s.progress >= 30 && s.progress < 60);
  const highProgress = data.subjects.filter((s) => s.progress >= 60);

  lines.push("");
  lines.push(`দুর্বল বিষয় (<30%): ${lowProgress.length}টি`);
  lines.push(`মাঝারি বিষয় (30-60%): ${mediumProgress.length}টি`);
  lines.push(`ভালো বিষয় (>60%): ${highProgress.length}টি`);

  return lines.join("\n");
}
