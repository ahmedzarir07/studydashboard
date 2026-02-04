import { useMemo } from "react";
import { useProgressSnapshot, ALL_SUBJECTS } from "./useProgressSnapshot";
import { normalizeActivity } from "@/config/activityMapping";

export interface TypeProgress {
  subject: string;
  subjectId: string;
  subjectColor: string;
  type: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export interface SubjectTypeBreakdown {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  theory: number;
  mcq: number;
  cq: number;
  revision: number;
}

export interface StrengthWeaknessItem {
  subject: string;
  type: string;
  percentage: number;
  color: string;
}

// Only science subjects for the breakdown charts (9 subjects)
const SCIENCE_SUBJECT_IDS = [
  "physics", "physics2nd",
  "chemistry", "chemistry2nd", 
  "highermath", "highermath2nd",
  "biology", "biology2nd",
  "ict"
];

// Map activities to their type categories
const getActivityType = (activity: string): string | null => {
  const normalizedName = normalizeActivity(activity);
  
  // Theory/Core activities
  if (["Lecture", "Notes", "Text Reading", "Poem Reading", "Chapter Reading", "Book Reading", "Rule Notes", "Outline", "Format Templates", "Highlight Book"].includes(normalizedName)) {
    return "theory";
  }
  
  // MCQ activities
  if (["MCQ Practice", "MCQ Summary", "SQ", "Info Transfer", "Practice", "Practice Sets", "Error Log", "Error Analysis", "MCQ"].includes(normalizedName)) {
    return "mcq";
  }
  
  // CQ activities
  if (["ক", "খ", "CQ Summary", "Written CQ", "CQ Practice", "Book Problems", "Practice Drafts", "Final Draft", "Model Answers", "Model Review", "Model Samples", "Model Reading", "Model Essays", "Idea Planning", "Practice Writing", "Theme", "CQ Types", "Figure Notes", "Typewise CQ"].includes(normalizedName)) {
    return "cq";
  }
  
  // Revision activities
  if (["Revision", "Exam", "Mock Practice", "Final Practice", "Vocabulary", "Expressions", "ALL Revision"].includes(normalizedName)) {
    return "revision";
  }
  
  return null;
};

export const useSubjectAnalytics = () => {
  const { recordMap, loading, subjects } = useProgressSnapshot();

  const typeProgressList = useMemo<TypeProgress[]>(() => {
    const result: TypeProgress[] = [];

    // Filter to only science subjects
    const scienceSubjects = ALL_SUBJECTS.filter(s => SCIENCE_SUBJECT_IDS.includes(s.data.id));

    scienceSubjects.forEach(({ data: subject, color, displayName }) => {
      const typeCounts: Record<string, { done: number; total: number }> = {
        theory: { done: 0, total: 0 },
        mcq: { done: 0, total: 0 },
        cq: { done: 0, total: 0 },
        revision: { done: 0, total: 0 },
      };

      subject.chapters.forEach((chapter) => {
        chapter.activities.forEach((activity) => {
          if (activity.name === "Total Lec") return;
          
          const type = getActivityType(activity.name);
          if (!type) return;
          
          typeCounts[type].total++;
          
          const status = recordMap.get(`${subject.id}-${chapter.name}-${activity.name}`);
          if (status === "Done") {
            typeCounts[type].done++;
          } else if (status === "In progress") {
            typeCounts[type].done += 0.5;
          }
        });
      });

      Object.entries(typeCounts).forEach(([type, counts]) => {
        if (counts.total > 0) {
          result.push({
            subject: displayName,
            subjectId: subject.id,
            subjectColor: color,
            type,
            completedCount: Math.round(counts.done),
            totalCount: counts.total,
            percentage: Math.round((counts.done / counts.total) * 100),
          });
        }
      });
    });

    return result;
  }, [recordMap]);

  const subjectBreakdowns = useMemo<SubjectTypeBreakdown[]>(() => {
    const breakdownMap = new Map<string, SubjectTypeBreakdown>();

    typeProgressList.forEach((item) => {
      if (!breakdownMap.has(item.subjectId)) {
        breakdownMap.set(item.subjectId, {
          subjectId: item.subjectId,
          subjectName: item.subject,
          subjectColor: item.subjectColor,
          theory: 0,
          mcq: 0,
          cq: 0,
          revision: 0,
        });
      }
      
      const breakdown = breakdownMap.get(item.subjectId)!;
      if (item.type === "theory") breakdown.theory = item.percentage;
      if (item.type === "mcq") breakdown.mcq = item.percentage;
      if (item.type === "cq") breakdown.cq = item.percentage;
      if (item.type === "revision") breakdown.revision = item.percentage;
    });

    return Array.from(breakdownMap.values());
  }, [typeProgressList]);

  const strongestAreas = useMemo<StrengthWeaknessItem[]>(() => {
    return [...typeProgressList]
      .filter((item) => item.totalCount > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map((item) => ({
        subject: item.subject,
        type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
        percentage: item.percentage,
        color: item.subjectColor,
      }));
  }, [typeProgressList]);

  const weakestAreas = useMemo<StrengthWeaknessItem[]>(() => {
    return [...typeProgressList]
      .filter((item) => item.totalCount > 0)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3)
      .map((item) => ({
        subject: item.subject,
        type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
        percentage: item.percentage,
        color: item.subjectColor,
      }));
  }, [typeProgressList]);

  return {
    typeProgressList,
    subjectBreakdowns,
    strongestAreas,
    weakestAreas,
    loading,
    subjects,
  };
};
