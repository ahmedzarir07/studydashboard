import { useSubjectAnalytics } from "@/hooks/useSubjectAnalytics";
import { SubjectBreakdownChart } from "./SubjectBreakdownChart";
import { StrengthWeaknessCard } from "./StrengthWeaknessCard";
import { Loader2, BarChart3 } from "lucide-react";

export const SubjectAnalyticsSection = () => {
  const { subjectBreakdowns, strongestAreas, weakestAreas, loading } = useSubjectAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strength & Weakness Section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Performance Analysis
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StrengthWeaknessCard 
            title="Strongest Areas" 
            items={strongestAreas} 
            type="strength" 
          />
          <StrengthWeaknessCard 
            title="Weakest Areas" 
            items={weakestAreas} 
            type="weakness" 
          />
        </div>
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};
