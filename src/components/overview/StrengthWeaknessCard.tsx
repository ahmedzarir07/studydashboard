import { TrendingUp, TrendingDown } from "lucide-react";
import { StrengthWeaknessItem } from "@/hooks/useSubjectAnalytics";
import { cn } from "@/lib/utils";

interface StrengthWeaknessCardProps {
  title: string;
  items: StrengthWeaknessItem[];
  type: "strength" | "weakness";
}

export const StrengthWeaknessCard = ({ title, items, type }: StrengthWeaknessCardProps) => {
  const Icon = type === "strength" ? TrendingUp : TrendingDown;
  const isStrength = type === "strength";
  
  return (
    <div className={cn(
      "bg-card/60 rounded-xl p-4 border border-border/50 backdrop-blur-sm",
      "bg-gradient-to-br",
      isStrength ? "from-emerald-500/10 to-transparent" : "from-destructive/10 to-transparent"
    )}>
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("p-1.5 rounded-lg", isStrength ? "bg-emerald-500/20" : "bg-destructive/20")}>
          <Icon className={cn("h-4 w-4", isStrength ? "text-emerald-500" : "text-destructive")} />
        </div>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No data available
          </p>
        ) : (
          items.map((item, index) => (
            <div 
              key={`${item.subject}-${item.type}`}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-bold text-muted-foreground w-4">
                  #{index + 1}
                </span>
                <div 
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.type}
                  </p>
                </div>
              </div>
              <div className={cn(
                "text-sm font-bold tabular-nums px-2 py-0.5 rounded",
                isStrength ? "text-emerald-500 bg-emerald-500/10" : "text-destructive bg-destructive/10"
              )}>
                {item.percentage}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
