import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Download, Calendar, Loader2, ArrowRightLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMonthlyPlans } from "@/hooks/useMonthlyPlans";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { MonthSelector } from "@/components/MonthSelector";
import { MonthlyPlanStats } from "@/components/MonthlyPlanStats";
import { PlanningChapterCard } from "@/components/PlanningChapterCard";
import { MoveMonthDialog } from "@/components/MoveMonthDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { generateMonthlyPlanPDF } from "@/lib/monthlyPlanPdfGenerator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { physicsData } from "@/data/physicsData";
import { physics2ndData } from "@/data/physics2ndData";
import { chemistryData } from "@/data/chemistryData";
import { chemistry2ndData } from "@/data/chemistry2ndData";
import { higherMathData } from "@/data/higherMathData";
import { higherMath2ndData } from "@/data/higherMath2ndData";
import { biologyData } from "@/data/biologyData";
import { biology2ndData } from "@/data/biology2ndData";
import { ictData } from "@/data/ictData";

const allSubjects = [
  { data: physicsData, label: "Phy 1" },
  { data: physics2ndData, label: "Phy 2" },
  { data: chemistryData, label: "Chem 1" },
  { data: chemistry2ndData, label: "Chem 2" },
  { data: higherMathData, label: "HM 1" },
  { data: higherMath2ndData, label: "HM 2" },
  { data: biologyData, label: "Bio 1" },
  { data: biology2ndData, label: "Bio 2" },
  { data: ictData, label: "ICT" },
];

export default function MonthlyPlanning() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [studyRecords, setStudyRecords] = useState<Map<string, string[]>>(new Map());
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  const monthYear = format(selectedMonth, "yyyy-MM");
  const { plans, loading, savePlan, deletePlan, movePlansToMonth, getPlan, refetch } = useMonthlyPlans(monthYear);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch study records for completed activities
  useEffect(() => {
    if (!user) return;

    const fetchRecords = async () => {
      setLoadingRecords(true);
      const { data } = await supabase
        .from("study_records")
        .select("subject, chapter, activity, status")
        .eq("user_id", user.id)
        .eq("type", "status")
        .eq("status", "Done");

      const recordMap = new Map<string, string[]>();
      data?.forEach((r) => {
        const key = `${r.subject}-${r.chapter}`;
        if (!recordMap.has(key)) {
          recordMap.set(key, []);
        }
        recordMap.get(key)!.push(r.activity);
      });
      setStudyRecords(recordMap);
      setLoadingRecords(false);
    };

    fetchRecords();
  }, [user, monthYear]);

  const activeSubject = allSubjects[activeSubjectIndex];

  const handleSavePlan = async (
    chapter: string,
    activities: string[],
    goals: string,
    notes: string
  ) => {
    if (activities.length === 0) {
      await deletePlan(activeSubject.data.id, chapter);
    } else {
      await savePlan(activeSubject.data.id, chapter, activities, goals, notes);
    }
  };

  const handleRemovePlan = async (chapter: string) => {
    await deletePlan(activeSubject.data.id, chapter);
  };

  const handleDownloadPDF = async () => {
    if (!user?.email) return;
    await generateMonthlyPlanPDF(
      user.email,
      format(selectedMonth, "MMMM yyyy"),
      plans,
      studyRecords,
      allSubjects
    );
  };

  const handleMovePlans = async (targetMonthYear: string) => {
    const error = await movePlansToMonth(targetMonthYear);
    if (error) {
      toast.error("Failed to move plans");
    } else {
      toast.success(`Moved ${plans.length} plans to ${format(new Date(targetMonthYear + "-01"), "MMMM yyyy")}`);
    }
  };

  const completedActivitiesMap = useMemo(() => {
    return studyRecords;
  }, [studyRecords]);

  if (!user) {
    return null;
  }

  const isLoading = loading || loadingRecords;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader title="Monthly Planning" />

      <main className="px-4 py-4 max-w-4xl mx-auto">
        {/* Month Selector */}
        <MonthSelector
          currentMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        {/* Download Button */}
        <div className="flex justify-end gap-2 mt-4">
          {plans.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMoveDialogOpen(true)}
              className="gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Move to Another Month
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={plans.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Move Month Dialog */}
        <MoveMonthDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          currentMonth={selectedMonth}
          plansCount={plans.length}
          onMove={handleMovePlans}
        />

        {/* Stats Overview */}
        <div className="mt-4">
          <MonthlyPlanStats
            plans={plans}
            completedActivitiesMap={completedActivitiesMap}
          />
        </div>

        {/* Tabs for View Mode */}
        <Tabs defaultValue="plan" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="plan" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Plan
            </TabsTrigger>
            <TabsTrigger value="review" className="flex-1">
              Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="mt-4">
            {/* Subject Pills */}
            <div className="mb-4 -mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth-touch pb-2">
                {allSubjects.map((subject, index) => {
                  const isActive = index === activeSubjectIndex;
                  const subjectPlans = plans.filter(
                    (p) => p.subject === subject.data.id
                  );
                  return (
                    <button
                      key={subject.data.id}
                      onClick={() => setActiveSubjectIndex(index)}
                      className={cn(
                        "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all min-h-[40px]",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/60 text-muted-foreground active:bg-card"
                      )}
                    >
                      <span>{subject.label}</span>
                      {subjectPlans.length > 0 && (
                        <span
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full",
                            isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-primary/20 text-primary"
                          )}
                        >
                          {subjectPlans.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chapter List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {activeSubject.data.chapters.map((chapter) => {
                  const plan = getPlan(activeSubject.data.id, chapter.name);
                  const completedActivities =
                    studyRecords.get(`${activeSubject.data.id}-${chapter.name}`) || [];

                  return (
                    <PlanningChapterCard
                      key={chapter.id}
                      chapterName={chapter.name}
                      activities={chapter.activities}
                      plannedActivities={plan?.planned_activities || []}
                      completedActivities={completedActivities}
                      goals={plan?.goals || ""}
                      notes={plan?.notes || ""}
                      onSave={(activities, goals, notes) =>
                        handleSavePlan(chapter.name, activities, goals, notes)
                      }
                      onRemove={() => handleRemovePlan(chapter.name)}
                      isPlanned={!!plan}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="review" className="mt-4">
            {plans.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  No plans for {format(selectedMonth, "MMMM yyyy")}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Start by adding chapters to your plan
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allSubjects.map((subject) => {
                  const subjectPlans = plans.filter(
                    (p) => p.subject === subject.data.id
                  );
                  if (subjectPlans.length === 0) return null;

                  return (
                    <div key={subject.data.id} className="bg-card/60 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        {subject.data.name}
                      </h3>
                      <div className="space-y-2">
                        {subjectPlans.map((plan) => {
                          const completedActivities =
                            studyRecords.get(`${plan.subject}-${plan.chapter}`) || [];
                          const completed = plan.planned_activities.filter((a) =>
                            completedActivities.includes(a)
                          ).length;
                          const total = plan.planned_activities.length;
                          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                          return (
                            <div
                              key={plan.id}
                              className="bg-background/50 rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-foreground truncate">
                                  {plan.chapter}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {completed}/{total}
                                </span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    percent === 100 ? "bg-green-500" : "bg-primary"
                                  )}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              {plan.goals && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                                  Goal: {plan.goals}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
