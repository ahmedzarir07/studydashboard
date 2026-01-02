import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PublicStudyProgress {
  id: string;
  profile_id: string;
  display_name: string | null;
  subject: string;
  chapter: string;
  activity: string;
  status: string | null;
  updated_at: string;
}

interface PublicChapterProgress {
  id: string;
  profile_id: string;
  display_name: string | null;
  subject: string;
  chapter: string;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
}

interface AggregatedUserProgress {
  profileId: string;
  displayName: string;
  subjects: {
    [subjectId: string]: {
      completedActivities: number;
      totalActivities: number;
      completedChapters: number;
      chapters: {
        [chapterName: string]: {
          completedActivities: number;
          totalActivities: number;
          isCompleted: boolean;
        };
      };
    };
  };
  lastUpdated: string | null;
}

export const usePublicProgress = () => {
  const [studyProgress, setStudyProgress] = useState<PublicStudyProgress[]>([]);
  const [chapterProgress, setChapterProgress] = useState<PublicChapterProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProgress = async () => {
      try {
        setLoading(true);
        
        // Fetch public study progress from view
        const { data: studyData, error: studyError } = await supabase
          .from("public_study_progress")
          .select("*")
          .order("updated_at", { ascending: false });

        if (studyError) {
          console.error("Error fetching public study progress:", studyError);
          setError(studyError.message);
        } else {
          setStudyProgress(studyData || []);
        }

        // Fetch public chapter progress from view
        const { data: chapterData, error: chapterError } = await supabase
          .from("public_chapter_progress")
          .select("*")
          .order("updated_at", { ascending: false });

        if (chapterError) {
          console.error("Error fetching public chapter progress:", chapterError);
        } else {
          setChapterProgress(chapterData || []);
        }
      } catch (err) {
        console.error("Error fetching public progress:", err);
        setError("Failed to load community progress");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProgress();
  }, []);

  // Aggregate progress by user
  const aggregatedProgress: AggregatedUserProgress[] = (() => {
    const userMap = new Map<string, AggregatedUserProgress>();

    // Process study records
    studyProgress.forEach((record) => {
      if (!userMap.has(record.profile_id)) {
        userMap.set(record.profile_id, {
          profileId: record.profile_id,
          displayName: record.display_name || "Anonymous Student",
          subjects: {},
          lastUpdated: record.updated_at,
        });
      }

      const user = userMap.get(record.profile_id)!;
      
      if (!user.subjects[record.subject]) {
        user.subjects[record.subject] = {
          completedActivities: 0,
          totalActivities: 0,
          completedChapters: 0,
          chapters: {},
        };
      }

      const subject = user.subjects[record.subject];

      if (!subject.chapters[record.chapter]) {
        subject.chapters[record.chapter] = {
          completedActivities: 0,
          totalActivities: 0,
          isCompleted: false,
        };
      }

      const chapter = subject.chapters[record.chapter];
      chapter.totalActivities++;
      subject.totalActivities++;

      if (record.status === "Done") {
        chapter.completedActivities++;
        subject.completedActivities++;
      }

      // Update last updated time
      if (record.updated_at > (user.lastUpdated || "")) {
        user.lastUpdated = record.updated_at;
      }
    });

    // Process chapter completions
    chapterProgress.forEach((record) => {
      if (!userMap.has(record.profile_id)) {
        userMap.set(record.profile_id, {
          profileId: record.profile_id,
          displayName: record.display_name || "Anonymous Student",
          subjects: {},
          lastUpdated: record.updated_at,
        });
      }

      const user = userMap.get(record.profile_id)!;

      if (!user.subjects[record.subject]) {
        user.subjects[record.subject] = {
          completedActivities: 0,
          totalActivities: 0,
          completedChapters: 0,
          chapters: {},
        };
      }

      const subject = user.subjects[record.subject];

      if (!subject.chapters[record.chapter]) {
        subject.chapters[record.chapter] = {
          completedActivities: 0,
          totalActivities: 0,
          isCompleted: false,
        };
      }

      if (record.completed) {
        subject.chapters[record.chapter].isCompleted = true;
        subject.completedChapters++;
      }
    });

    return Array.from(userMap.values()).sort((a, b) => {
      // Sort by total completed activities
      const aTotal = Object.values(a.subjects).reduce((sum, s) => sum + s.completedActivities, 0);
      const bTotal = Object.values(b.subjects).reduce((sum, s) => sum + s.completedActivities, 0);
      return bTotal - aTotal;
    });
  })();

  return {
    studyProgress,
    chapterProgress,
    aggregatedProgress,
    loading,
    error,
  };
};
