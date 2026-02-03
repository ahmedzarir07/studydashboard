import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { physicsData } from "@/data/physicsData";
import { physics2ndData } from "@/data/physics2ndData";
import { chemistryData } from "@/data/chemistryData";
import { chemistry2ndData } from "@/data/chemistry2ndData";
import { higherMathData } from "@/data/higherMathData";
import { higherMath2ndData } from "@/data/higherMath2ndData";
import { biologyData } from "@/data/biologyData";
import { biology2ndData } from "@/data/biology2ndData";
import { ictData } from "@/data/ictData";
import { english1stData } from "@/data/english1stData";
import { english2ndData } from "@/data/english2ndData";
import { bangla1stData } from "@/data/bangla1stData";
import { bangla2ndData } from "@/data/bangla2ndData";
import { getSubjectConfig } from "@/config/activityWeights";
import { normalizeActivity } from "@/config/activityMapping";
import { fetchAllStudyStatusRecordsForUser } from "@/lib/fetchAllStudyStatusRecords";

export interface SubjectProgress {
  id: string;
  name: string;
  fullName: string;
  progress: number;
  color: string;
}

export interface ProgressSnapshot {
  overallProgress: number;
  subjects: SubjectProgress[];
  recordMap: Map<string, string>;
  loading: boolean;
}

// All subjects configuration - single source of truth
// IMPORTANT: IDs must match the data file IDs (e.g., physicsData.id)
export const ALL_SUBJECTS = [
  { data: physicsData, color: "hsl(var(--primary))", displayName: "Physics 1st" },
  { data: physics2ndData, color: "hsl(217 91% 60%)", displayName: "Physics 2nd" },
  { data: chemistryData, color: "hsl(142 76% 36%)", displayName: "Chemistry 1st" },
  { data: chemistry2ndData, color: "hsl(142 71% 45%)", displayName: "Chemistry 2nd" },
  { data: higherMathData, color: "hsl(262 83% 58%)", displayName: "HM 1st" },
  { data: higherMath2ndData, color: "hsl(262 78% 68%)", displayName: "HM 2nd" },
  { data: biologyData, color: "hsl(25 95% 53%)", displayName: "Biology 1st" },
  { data: biology2ndData, color: "hsl(25 90% 63%)", displayName: "Biology 2nd" },
  { data: ictData, color: "hsl(199 89% 48%)", displayName: "ICT" },
  { data: english1stData, color: "hsl(340 82% 52%)", displayName: "English 1st" },
  { data: english2ndData, color: "hsl(280 70% 55%)", displayName: "English 2nd" },
  { data: bangla1stData, color: "hsl(45 93% 47%)", displayName: "Bangla 1st" },
  { data: bangla2ndData, color: "hsl(35 90% 50%)", displayName: "Bangla 2nd" },
];

// Calculate weighted progress from a record map - uses same logic as SubjectProgressBar
export function calculateProgressFromRecords(
  recordMap: Map<string, string>
): { overallProgress: number; subjects: SubjectProgress[] } {
  let totalSubjectProgress = 0;
  let subjectCount = 0;
  const subjects: SubjectProgress[] = [];

  ALL_SUBJECTS.forEach(({ data: subject, color, displayName }) => {
    const id = subject.id;
    let totalChapterProgress = 0;
    let chapterCount = 0;

    subject.chapters.forEach((chapter) => {
      // Get the appropriate config for this subject and chapter
      const config = getSubjectConfig(subject.id, chapter.id);
      
      const sectionProgress: Record<string, number> = {
        core: 0,
        mcq: 0,
        cq: 0,
        final: 0,
      };

      chapter.activities.forEach((activity) => {
        if (activity.name === "Total Lec") return;

        const status = recordMap.get(`${subject.id}-${chapter.name}-${activity.name}`);
        const normalizedName = normalizeActivity(activity.name);

        // Find which section this activity belongs to and add its weighted contribution
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

      // Calculate chapter progress with section caps
      let chapterProgress = 0;
      Object.entries(config.sections).forEach(([sectionKey, section]) => {
        const rawProgress = sectionProgress[sectionKey];
        const cappedProgress = Math.min(rawProgress, section.internalMax || section.max);

        if (section.internalMax) {
          // Scale from internal max to actual max
          chapterProgress += (cappedProgress / section.internalMax) * section.max;
        } else {
          chapterProgress += Math.min(cappedProgress, section.max);
        }
      });

      totalChapterProgress += chapterProgress;
      chapterCount++;
    });

    const subjectProgress = chapterCount > 0 ? Math.round(totalChapterProgress / chapterCount) : 0;
    
    subjects.push({
      id,
      name: displayName,
      fullName: subject.name,
      progress: subjectProgress,
      color,
    });

    totalSubjectProgress += subjectProgress;
    subjectCount++;
  });

  return {
    overallProgress: subjectCount > 0 ? Math.round(totalSubjectProgress / subjectCount) : 0,
    subjects,
  };
}

// Hook for current user's progress with realtime updates
export const useProgressSnapshot = (): ProgressSnapshot => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["progress_snapshot", user?.id ?? null] as const, [user?.id]);

  const { data, isLoading } = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      try {
        // IMPORTANT: We paginate to avoid missing older subjects (e.g., Physics) when a user has
        // thousands of historical/duplicated rows.
        const records = await fetchAllStudyStatusRecordsForUser(user!.id);

        const recordMap = new Map<string, string>();
        // Deduplicate by keeping the latest record for each key.
        // (records are ordered by updated_at DESC)
        records.forEach((r) => {
          const key = `${r.subject}-${r.chapter}-${r.activity}`;
          if (!recordMap.has(key)) {
            recordMap.set(key, r.status || "");
          }
        });

        return recordMap;
      } catch (error) {
        console.error("Error fetching study records:", error);
        return new Map<string, string>();
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`progress_snapshot_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "study_records",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidate query on any change
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, queryKey]);

  const recordMap = data ?? new Map<string, string>();
  const calculated = useMemo(() => calculateProgressFromRecords(recordMap), [recordMap]);

  if (!user) {
    return {
      overallProgress: 0,
      subjects: ALL_SUBJECTS.map(({ displayName, data, color }) => ({
        id: data.id,
        name: displayName,
        fullName: data.name,
        progress: 0,
        color,
      })),
      recordMap: new Map(),
      loading: false,
    };
  }

  return {
    overallProgress: calculated.overallProgress,
    subjects: calculated.subjects,
    recordMap,
    loading: isLoading,
  };
};

// Calculate progress for any user given their study records
export function calculateUserProgress(
  records: Array<{ subject: string; chapter: string; activity: string; status: string | null }>
): { overallProgress: number; subjects: Record<string, number> } {
  const recordMap = new Map<string, string>();
  records.forEach((r) => {
    recordMap.set(`${r.subject}-${r.chapter}-${r.activity}`, r.status || "");
  });

  const result = calculateProgressFromRecords(recordMap);
  
  const subjectsRecord: Record<string, number> = {};
  result.subjects.forEach((s) => {
    subjectsRecord[s.id] = s.progress;
  });

  return {
    overallProgress: result.overallProgress,
    subjects: subjectsRecord,
  };
}
