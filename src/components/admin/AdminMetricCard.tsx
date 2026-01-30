import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: {
    bg: "bg-gradient-to-br from-card to-card/80",
    iconBg: "bg-muted/50",
    iconColor: "text-muted-foreground",
    valueColor: "text-foreground",
    border: "border-border/50",
  },
  primary: {
    bg: "bg-gradient-to-br from-primary/20 to-primary/5",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    valueColor: "text-primary",
    border: "border-primary/30",
  },
  success: {
    bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-500",
    valueColor: "text-emerald-500",
    border: "border-emerald-500/30",
  },
  warning: {
    bg: "bg-gradient-to-br from-yellow-500/20 to-yellow-500/5",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-500",
    valueColor: "text-yellow-500",
    border: "border-yellow-500/30",
  },
  danger: {
    bg: "bg-gradient-to-br from-red-500/20 to-red-500/5",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-500",
    valueColor: "text-red-500",
    border: "border-red-500/30",
  },
};

export function AdminMetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = "default" 
}: AdminMetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-5 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
      styles.bg,
      styles.border
    )}>
      {/* Glow effect */}
      <div className={cn(
        "absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-50",
        variant === "primary" && "bg-primary/30",
        variant === "success" && "bg-emerald-500/30",
        variant === "warning" && "bg-yellow-500/30",
        variant === "danger" && "bg-red-500/30",
        variant === "default" && "bg-muted/30"
      )} />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-3xl font-bold", styles.valueColor)}>{value}</p>
          {trend && (
            <p className={cn(
              "text-xs font-medium flex items-center gap-1",
              trend.isPositive ? "text-emerald-500" : "text-red-500"
            )}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="text-muted-foreground">vs last week</span>
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          styles.iconBg
        )}>
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
