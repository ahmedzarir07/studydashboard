import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      throw new Error("API key not configured");
    }

    // Format progress data for AI
    const formattedData = formatProgressForAI(progressData);

    console.log("Calling OpenAI API with gpt-4.1-mini model...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini-2025-04-14",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: formattedData },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন। (Rate limit exceeded)" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "API কনফিগারেশনে সমস্যা আছে।" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "এই মুহূর্তে AI বিশ্লেষণ লোড করা যাচ্ছে না। পরে আবার চেষ্টা করুন।" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "বিশ্লেষণ তৈরি করা সম্ভব হয়নি।";

    console.log("Analysis generated successfully");

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-progress function:", error);
    return new Response(
      JSON.stringify({ error: "এই মুহূর্তে AI বিশ্লেষণ লোড করা যাচ্ছে না। পরে আবার চেষ্টা করুন।" }),
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
