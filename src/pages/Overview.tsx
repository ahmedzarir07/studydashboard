import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, TrendingUp, BookOpen, CheckCircle2, Clock, Activity, FileText, ClipboardList, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import { SubjectAnalyticsSection, PerformanceStatsRow } from "@/components/overview/SubjectAnalyticsSection";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { physicsData } from "@/data/physicsData";
import { physics2ndData } from "@/data/physics2ndData";
import { chemistryData } from "@/data/chemistryData";
import { chemistry2ndData } from "@/data/chemistry2ndData";
import { higherMathData } from "@/data/higherMathData";
import { higherMath2ndData } from "@/data/higherMath2ndData";
import { biologyData } from "@/data/biologyData";
import { biology2ndData } from "@/data/biology2ndData";
import { ictData } from "@/data/ictData";
import { english1stData } from "@/data/english1stData";
import { english2ndData } from "@/data/english2ndData";
import { bangla1stData } from "@/data/bangla1stData";
import { bangla2ndData } from "@/data/bangla2ndData";

const allSubjects = [
  { data: physicsData, label: "Physics 1st", short: "Phy 1", color: "hsl(217 91% 60%)" },
  { data: physics2ndData, label: "Physics 2nd", short: "Phy 2", color: "hsl(199 89% 60%)" },
  { data: chemistryData, label: "Chemistry 1st", short: "Chem 1", color: "hsl(142 76% 45%)" },
  { data: chemistry2ndData, label: "Chemistry 2nd", short: "Chem 2", color: "hsl(142 71% 55%)" },
  { data: higherMathData, label: "Higher Math 1st", short: "HM 1", color: "hsl(262 83% 58%)" },
  { data: higherMath2ndData, label: "Higher Math 2nd", short: "HM 2", color: "hsl(262 78% 68%)" },
  { data: biologyData, label: "Biology 1st", short: "Bio 1", color: "hsl(25 95% 53%)" },
  { data: biology2ndData, label: "Biology 2nd", short: "Bio 2", color: "hsl(25 90% 63%)" },
  { data: ictData, label: "ICT", short: "ICT", color: "hsl(199 89% 48%)" },
  { data: english1stData, label: "English 1st", short: "Eng 1", color: "hsl(340 82% 52%)" },
  { data: english2ndData, label: "English 2nd", short: "Eng 2", color: "hsl(280 70% 55%)" },
  { data: bangla1stData, label: "বাংলা ১ম পত্র", short: "বাংলা ১", color: "hsl(45 93% 47%)" },
  { data: bangla2ndData, label: "বাংলা ২য় পত্র", short: "বাংলা ২", color: "hsl(35 90% 50%)" },
];

interface SubjectProgress {
  id: string;
  label: string;
  short: string;
  color: string;
  totalChapters: number;
  completedChapters: number;
  totalActivities: number;
  completedActivities: number;
  progressPercent: number;
}

