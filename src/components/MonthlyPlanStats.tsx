import { useMemo } from "react";
import { Target, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { MonthlyPlan } from "@/hooks/useMonthlyPlans";

interface MonthlyPlanStatsProps {
  plans: MonthlyPlan[];
  completedActivitiesMap: Map<string, string[]>;
}

export function MonthlyPlanStats({ plans, completedActivitiesMap }: MonthlyPlanStatsProps) {
  const stats = useMemo(() => {
    let totalPlanned = 0;
    let totalCompleted = 0;
    const subjectProgress: Record<string, { planned: number; completed: number }> = {};

    plans.forEach((plan) => {
      const completedActivities = completedActivitiesMap.get(`${plan.subject}-${plan.chapter}`) || [];
      const planned = plan.planned_activities.length;
      const completed = plan.planned_activities.filter((a) =>
        completedActivities.includes(a)
      ).length;

      totalPlanned += planned;
      totalCompleted += completed;

      if (!subjectProgress[plan.subject]) {
        subjectProgress[plan.subject] = { planned: 0, completed: 0 };
      }
      subjectProgress[plan.subject].planned += planned;
      subjectProgress[plan.subject].completed += completed;
    });

    return {
      totalChapters: plans.length,
      totalPlanned,
      totalCompleted,
      progressPercent: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0,
      subjectProgress,
    };
  }, [plans, completedActivitiesMap]);

  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card/60 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            <span className="text-xs">Chapters</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalChapters}</p>
        </div>
        <div className="bg-card/60 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Progress</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.progressPercent}%</p>
        </div>
        <div className="bg-card/60 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Planned</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalPlanned}</p>
        </div>
        <div className="bg-card/60 rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">Completed</span>
          </div>
          <p className="text-2xl font-bold text-primary">{stats.totalCompleted}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Monthly Progress</span>
          <span className="text-sm text-muted-foreground">
            {stats.totalCompleted}/{stats.totalPlanned}
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Subject Breakdown */}
      {Object.keys(stats.subjectProgress).length > 0 && (
        <div className="bg-card/60 rounded-xl p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">By Subject</h3>
          <div className="space-y-2">
            {Object.entries(stats.subjectProgress).map(([subject, { planned, completed }]) => {
              const percent = planned > 0 ? Math.round((completed / planned) * 100) : 0;
              return (
                <div key={subject} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate">{subject}</span>
                    <span className="text-foreground font-medium">{percent}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
