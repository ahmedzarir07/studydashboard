import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowDown, Flame, BookOpenCheck, CalendarCheck, Link2, AlertTriangle } from "lucide-react";
import { useSubjectAnalytics } from "@/hooks/useSubjectAnalytics";
import { useProgressSnapshot } from "@/hooks/useProgressSnapshot";
import type { DbStats } from "@/pages/Overview";

// Map subject IDs to tracker tab indices
const subjectTabIndex: Record<string, number> = {
  "physics": 0, "physics2nd": 1, "chemistry": 2, "chemistry2nd": 3,
  "highermath": 4, "highermath2nd": 5, "biology": 6, "biology2nd": 7,
  "ict": 8, "english1st": 9, "english2nd": 10, "bangla1st": 11, "bangla2nd": 12,
};

// Subject ID to display name
const subjectDisplayNames: Record<string, string> = {
  "physics": "Physics 1st", "physics2nd": "Physics 2nd",
  "chemistry": "Chemistry 1st", "chemistry2nd": "Chemistry 2nd",
  "highermath": "HM 1st", "highermath2nd": "HM 2nd",
  "biology": "Biology 1st", "biology2nd": "Biology 2nd",
  "ict": "ICT", "english1st": "English 1st", "english2nd": "English 2nd",
  "bangla1st": "Bangla 1st", "bangla2nd": "Bangla 2nd",
};

interface StatCardProps {
  label: string;
  value: string;
  percentage: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  onClick?: () => void;
  icon?: "navigate" | "scroll";
  iconElement?: React.ReactNode;
}

