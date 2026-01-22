import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are an AI Study Analyzer for HSC science students.

You have full access to:
- Monthly plan data (planned chapters and activities)
- Subject-wise progress (current completion %)
- Completed vs planned chapters comparison
- Study consistency history

Your rules:
1. Always prioritize MONTHLY completion status
2. Analyze which subjects are most behind their plan
3. Show percentage-based gaps clearly
4. Warn if monthly pace is insufficient
5. Highlight risk areas logically
6. Never give daily tasks or routines
7. Never tell the user what to study
8. Do not motivate emotionally
9. Speak short, clear Bangla ONLY
10. Your job is to reflect reality, not guide actions

Output format (follow exactly):
১. মাসিক অবস্থা (Monthly Status)
   - পরিকল্পিত vs সম্পন্ন অধ্যায়
   - সম্পন্নতার হার

২. বিষয়ভিত্তিক ঝুঁকি (Subject-wise Risk)
   - সবচেয়ে পিছিয়ে থাকা বিষয়
   - গ্যাপ শতাংশ

৩. সতর্কতা (Warning - if needed)
   - মাসিক গতি অপর্যাপ্ত হলে

৪. বাস্তবতা (Reality Check)
   - এক লাইনে সংক্ষিপ্ত মূল্যায়ন`;

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

interface MonthlyPlanData {
  totalPlannedChapters: number;
  totalPlannedActivities: number;
  completedPlannedChapters: number;
  completedPlannedActivities: number;
  subjectPlans: Array<{
    subject: string;
    plannedChapters: number;
    completedChapters: number;
    plannedActivities: number;
    completedActivities: number;
  }>;
}

function formatProgressForAI(data: {
  overallProgress: number;
  subjects: Array<{ name: string; fullName: string; progress: number }>;
  monthlyPlan?: MonthlyPlanData;
  currentMonth?: string;
}): string {
  const lines: string[] = [];
  
  // Monthly Plan Status (Priority)
  if (data.monthlyPlan && data.currentMonth) {
    const plan = data.monthlyPlan;
    const chapterCompletionRate = plan.totalPlannedChapters > 0 
      ? Math.round((plan.completedPlannedChapters / plan.totalPlannedChapters) * 100) 
      : 0;
    const activityCompletionRate = plan.totalPlannedActivities > 0 
      ? Math.round((plan.completedPlannedActivities / plan.totalPlannedActivities) * 100) 
      : 0;
    
    lines.push(`=== ${data.currentMonth} মাসিক পরিকল্পনা ===`);
    lines.push(`পরিকল্পিত অধ্যায়: ${plan.totalPlannedChapters}টি`);
    lines.push(`সম্পন্ন অধ্যায়: ${plan.completedPlannedChapters}টি (${chapterCompletionRate}%)`);
    lines.push(`পরিকল্পিত কার্যক্রম: ${plan.totalPlannedActivities}টি`);
    lines.push(`সম্পন্ন কার্যক্রম: ${plan.completedPlannedActivities}টি (${activityCompletionRate}%)`);
    lines.push("");
    
    // Subject-wise monthly plan breakdown
    if (plan.subjectPlans.length > 0) {
      lines.push("বিষয়ভিত্তিক মাসিক অবস্থা:");
      plan.subjectPlans.forEach((sp) => {
        const chapterRate = sp.plannedChapters > 0 
          ? Math.round((sp.completedChapters / sp.plannedChapters) * 100) 
          : 0;
        const gap = sp.plannedChapters - sp.completedChapters;
        lines.push(`- ${sp.subject}: ${sp.completedChapters}/${sp.plannedChapters} অধ্যায় (${chapterRate}%) | গ্যাপ: ${gap}টি`);
      });
      lines.push("");
    }
  } else {
    lines.push("=== মাসিক পরিকল্পনা নেই ===");
    lines.push("ব্যবহারকারী এই মাসে কোনো পরিকল্পনা তৈরি করেননি।");
    lines.push("");
  }
  
  // Overall Progress
  lines.push(`=== সার্বিক অগ্রগতি: ${data.overallProgress}% ===`);
  lines.push("");
  lines.push("বিষয়ভিত্তিক অগ্রগতি:");

  // Sort subjects by progress (lowest first for risk identification)
  const sortedSubjects = [...data.subjects].sort((a, b) => a.progress - b.progress);
  
  sortedSubjects.forEach((subject) => {
    const riskLabel = subject.progress < 20 ? "[উচ্চ ঝুঁকি]" 
      : subject.progress < 40 ? "[মাঝারি ঝুঁকি]" 
      : "";
    lines.push(`- ${subject.fullName}: ${subject.progress}% ${riskLabel}`);
  });

  // Risk summary
  const highRisk = data.subjects.filter((s) => s.progress < 20);
  const mediumRisk = data.subjects.filter((s) => s.progress >= 20 && s.progress < 40);
  
  lines.push("");
  lines.push("ঝুঁকি সারাংশ:");
  lines.push(`- উচ্চ ঝুঁকি (<20%): ${highRisk.length}টি বিষয়`);
  lines.push(`- মাঝারি ঝুঁকি (20-40%): ${mediumRisk.length}টি বিষয়`);

  return lines.join("\n");
}
