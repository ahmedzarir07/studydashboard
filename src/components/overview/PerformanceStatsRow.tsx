import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useSubjectAnalytics } from "@/hooks/useSubjectAnalytics";
import { useProgressSnapshot } from "@/hooks/useProgressSnapshot";

// Map subject IDs to tracker tab indices
const subjectTabIndex: Record<string, number> = {
  "physics": 0,
  "physics2nd": 1,
  "chemistry": 2,
  "chemistry2nd": 3,
  "highermath": 4,
  "highermath2nd": 5,
  "biology": 6,
  "biology2nd": 7,
  "ict": 8,
  "english1st": 9,
  "english2nd": 10,
  "bangla1st": 11,
  "bangla2nd": 12,
};

interface StatCardProps {
  label: string;
  value: string;
  percentage: string;
  variant?: "default" | "success" | "warning" | "danger";
  onClick?: () => void;
  icon?: "navigate" | "scroll";
}

const StatCard = ({ label, value, percentage, variant = "default", onClick, icon }: StatCardProps) => {
  const variantStyles = {
    default: "border-border/50",
    success: "border-emerald-500/30",
    warning: "border-amber-500/30",
    danger: "border-destructive/30",
  };

  const percentageColors = {
    default: "text-muted-foreground",
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-destructive",
  };

  const iconColors = {
    default: "text-muted-foreground",
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-destructive",
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-card/60 rounded-xl p-4 border ${variantStyles[variant]} backdrop-blur-sm text-center transition-all relative group ${onClick ? "cursor-pointer hover:bg-card/80 hover:scale-[1.02] active:scale-[0.98]" : ""}`}
    >
      {onClick && icon && (
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

export const PerformanceStatsRow = () => {
  const navigate = useNavigate();
  const { activityProgressList, subjectBreakdowns } = useSubjectAnalytics();
  const { subjects } = useProgressSnapshot();

  const stats = useMemo(() => {
    // Find top subject (highest overall progress)
    const sortedSubjects = [...subjects].sort((a, b) => b.progress - a.progress);
    const topSubject = sortedSubjects[0];
    const leastSubject = sortedSubjects[sortedSubjects.length - 1];

    // Aggregate by activity type across all subjects
    const typeAggregates: Record<string, { total: number; count: number }> = {};
    activityProgressList.forEach((item) => {
      if (!typeAggregates[item.activity]) {
        typeAggregates[item.activity] = { total: 0, count: 0 };
      }
      typeAggregates[item.activity].total += item.percentage;
      typeAggregates[item.activity].count++;
    });

    // Calculate average for each type
    const typeAverages = Object.entries(typeAggregates).map(([activity, data]) => ({
      activity,
      average: data.count > 0 ? Math.round(data.total / data.count) : 0,
    }));

    // Sort to find strongest and weakest
    const sortedTypes = [...typeAverages].sort((a, b) => b.average - a.average);
    const strongestType = sortedTypes[0];
    const weakestType = sortedTypes[sortedTypes.length - 1];

    return {
      topSubject: {
        id: topSubject?.id || "",
        name: topSubject?.fullName || topSubject?.name || "N/A",
        percentage: topSubject?.progress ?? 0,
      },
      leastSubject: {
        id: leastSubject?.id || "",
        name: leastSubject?.fullName || leastSubject?.name || "N/A",
        percentage: leastSubject?.progress ?? 0,
      },
      strongestType: {
        name: strongestType?.activity || "N/A",
        percentage: strongestType?.average ?? 0,
      },
      weakestType: {
        name: weakestType?.activity || "N/A",
        percentage: weakestType?.average ?? 0,
      },
    };
  }, [subjects, activityProgressList]);

  const handleSubjectClick = (subjectId: string) => {
    const tabIndex = subjectTabIndex[subjectId] ?? 0;
    navigate(`/tracker?tab=${tabIndex}`);
  };

  const scrollToBreakdown = () => {
    const breakdownSection = document.querySelector('[data-section="subject-breakdown"]');
    breakdownSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
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
  );
};
