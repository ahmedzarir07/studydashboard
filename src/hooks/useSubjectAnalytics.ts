import { useMemo } from "react";
import { useProgressSnapshot, ALL_SUBJECTS } from "./useProgressSnapshot";

export interface ActivityProgress {
  subject: string;
  subjectId: string;
  subjectColor: string;
  activity: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export interface SubjectActivityBreakdown {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  activities: Array<{
    name: string;
    percentage: number;
  }>;
}

export interface StrengthWeaknessItem {
  subject: string;
  activity: string;
  percentage: number;
  color: string;
}

// Only science subjects (9 subjects)
const SCIENCE_SUBJECT_IDS = [
  "physics", "physics2nd",
  "chemistry", "chemistry2nd", 
  "highermath", "highermath2nd",
  "biology", "biology2nd",
  "ict"
];

// Activities to track (excluding Total Lec which is numeric input)
const TRACKED_ACTIVITIES = [
  "Lecture",
  "ক",
  "খ",
  "Notes",
  "MCQ Practice",
  "MCQ Summary",
  "CQ Summary",
  "Written CQ",
  "Revision",
  "Exam"
];

export const useSubjectAnalytics = () => {
  const { recordMap, loading } = useProgressSnapshot();

  const activityProgressList = useMemo<ActivityProgress[]>(() => {
    const result: ActivityProgress[] = [];

    // Filter to only science subjects
    const scienceSubjects = ALL_SUBJECTS.filter(s => SCIENCE_SUBJECT_IDS.includes(s.data.id));

    scienceSubjects.forEach(({ data: subject, color, displayName }) => {
      // Get unique activities from the subject's chapters
      const subjectActivities = new Set<string>();
      subject.chapters.forEach(chapter => {
        chapter.activities.forEach(activity => {
          if (activity.name !== "Total Lec" && TRACKED_ACTIVITIES.includes(activity.name)) {
            subjectActivities.add(activity.name);
          }
        });
      });

      // Calculate progress for each activity
      subjectActivities.forEach(activityName => {
        let doneCount = 0;
        let totalCount = 0;

        subject.chapters.forEach(chapter => {
          const hasActivity = chapter.activities.some(a => a.name === activityName);
          if (hasActivity) {
            totalCount++;
            const status = recordMap.get(`${subject.id}-${chapter.name}-${activityName}`);
            if (status === "Done") {
              doneCount++;
            } else if (status === "In progress") {
              doneCount += 0.5;
            }
          }
        });

        if (totalCount > 0) {
          result.push({
            subject: displayName,
            subjectId: subject.id,
            subjectColor: color,
            activity: activityName,
            completedCount: Math.round(doneCount),
            totalCount,
            percentage: Math.round((doneCount / totalCount) * 100),
          });
        }
      });
    });

    return result;
  }, [recordMap]);

  const subjectBreakdowns = useMemo<SubjectActivityBreakdown[]>(() => {
    const breakdownMap = new Map<string, SubjectActivityBreakdown>();

    // Filter to only science subjects
    const scienceSubjects = ALL_SUBJECTS.filter(s => SCIENCE_SUBJECT_IDS.includes(s.data.id));

    scienceSubjects.forEach(({ data: subject, color, displayName }) => {
      breakdownMap.set(subject.id, {
        subjectId: subject.id,
        subjectName: displayName,
        subjectColor: color,
        activities: [],
      });
    });

    activityProgressList.forEach((item) => {
      const breakdown = breakdownMap.get(item.subjectId);
      if (breakdown) {
        breakdown.activities.push({
          name: item.activity,
          percentage: item.percentage,
        });
      }
    });

    // Sort activities in consistent order
    breakdownMap.forEach((breakdown) => {
      breakdown.activities.sort((a, b) => {
        const orderA = TRACKED_ACTIVITIES.indexOf(a.name);
        const orderB = TRACKED_ACTIVITIES.indexOf(b.name);
        return orderA - orderB;
      });
    });

    return Array.from(breakdownMap.values());
  }, [activityProgressList]);

  const strongestAreas = useMemo<StrengthWeaknessItem[]>(() => {
    return [...activityProgressList]
      .filter((item) => item.totalCount > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map((item) => ({
        subject: item.subject,
        activity: item.activity,
        percentage: item.percentage,
        color: item.subjectColor,
      }));
  }, [activityProgressList]);

  const weakestAreas = useMemo<StrengthWeaknessItem[]>(() => {
    return [...activityProgressList]
      .filter((item) => item.totalCount > 0)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3)
      .map((item) => ({
        subject: item.subject,
        activity: item.activity,
        percentage: item.percentage,
        color: item.subjectColor,
      }));
  }, [activityProgressList]);

  return {
    activityProgressList,
    subjectBreakdowns,
    strongestAreas,
    weakestAreas,
    loading,
  };
};