export interface DbStats {
  totalCompletedChapters: number;
  totalStudyRecords: number;
  doneRecords: number;
  inProgressRecords: number;
  totalMonthlyPlans: number;
  currentMonthPlans: number;
  totalResources: number;
  coachRiskLevel: string | null;
  coachMonthsRemaining: number | null;
  coachCompletionPercent: number | null;
  recentActivityDays: number;
  mostActiveSubject: string | null;
  mostActiveSubjectCount: number;
}

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studyRecords, setStudyRecords] = useState<Map<string, Set<string>>>(new Map());
  const [chapterCompletions, setChapterCompletions] = useState<Set<string>>(new Set());
  const [dbStats, setDbStats] = useState<DbStats>({
    totalCompletedChapters: 0,
    totalStudyRecords: 0,
    doneRecords: 0,
    inProgressRecords: 0,
    totalMonthlyPlans: 0,
    currentMonthPlans: 0,
    totalResources: 0,
    coachRiskLevel: null,
    coachMonthsRemaining: null,
    coachCompletionPercent: null,
    recentActivityDays: 0,
    mostActiveSubject: null,
    mostActiveSubjectCount: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const now = new Date();
      const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [recordsRes, completionsRes, allPlansRes, currentPlansRes, resourcesRes, coachRes, recentRes] = await Promise.all([
        supabase.from("study_records").select("subject, chapter, activity, status").eq("user_id", user.id).eq("type", "status"),
        supabase.from("chapter_completions").select("subject, chapter, completed").eq("user_id", user.id).eq("completed", true),
        supabase.from("monthly_study_plans").select("id").eq("user_id", user.id),
        supabase.from("monthly_study_plans").select("id").eq("user_id", user.id).eq("month_year", currentMonthYear),
        supabase.from("chapter_resources").select("id").eq("user_id", user.id),
        supabase.from("study_coach_settings").select("risk_level, months_remaining, completion_percentage").eq("user_id", user.id).single(),
        supabase.from("study_records").select("subject, updated_at").eq("user_id", user.id).gte("updated_at", sevenDaysAgo),
      ]);

      const records = recordsRes.data || [];
      const completions = completionsRes.data || [];

      const recordMap = new Map<string, Set<string>>();
      let doneCount = 0;
      let inProgressCount = 0;
      const subjectActivityCounts = new Map<string, number>();

      records.forEach((r) => {
        if (r.status === "Done") {
          doneCount++;
          const key = `${r.subject}-${r.chapter}`;
          if (!recordMap.has(key)) recordMap.set(key, new Set());
          recordMap.get(key)!.add(r.activity);
        } else if (r.status === "In progress") {
          inProgressCount++;
        }
        subjectActivityCounts.set(r.subject, (subjectActivityCounts.get(r.subject) || 0) + 1);
      });
      setStudyRecords(recordMap);

      const completionSet = new Set<string>();
      completions.forEach((c) => completionSet.add(`${c.subject}-${c.chapter}`));
      setChapterCompletions(completionSet);

      let mostActiveSub: string | null = null;
      let mostActiveCount = 0;
      subjectActivityCounts.forEach((count, subject) => {
        if (count > mostActiveCount) { mostActiveCount = count; mostActiveSub = subject; }
      });

      const activeDays = new Set<string>();
      (recentRes.data || []).forEach((r) => {
        if (r.updated_at) activeDays.add(r.updated_at.slice(0, 10));
      });

      setDbStats({
        totalCompletedChapters: completions.length,
        totalStudyRecords: records.length,
        doneRecords: doneCount,
        inProgressRecords: inProgressCount,
        totalMonthlyPlans: allPlansRes.data?.length || 0,
        currentMonthPlans: currentPlansRes.data?.length || 0,
        totalResources: resourcesRes.data?.length || 0,
        coachRiskLevel: coachRes.data?.risk_level || null,
        coachMonthsRemaining: coachRes.data?.months_remaining ?? null,
        coachCompletionPercent: coachRes.data?.completion_percentage ?? null,
        recentActivityDays: activeDays.size,
        mostActiveSubject: mostActiveSub,
        mostActiveSubjectCount: mostActiveCount,
      });

      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  const subjectProgress = useMemo<SubjectProgress[]>(() => {
    return allSubjects.map((subject) => {
      const totalChapters = subject.data.chapters.length;
      let completedChapters = 0;
      let totalActivities = 0;
      let completedActivities = 0;

      subject.data.chapters.forEach((chapter) => {
        const key = `${subject.data.id}-${chapter.name}`;
        const chapterActivities = chapter.activities.length;
        totalActivities += chapterActivities;

        const completed = studyRecords.get(key);
        if (completed) {
          completedActivities += completed.size;
        }

        if (chapterCompletions.has(key)) {
          completedChapters++;
        }
      });

      const progressPercent = totalActivities > 0 
        ? Math.round((completedActivities / totalActivities) * 100) 
        : 0;

      return {
        id: subject.data.id,
        label: subject.label,
        short: subject.short,
        color: subject.color,
        totalChapters,
        completedChapters,
        totalActivities,
        completedActivities,
        progressPercent,
      };
    });
  }, [studyRecords, chapterCompletions]);

  const overallStats = useMemo(() => {
    const totalSubjects = subjectProgress.length;
    const totalChapters = subjectProgress.reduce((sum, s) => sum + s.totalChapters, 0);
    const completedChapters = subjectProgress.reduce((sum, s) => sum + s.completedChapters, 0);
    const totalActivities = subjectProgress.reduce((sum, s) => sum + s.totalActivities, 0);
    const completedActivities = subjectProgress.reduce((sum, s) => sum + s.completedActivities, 0);
    const overallPercent = totalActivities > 0 
      ? Math.round((completedActivities / totalActivities) * 100) 
      : 0;

    return {
      totalSubjects,
      totalChapters,
      completedChapters,
      totalActivities,
      completedActivities,
      overallPercent,
    };
  }, [subjectProgress]);

  const handleSubjectClick = (index: number) => {
    navigate(`/tracker?tab=${index}`);
  };

  if (!user) return null;

  return (
    <AppLayout title="Overview">
      <main className="px-4 py-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Performance Analysis - At Top */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Performance Analysis
                </h3>
              </div>
              <PerformanceStatsRow dbStats={dbStats} />
            </div>

            {/* Subject-wise Breakdown Charts - 2nd from Top */}
            <Card className="border-border/50 bg-card/60 mb-6">
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                      Subject-wise Breakdown
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Activity-level progress breakdown for each subject with interactive charts.
                    </p>
                  </div>
                </div>
                <SubjectAnalyticsSection />
              </CardContent>
            </Card>

            {/* Overall Progress Card */}
            <Card className="border-border/50 bg-card/60 mb-6">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-secondary text-secondary-foreground">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                      Overall Progress
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Combined progress across all subjects with activity and chapter counts.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-3xl font-bold text-foreground">
                      {overallStats.overallPercent}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {overallStats.completedActivities} / {overallStats.totalActivities} activities
                    </span>
                  </div>
                  <Progress value={overallStats.overallPercent} className="h-3" />

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-semibold text-foreground">{overallStats.totalSubjects}</p>
                      <p className="text-xs text-muted-foreground">Subjects</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-lg font-semibold text-foreground">{overallStats.completedChapters}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                      <p className="text-lg font-semibold text-foreground">
                        {overallStats.totalChapters - overallStats.completedChapters}
                      </p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject Progress List */}
            <Card className="border-border/50 bg-card/60">
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-accent text-accent-foreground">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                      Subject Breakdown
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Progress breakdown for each subject with chapter and activity counts.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {subjectProgress.map((subject, index) => (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectClick(index)}
                      className="w-full bg-muted/30 hover:bg-muted/50 rounded-xl p-4 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {subject.label}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {subject.progressPercent}%
                        </span>
                      </div>
                      
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${subject.progressPercent}%`,
                            backgroundColor: subject.color,
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>{subject.completedChapters}/{subject.totalChapters} chapters</span>
                        <span>{subject.completedActivities}/{subject.totalActivities} activities</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </AppLayout>
  );
}
