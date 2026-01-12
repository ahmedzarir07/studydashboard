import { useMemo } from "react";
import { useStudyRecords } from "@/hooks/useStudyRecords";
import { useAuth } from "@/contexts/AuthContext";
import { getSubjectConfig } from "@/config/activityWeights";
import { normalizeActivity } from "@/config/activityMapping";
import { Chapter } from "@/types/tracker";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubjectProgressBarProps {
  subjectId: string;
  chapters: Chapter[];
  subjectName: string;
  color: string;
}

// Get border color class based on subject color
const getBorderColorClass = (color: string) => {
  if (color.includes('3b82f6') || color.includes('blue')) return 'border-blue-500/40';
  if (color.includes('22c55e') || color.includes('green')) return 'border-green-500/40';
  if (color.includes('ec4899') || color.includes('pink')) return 'border-pink-500/40';
  if (color.includes('a855f7') || color.includes('purple')) return 'border-purple-500/40';
  if (color.includes('06b6d4') || color.includes('cyan')) return 'border-cyan-500/40';
  if (color.includes('f59e0b') || color.includes('amber')) return 'border-amber-500/40';
  if (color.includes('f97316') || color.includes('orange')) return 'border-orange-500/40';
  return 'border-primary/40';
};

export const SubjectProgressBar = ({ 
  subjectId, 
  chapters, 
  subjectName,
  color 
}: SubjectProgressBarProps) => {
  const { user } = useAuth();
  const { loading, getStatus, refetch } = useStudyRecords(subjectId);

  const overallProgress = useMemo(() => {
    if (!user || loading) return 0;

    let totalProgress = 0;
    let chapterCount = 0;

    chapters.forEach((chapter) => {
      const config = getSubjectConfig(subjectId, chapter.id);
      const sectionProgress: Record<string, number> = {
        core: 0,
        mcq: 0,
        cq: 0,
        final: 0,
      };

      chapter.activities.forEach((activity) => {
        if (activity.name === "Total Lec") return;

        const status = getStatus(chapter.name, activity.name);
        const normalizedName = normalizeActivity(activity.name);

        Object.entries(config.sections).forEach(([sectionKey, section]) => {
          const weight = section.activities[normalizedName];
          if (weight) {
            if (status === "Done") {
              sectionProgress[sectionKey] += weight;
            } else if (status === "In progress") {
              sectionProgress[sectionKey] += weight * 0.5;
            }
          }
        });
      });

      let chapterProgress = 0;
      Object.entries(config.sections).forEach(([sectionKey, section]) => {
        const rawProgress = sectionProgress[sectionKey];
        const cappedProgress = Math.min(rawProgress, section.internalMax || section.max);

        if (section.internalMax) {
          chapterProgress += (cappedProgress / section.internalMax) * section.max;
        } else {
          chapterProgress += Math.min(cappedProgress, section.max);
        }
      });

      totalProgress += chapterProgress;
      chapterCount++;
    });

    return chapterCount > 0 ? Math.round(totalProgress / chapterCount) : 0;
  }, [user, loading, subjectId, chapters, getStatus]);

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return "bg-emerald-500";
    if (percentage >= 70) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("bg-card/60 rounded-xl p-4 mb-4 border-2", getBorderColorClass(color))}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground">{subjectName} Progress</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
        <span className={cn(
          "text-lg font-bold",
          overallProgress >= 100 ? "text-emerald-500" :
          overallProgress >= 70 ? "text-green-500" :
          overallProgress >= 40 ? "text-yellow-500" :
          "text-red-500"
        )}>
          {overallProgress}%
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", getProgressColor(overallProgress))}
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {chapters.length} chapters • Average completion across all activities
      </p>
    </div>
  );
};
