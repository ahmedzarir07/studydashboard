import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Chapter, Status } from "@/types/tracker";

const StatusBadge = ({ status, onClick }: { status: Status; onClick: () => void }) => {
  const getStatusConfig = (s: Status) => {
    switch (s) {
      case "Done":
        return {
          icon: CheckCircle2,
          variant: "default" as const,
          className: "bg-success text-success-foreground hover:bg-success/90",
        };
      case "In progress":
        return {
          icon: Clock,
          variant: "secondary" as const,
          className: "bg-warning text-warning-foreground hover:bg-warning/90",
        };
      case "Not Started":
        return {
          icon: Circle,
          variant: "outline" as const,
          className: "hover:bg-muted",
        };
      default:
        return {
          icon: Circle,
          variant: "outline" as const,
          className: "opacity-30 hover:opacity-60",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-105 gap-1 text-xs",
        config.className
      )}
      onClick={onClick}
    >
      <Icon className="h-3 w-3" />
      {status || "—"}
    </Badge>
  );
};

interface ProgressTrackerProps {
  initialChapters: Chapter[];
}

export const ProgressTracker = ({ initialChapters }: ProgressTrackerProps) => {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);

  const cycleStatus = (chapterId: number, activityIndex: number) => {
    const statusCycle: Status[] = ["", "Not Started", "In progress", "Done"];
    setChapters((prev) =>
      prev.map((chapter) => {
        if (chapter.id === chapterId) {
          const newActivities = [...chapter.activities];
          const currentStatus = newActivities[activityIndex].status;
          const currentIndex = statusCycle.indexOf(currentStatus);
          const nextIndex = (currentIndex + 1) % statusCycle.length;
          newActivities[activityIndex] = {
            ...newActivities[activityIndex],
            status: statusCycle[nextIndex],
          };
          return { ...chapter, activities: newActivities };
        }
        return chapter;
      })
    );
  };

  const getChapterProgress = (chapter: Chapter) => {
    const completedCount = chapter.activities.filter((a) => a.status === "Done").length;
    const totalCount = chapter.activities.filter((a) => a.name !== "মোট ক্লাস").length;
    return Math.round((completedCount / totalCount) * 100);
  };

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => {
        const progress = getChapterProgress(chapter);
        return (
          <Card
            key={chapter.id}
            className="p-6 hover:shadow-md transition-shadow duration-300 bg-card border-border"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{chapter.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">{progress}%</div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                {chapter.activities.map((activity, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-xs text-muted-foreground truncate" title={activity.name}>
                      {activity.name}
                    </div>
                    <StatusBadge
                      status={activity.status}
                      onClick={() => cycleStatus(chapter.id, idx)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