const StatCard = ({ label, value, percentage, variant = "default", onClick, icon, iconElement }: StatCardProps) => {
  const variantStyles = {
    default: "border-border/50",
    success: "border-emerald-500/30",
    warning: "border-amber-500/30",
    danger: "border-destructive/30",
    info: "border-blue-500/30",
  };

  const percentageColors = {
    default: "text-muted-foreground",
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-destructive",
    info: "text-blue-500",
  };

  const iconColors = {
    default: "text-muted-foreground",
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-destructive",
    info: "text-blue-500",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-card/60 rounded-xl p-4 border ${variantStyles[variant]} backdrop-blur-sm text-center transition-all relative group ${onClick ? "cursor-pointer hover:bg-card/80 hover:scale-[1.02] active:scale-[0.98]" : ""}`}
    >
      {iconElement && (
        <div className={`mx-auto mb-1.5 ${iconColors[variant]}`}>
          {iconElement}
        </div>
      )}
      {onClick && icon && !iconElement && (
        <div className={`absolute top-2 right-2 ${iconColors[variant]} opacity-50 group-hover:opacity-100 transition-opacity`}>
          {icon === "navigate" ? (
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-foreground text-sm mb-1 line-clamp-2">{value}</p>
      <p className={`text-sm font-bold ${percentageColors[variant]}`}>{percentage}</p>
    </div>
  );
};

interface PerformanceStatsRowProps {
  dbStats?: DbStats;
}

export const PerformanceStatsRow = ({ dbStats }: PerformanceStatsRowProps) => {
  const navigate = useNavigate();
  const { activityProgressList } = useSubjectAnalytics();
  const { subjects } = useProgressSnapshot();

  const stats = useMemo(() => {
    const sortedSubjects = [...subjects].sort((a, b) => b.progress - a.progress);
    const topSubject = sortedSubjects[0];
    const leastSubject = sortedSubjects[sortedSubjects.length - 1];

    const typeAggregates: Record<string, { total: number; count: number }> = {};
    activityProgressList.forEach((item) => {
      if (!typeAggregates[item.activity]) typeAggregates[item.activity] = { total: 0, count: 0 };
      typeAggregates[item.activity].total += item.percentage;
      typeAggregates[item.activity].count++;
    });

    const typeAverages = Object.entries(typeAggregates).map(([activity, data]) => ({
      activity, average: data.count > 0 ? Math.round(data.total / data.count) : 0,
    }));
    const sortedTypes = [...typeAverages].sort((a, b) => b.average - a.average);

    return {
      topSubject: { id: topSubject?.id || "", name: topSubject?.fullName || topSubject?.name || "N/A", percentage: topSubject?.progress ?? 0 },
      leastSubject: { id: leastSubject?.id || "", name: leastSubject?.fullName || leastSubject?.name || "N/A", percentage: leastSubject?.progress ?? 0 },
      strongestType: { name: sortedTypes[0]?.activity || "N/A", percentage: sortedTypes[0]?.average ?? 0 },
      weakestType: { name: sortedTypes[sortedTypes.length - 1]?.activity || "N/A", percentage: sortedTypes[sortedTypes.length - 1]?.average ?? 0 },
    };
  }, [subjects, activityProgressList]);

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/tracker?tab=${subjectTabIndex[subjectId] ?? 0}`);
  };

  const scrollToBreakdown = () => {
    document.querySelector('[data-section="subject-breakdown"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Risk level color mapping
  const riskVariant = dbStats?.coachRiskLevel === "high" ? "danger" as const
    : dbStats?.coachRiskLevel === "medium" ? "warning" as const
    : "success" as const;

  return (
    <div className="space-y-3">
      {/* Row 1: Core Performance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Top Subject"
          value={stats.topSubject.name}
          percentage={`${stats.topSubject.percentage.toFixed(1)}%`}
          variant="success"
          onClick={() => handleSubjectClick(stats.topSubject.id)}
          icon="navigate"
        />
        <StatCard
          label="Least Covered"
          value={stats.leastSubject.name}
          percentage={`${stats.leastSubject.percentage.toFixed(1)}%`}
          variant="danger"
          onClick={() => handleSubjectClick(stats.leastSubject.id)}
          icon="navigate"
        />
        <StatCard
          label="Strongest Study Type"
          value={stats.strongestType.name}
          percentage={`${stats.strongestType.percentage.toFixed(1)}%`}
          variant="success"
          onClick={scrollToBreakdown}
          icon="scroll"
        />
        <StatCard
          label="Needs Focus In"
          value={stats.weakestType.name}
          percentage={`${stats.weakestType.percentage.toFixed(1)}%`}
          variant="warning"
          onClick={scrollToBreakdown}
          icon="scroll"
        />
      </div>

      {/* Row 2: Database Stats */}
      {dbStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Completed Chapters"
            value={`${dbStats.totalCompletedChapters}`}
            percentage={`${dbStats.doneRecords} done activities`}
            variant="success"
            iconElement={<BookOpenCheck className="h-4 w-4" />}
          />
          <StatCard
            label="This Month's Plans"
            value={`${dbStats.currentMonthPlans} chapters`}
            percentage={`${dbStats.totalMonthlyPlans} total plans`}
            variant="info"
            iconElement={<CalendarCheck className="h-4 w-4" />}
            onClick={() => navigate("/monthly-planning")}
            icon="navigate"
          />
          <StatCard
            label="Active Days (7d)"
            value={`${dbStats.recentActivityDays}/7 days`}
            percentage={dbStats.mostActiveSubject ? `Most: ${subjectDisplayNames[dbStats.mostActiveSubject] || dbStats.mostActiveSubject}` : "No activity"}
            variant={dbStats.recentActivityDays >= 5 ? "success" : dbStats.recentActivityDays >= 3 ? "warning" : "danger"}
            iconElement={<Flame className="h-4 w-4" />}
          />
          <StatCard
            label="Saved Resources"
            value={`${dbStats.totalResources} resources`}
            percentage={dbStats.inProgressRecords > 0 ? `${dbStats.inProgressRecords} in progress` : "Keep saving!"}
            variant="default"
            iconElement={<Link2 className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Row 3: Coach Status (if available) */}
      {dbStats && dbStats.coachRiskLevel && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            label="Risk Level"
            value={dbStats.coachRiskLevel.charAt(0).toUpperCase() + dbStats.coachRiskLevel.slice(1)}
            percentage={dbStats.coachMonthsRemaining !== null ? `${dbStats.coachMonthsRemaining} months left` : ""}
            variant={riskVariant}
            iconElement={<AlertTriangle className="h-4 w-4" />}
          />
          <StatCard
            label="Total Activities"
            value={`${dbStats.totalStudyRecords}`}
            percentage={`${dbStats.doneRecords} done, ${dbStats.inProgressRecords} ongoing`}
            variant="default"
          />
          {dbStats.coachCompletionPercent !== null && (
            <StatCard
              label="Coach Completion"
              value={`${dbStats.coachCompletionPercent}%`}
              percentage="Based on coach analysis"
              variant={dbStats.coachCompletionPercent >= 70 ? "success" : dbStats.coachCompletionPercent >= 40 ? "warning" : "danger"}
            />
          )}
        </div>
      )}
    </div>
  );
};
