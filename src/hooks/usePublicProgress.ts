import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

interface UserProfile {
  user_id: string;
  email: string | null;
  display_name: string | null;
  last_active_at: string | null;
  created_at: string;
}

export interface AggregatedUserProgress {
  profileId: string;
  displayName: string;
  email?: string | null;
  lastActiveAt?: string | null;
  createdAt?: string;
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
  const { user } = useAuth();
  const [studyProgress, setStudyProgress] = useState<PublicStudyProgress[]>([]);
  const [chapterProgress, setChapterProgress] = useState<PublicChapterProgress[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        setLoading(true);
        
        // Check if current user is admin
        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();
          
          const adminStatus = roleData?.role === "admin";
          setIsAdmin(adminStatus);

          // If admin, fetch all profiles with emails
          if (adminStatus) {
            const { data: profilesData } = await supabase
              .from("profiles")
              .select("user_id, email, display_name, last_active_at, created_at");
            
            setUserProfiles(profilesData || []);
          }
        }
        
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

    checkAdminAndFetch();
  }, [user]);

  // Aggregate progress by user
  const aggregatedProgress: AggregatedUserProgress[] = (() => {
    const userMap = new Map<string, AggregatedUserProgress>();

    // Create a lookup for admin data
    const profileLookup = new Map<string, UserProfile>();
    userProfiles.forEach((profile) => {
      profileLookup.set(profile.user_id, profile);
    });

    // Process study records
    studyProgress.forEach((record) => {
      if (!userMap.has(record.profile_id)) {
        const profile = profileLookup.get(record.profile_id);
        userMap.set(record.profile_id, {
          profileId: record.profile_id,
          displayName: record.display_name || "Anonymous Student",
          email: isAdmin ? profile?.email : undefined,
          lastActiveAt: isAdmin ? profile?.last_active_at : undefined,
          createdAt: isAdmin ? profile?.created_at : undefined,
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
        const profile = profileLookup.get(record.profile_id);
        userMap.set(record.profile_id, {
          profileId: record.profile_id,
          displayName: record.display_name || "Anonymous Student",
          email: isAdmin ? profile?.email : undefined,
          lastActiveAt: isAdmin ? profile?.last_active_at : undefined,
          createdAt: isAdmin ? profile?.created_at : undefined,
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
    isAdmin,
    loading,
    error,
  };
};
