import { useState, useEffect, useMemo } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProgressSnapshot } from "@/hooks/useProgressSnapshot";
import { useMonthlyPlans } from "@/hooks/useMonthlyPlans";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, AlertCircle, Clock, GraduationCap, MessageCircle, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { StudyCoach } from "@/components/StudyCoach";
import { AIChatBox } from "@/components/AIChatBox";
import { AIStudyAnalyst } from "@/components/AIStudyAnalyst";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

const COOLDOWN_KEY = "ai_analysis_last_used";
const COOLDOWN_HOURS = 24;

export default function AIAnalysis() {
  const { user } = useAuth();
  const { overallProgress, subjects, recordMap, loading: progressLoading } = useProgressSnapshot();
  const { plans, currentMonth } = useMonthlyPlans();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);

  // Calculate monthly plan statistics using recordMap from useProgressSnapshot
  const monthlyPlanData = useMemo(() => {
    if (!plans || plans.length === 0) return null;

    // Calculate totals
    let totalPlannedChapters = plans.length;
    let totalPlannedActivities = 0;
    let completedPlannedChapters = 0;
    let completedPlannedActivities = 0;

    // Group by subject
    const subjectMap = new Map<string, {
      plannedChapters: number;
      completedChapters: number;
      plannedActivities: number;
      completedActivities: number;
    }>();

    plans.forEach((plan) => {
      const plannedActivities = plan.planned_activities || [];
      totalPlannedActivities += plannedActivities.length;

      // Check completed activities for this chapter using recordMap
      let chapterCompletedActivities = 0;
      plannedActivities.forEach((activity) => {
        const key = `${plan.subject}-${plan.chapter}-${activity}`;
        const status = recordMap.get(key);
        if (status === "Done") {
          chapterCompletedActivities++;
          completedPlannedActivities++;
        }
      });

      // Chapter is considered complete if all planned activities are done
      const chapterComplete = plannedActivities.length > 0 && 
        chapterCompletedActivities === plannedActivities.length;
      if (chapterComplete) {
        completedPlannedChapters++;
      }

      // Update subject stats
      if (!subjectMap.has(plan.subject)) {
        subjectMap.set(plan.subject, {
          plannedChapters: 0,
          completedChapters: 0,
          plannedActivities: 0,
          completedActivities: 0,
        });
      }
      const subjectStats = subjectMap.get(plan.subject)!;
      subjectStats.plannedChapters++;
      subjectStats.plannedActivities += plannedActivities.length;
      subjectStats.completedActivities += chapterCompletedActivities;
      if (chapterComplete) {
        subjectStats.completedChapters++;
      }
    });

    const subjectPlans = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
      subject,
      ...stats,
    }));

    return {
      totalPlannedChapters,
      totalPlannedActivities,
      completedPlannedChapters,
      completedPlannedActivities,
      subjectPlans,
    };
  }, [plans, recordMap]);

  // Check cooldown on mount
  useEffect(() => {
    checkCooldown();
    const interval = setInterval(checkCooldown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const checkCooldown = () => {
    const lastUsed = localStorage.getItem(COOLDOWN_KEY);
    if (lastUsed) {
      const lastUsedTime = new Date(lastUsed).getTime();
      const now = Date.now();
      const diffMs = now - lastUsedTime;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < COOLDOWN_HOURS) {
        const remainingHours = Math.floor(COOLDOWN_HOURS - diffHours);
        const remainingMins = Math.floor(((COOLDOWN_HOURS - diffHours) % 1) * 60);
        setCooldownRemaining(`${remainingHours}ঘ ${remainingMins}মি`);
        return true;
      }
    }
    setCooldownRemaining(null);
    return false;
  };

  const handleAnalyze = async () => {
    if (!user) {
      toast.error("অনুগ্রহ করে প্রথমে লগইন করুন");
      return;
    }

    if (checkCooldown()) {
      toast.error("দৈনিক সীমা পূর্ণ হয়েছে। পরে আবার চেষ্টা করুন।");
      return;
    }

    if (overallProgress === 0) {
      toast.error("বিশ্লেষণের জন্য কিছু অধ্যায় সম্পন্ন করুন");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      // Format current month for display
      const formattedMonth = format(new Date(currentMonth + "-01"), "MMMM yyyy", { locale: bn });

      const progressData = {
        overallProgress,
        subjects: subjects.map((s) => ({
          name: s.name,
          fullName: s.fullName,
          progress: s.progress,
        })),
        monthlyPlan: monthlyPlanData,
        currentMonth: formattedMonth,
      };

      const { data, error: fnError } = await supabase.functions.invoke("analyze-progress", {
        body: { progressData },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
      localStorage.setItem(COOLDOWN_KEY, new Date().toISOString());
      checkCooldown();
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "বিশ্লেষণে সমস্যা হয়েছে");
      toast.error("বিশ্লেষণ করতে সমস্যা হয়েছে");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAnalysis = (text: string) => {
    // Split by numbered sections
    const sections = text.split(/(?=\d+\.\s)/);
    return sections.filter(Boolean);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <MobileHeader title="AI বিশ্লেষণ" />
        <main className="px-4 py-6 max-w-2xl mx-auto">
          <div className="bg-card/50 rounded-xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">লগইন প্রয়োজন</h2>
            <p className="text-muted-foreground mb-4">
              AI বিশ্লেষণ ব্যবহার করতে অনুগ্রহ করে লগইন করুন
            </p>
            <Link to="/auth">
              <Button>লগইন করুন</Button>
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader title="AI বিশ্লেষণ" />

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        <Tabs defaultValue="analyst" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="analyst" className="gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Study</span> Analyst
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span> Chat
            </TabsTrigger>
            <TabsTrigger value="coach" className="gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <GraduationCap className="h-4 w-4" />
              Coach
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <Sparkles className="h-4 w-4" />
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyst" className="space-y-4">
            <AIStudyAnalyst />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <AIChatBox />
          </TabsContent>
          
          <TabsContent value="coach" className="space-y-4">
            <StudyCoach />
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-6">
            {/* Header Section */}
            <div className="bg-card/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">AI Progress Analysis</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                আপনার পড়াশোনার অগ্রগতি বিশ্লেষণ করে AI পরামর্শ পান। প্রতিদিন একবার ব্যবহার করা যাবে।
              </p>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || progressLoading || !!cooldownRemaining}
                className="w-full gap-2"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    বিশ্লেষণ চলছে...
                  </>
                ) : cooldownRemaining ? (
                  <>
                    <Clock className="h-4 w-4" />
                    পরবর্তী বিশ্লেষণ: {cooldownRemaining} পরে
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    আমার অগ্রগতি বিশ্লেষণ করুন
                  </>
                )}
              </Button>
            </div>

            {/* Current Progress Summary */}
            <div className="bg-card/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">বর্তমান অগ্রগতি</h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
                <div className="text-sm text-muted-foreground">সার্বিক সম্পন্ন</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ভালো (≥60%):</span>
                  <span className="font-medium text-success">
                    {subjects.filter((s) => s.progress >= 60).length}টি
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">দুর্বল (&lt;30%):</span>
                  <span className="font-medium text-destructive">
                    {subjects.filter((s) => s.progress < 30).length}টি
                  </span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">সমস্যা হয়েছে</h4>
                    <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Result */}
            {analysis && (
              <div className="space-y-4">
                <div className="bg-card/50 rounded-xl p-5 space-y-5">
                  {formatAnalysis(analysis).map((section, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{section.trim()}</div>
                      {index < formatAnalysis(analysis).length - 1 && (
                        <div className="border-t border-border/50 pt-4" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-muted-foreground text-center px-4">
                  AI পরামর্শ সহায়ক—অনুসরণ করা বাধ্যতামূলক নয়।
                </p>
              </div>
            )}

            {/* Empty State - No analysis yet */}
            {!analysis && !isAnalyzing && !error && (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  বিশ্লেষণ বাটনে ক্লিক করে আপনার ব্যক্তিগত পরামর্শ দেখুন
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
