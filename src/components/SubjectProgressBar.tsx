import { useMemo } from "react";
import { useStudyRecords } from "@/hooks/useStudyRecords";
import { useAuth } from "@/contexts/AuthContext";
import { getSubjectConfig } from "@/config/activityWeights";
import { normalizeActivity } from "@/config/activityMapping";
import { Chapter } from "@/types/tracker";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SubjectProgressBarProps {
  subjectId: string;
  chapters: Chapter[];
  subjectName: string;
  color: string;
}

export const SubjectProgressBar = ({ 
  subjectId, 
  chapters, 
  subjectName,
  color 
}: SubjectProgressBarProps) => {
  const { user } = useAuth();
  const { loading, getStatus } = useStudyRecords(subjectId);

  const overallProgress = useMemo(() => {
    if (!user || loading) return 0;

    const config = getSubjectConfig(subjectId);
    let totalProgress = 0;
    let chapterCount = 0;

    chapters.forEach((chapter) => {
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
    <div className="bg-card/60 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-foreground">{subjectName} Progress</h2>
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
