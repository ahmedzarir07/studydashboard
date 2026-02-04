import { SubjectActivityBreakdown } from "@/hooks/useSubjectAnalytics";

interface SubjectBreakdownChartProps {
  breakdown: SubjectActivityBreakdown;
}

// Activity colors - matching the tracker feel
const activityColors: Record<string, string> = {
  "Lecture": "hsl(217 91% 60%)",       // Blue
  "ক": "hsl(142 76% 45%)",             // Green
  "খ": "hsl(142 71% 55%)",             // Light Green
  "Notes": "hsl(199 89% 48%)",         // Cyan
  "MCQ Practice": "hsl(45 93% 47%)",   // Yellow
  "MCQ Summary": "hsl(35 90% 50%)",    // Orange-Yellow
  "CQ Summary": "hsl(25 95% 53%)",     // Orange
  "Written CQ": "hsl(340 82% 52%)",    // Pink
  "Revision": "hsl(262 83% 58%)",      // Purple
  "Exam": "hsl(280 70% 55%)",          // Violet
};

const getActivityColor = (name: string) => activityColors[name] || "hsl(var(--primary))";

export const SubjectBreakdownChart = ({ breakdown }: SubjectBreakdownChartProps) => {
  return (
    <div className="bg-card/60 rounded-xl p-4 border border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: breakdown.subjectColor }}
        />
        <h4 className="font-medium text-foreground text-sm truncate">
          {breakdown.subjectName}
        </h4>
      </div>
      
      <div className="space-y-2.5">
        {breakdown.activities.map((item) => {
          const color = getActivityColor(item.name);
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate max-w-[60%]">{item.name}</span>
                <span className="text-xs font-medium text-muted-foreground">{item.percentage}%</span>
              </div>
              <div 
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: `${color}20` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
