import { SubjectTypeBreakdown } from "@/hooks/useSubjectAnalytics";

interface SubjectBreakdownChartProps {
  breakdown: SubjectTypeBreakdown;
}

// Colors matching the reference design
const typeConfig = {
  Theory: { color: "hsl(217 91% 60%)", bgColor: "hsl(217 91% 60% / 0.2)" },    // Blue
  MCQ: { color: "hsl(142 76% 45%)", bgColor: "hsl(142 76% 45% / 0.2)" },       // Green  
  CQ: { color: "hsl(25 95% 53%)", bgColor: "hsl(25 95% 53% / 0.2)" },          // Orange
  Revision: { color: "hsl(262 83% 58%)", bgColor: "hsl(262 83% 58% / 0.2)" },  // Purple
};

export const SubjectBreakdownChart = ({ breakdown }: SubjectBreakdownChartProps) => {
  const data = [
    { name: "Theory", value: breakdown.theory, ...typeConfig.Theory },
    { name: "MCQ", value: breakdown.mcq, ...typeConfig.MCQ },
    { name: "CQ", value: breakdown.cq, ...typeConfig.CQ },
    { name: "Revision", value: breakdown.revision, ...typeConfig.Revision },
  ];

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
      
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{item.name}</span>
              <span className="text-xs font-medium text-muted-foreground">{item.value}%</span>
            </div>
            <div 
              className="h-2.5 rounded-full overflow-hidden"
              style={{ backgroundColor: item.bgColor }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${item.value}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
