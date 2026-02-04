import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SubjectActivityBreakdown } from "@/hooks/useSubjectAnalytics";

interface SubjectBreakdownChartProps {
  breakdown: SubjectActivityBreakdown;
}

// Shorten activity names for x-axis
const shortNames: Record<string, string> = {
  "Lecture": "Class",
  "ক": "ক",
  "খ": "খ",
  "Notes": "Note",
  "MCQ Practice": "MCQ",
  "MCQ Summary": "MCQ S",
  "CQ Summary": "CQ S",
  "Written CQ": "CQ",
  "Revision": "Rev",
  "Exam": "Exam",
  // English
  "SQ": "SQ",
  "Info Transfer": "Info",
  "Vocabulary": "Vocab",
  "Practice": "Prac",
  "Model Answers": "Model",
  "Error Analysis": "Error",
  "Mock Practice": "Mock",
  "Practice Drafts": "Draft",
  "Model Review": "Review",
  "Final Draft": "Final",
  "Practice Sets": "Prac",
  "Error Log": "Error",
  "Final Practice": "Final",
  "Model Samples": "Sample",
  "Expressions": "Expr",
  "Idea Planning": "Idea",
  "Practice Writing": "Write",
  "Model Reading": "Read",
  // Bangla
  "Text Reading": "Text",
  "Poem Reading": "Poem",
  "Chapter Reading": "Chap",
  "CQ Practice": "CQ",
  "Theme": "Theme",
  "Rule Notes": "Rule",
  "Format Templates": "Format",
  "Outline": "Outline",
  "Model Essays": "Essay",
};

const getShortName = (name: string) => shortNames[name] || name.slice(0, 5);

export const SubjectBreakdownChart = ({ breakdown }: SubjectBreakdownChartProps) => {
  // Prepare data for line chart
  const chartData = breakdown.activities.map((item) => ({
    name: getShortName(item.name),
    fullName: item.name,
    value: item.percentage,
  }));

  return (
    <div 
      className="bg-card/60 rounded-xl p-4 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer group"
      style={{ 
        "--subject-color": breakdown.subjectColor 
      } as React.CSSProperties}
    >
      <h4 className="font-medium text-foreground text-sm mb-3 truncate group-hover:text-primary transition-colors">
        {breakdown.subjectName}
      </h4>
      
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={45}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-sm font-medium text-foreground">{data.fullName}</p>
                      <p className="text-xs text-muted-foreground">{data.value}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={breakdown.subjectColor}
              strokeWidth={2}
              dot={{ 
                fill: breakdown.subjectColor, 
                strokeWidth: 2,
                r: 4,
                stroke: breakdown.subjectColor
              }}
              activeDot={{ 
                r: 6, 
                fill: breakdown.subjectColor,
                stroke: "hsl(var(--background))",
                strokeWidth: 2
              }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
