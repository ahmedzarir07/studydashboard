import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SubjectTypeBreakdown } from "@/hooks/useSubjectAnalytics";

interface SubjectBreakdownChartProps {
  breakdown: SubjectTypeBreakdown;
}

const typeColors = {
  Theory: "hsl(var(--primary))",
  MCQ: "hsl(142 76% 45%)",
  CQ: "hsl(262 83% 58%)",
  Revision: "hsl(25 95% 53%)",
};

export const SubjectBreakdownChart = ({ breakdown }: SubjectBreakdownChartProps) => {
  const data = [
    { name: "Theory", value: breakdown.theory, fill: typeColors.Theory },
    { name: "MCQ", value: breakdown.mcq, fill: typeColors.MCQ },
    { name: "CQ", value: breakdown.cq, fill: typeColors.CQ },
    { name: "Revision", value: breakdown.revision, fill: typeColors.Revision },
  ];

  return (
    <div className="bg-card/60 rounded-xl p-4 border border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: breakdown.subjectColor }}
        />
        <h4 className="font-medium text-foreground text-sm truncate">
          {breakdown.subjectName}
        </h4>
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              hide 
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={55}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-sm font-medium text-foreground">{data.name}</p>
                      <p className="text-xs text-muted-foreground">{data.value}% complete</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              barSize={14}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
