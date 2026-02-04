import { useSubjectAnalytics } from "@/hooks/useSubjectAnalytics";
import { SubjectBreakdownChart } from "./SubjectBreakdownChart";
import { PerformanceStatsRow } from "./PerformanceStatsRow";
import { Loader2, BarChart3 } from "lucide-react";

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

export const SubjectAnalyticsSection = () => {
  const { subjectBreakdowns, loading } = useSubjectAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Stats Row */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Performance Analysis
        </h3>
        <PerformanceStatsRow />
      </div>

      {/* Subject-wise Charts Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Subject-wise Breakdown
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectBreakdowns.map((breakdown) => (
            <SubjectBreakdownChart 
              key={breakdown.subjectId} 
              breakdown={breakdown}
              tabIndex={subjectTabIndex[breakdown.subjectId] ?? 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
