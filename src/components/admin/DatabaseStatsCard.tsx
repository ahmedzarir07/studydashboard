import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Database,
  Users,
  BookOpen,
  CheckCircle,
  CalendarDays,
  Link2,
  MessageSquare,
  Bot,
} from "lucide-react";

interface DatabaseStats {
  totalProfiles: number;
  totalStudyRecords: number;
  totalChapterCompletions: number;
  totalMonthlyPlans: number;
  totalResources: number;
  totalChatMessages: number;
  totalCoachSettings: number;
}

interface DatabaseStatsCardProps {
  stats: DatabaseStats;
}

const statItems = [
  { key: "totalProfiles", label: "Profiles", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "totalStudyRecords", label: "Study Records", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "totalChapterCompletions", label: "Completions", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  { key: "totalMonthlyPlans", label: "Monthly Plans", icon: CalendarDays, color: "text-purple-500", bg: "bg-purple-500/10" },
  { key: "totalResources", label: "Resources", icon: Link2, color: "text-orange-500", bg: "bg-orange-500/10" },
  { key: "totalChatMessages", label: "Chat Messages", icon: MessageSquare, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "totalCoachSettings", label: "Coach Settings", icon: Bot, color: "text-pink-500", bg: "bg-pink-500/10" },
] as const;

export function DatabaseStatsCard({ stats }: DatabaseStatsCardProps) {
  const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Database Overview</h3>
          <p className="text-xs text-muted-foreground">{totalRecords.toLocaleString()} total records</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          const value = stats[item.key];

          return (
            <div
              key={item.key}
              className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30"
            >
              <div className={cn("p-1.5 rounded-lg", item.bg)}>
                <Icon className={cn("h-4 w-4", item.color)} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{value.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
