import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateUserProgress, ALL_SUBJECTS } from "./useProgressSnapshot";

interface StudyRecord {
  user_id: string;
  subject: string;
  chapter: string;
  activity: string;
  status: string | null;
  updated_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  last_active_at: string | null;
  created_at: string;
}

export interface CommunityUserProgress {
  profileId: string;
  displayName: string;
  overallProgress: number;
  subjects: Record<string, number>; // subjectId -> percentage
  lastUpdated: string | null;
}

export const usePublicProgress = () => {
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all profiles
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, user_id, email, display_name, last_active_at, created_at");

        setUserProfiles(profilesData || []);

        // Fetch ALL study records with valid status only
        // Use pagination to get all records (PostgREST defaults to 1000 rows)
        const PAGE_SIZE = 1000;
        const all: StudyRecord[] = [];
        let from = 0;

        while (true) {
          const { data, error: pageError } = await supabase
            .from("study_records")
            .select("user_id, subject, chapter, activity, status, updated_at")
            .eq("type", "status")
            .in("status", ["Done", "In progress"]) // Only fetch valid statuses
            .order("updated_at", { ascending: false }) // Most recent first
            .range(from, from + PAGE_SIZE - 1);

          if (pageError) throw pageError;

          const page = data || [];
          all.push(...page);

          if (page.length < PAGE_SIZE) break;
          from += PAGE_SIZE;
        }

        setStudyRecords(all);
      } catch (err: any) {
        console.error("Error fetching community progress:", err);
        setError(err?.message || "Failed to load community progress");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aggregate progress by user using the SAME calculation as Home
  const aggregatedProgress: CommunityUserProgress[] = useMemo(() => {
    // Create a lookup for profile data by user_id
    const profileLookup = new Map<string, UserProfile>();
    userProfiles.forEach((profile) => {
      profileLookup.set(profile.user_id, profile);
    });

    // Group records by user_id
    // Use a Map<user_id, Map<key, record>> to ensure only the latest record per activity
    const recordsByUser = new Map<string, Map<string, StudyRecord>>();
    
    studyRecords.forEach((record) => {
      if (!record.user_id) return;
      
      if (!recordsByUser.has(record.user_id)) {
        recordsByUser.set(record.user_id, new Map());
      }
      
      // Create unique key for this activity
      const key = `${record.subject}-${record.chapter}-${record.activity}`;
      const userRecords = recordsByUser.get(record.user_id)!;
      
      // Keep the record (since we ordered by updated_at desc, first one is latest)
      if (!userRecords.has(key)) {
        userRecords.set(key, record);
      }
    });

    // Calculate progress for each user using the SAME function as Home
    const results: CommunityUserProgress[] = [];

    recordsByUser.forEach((recordsMap, userId) => {
      const profile = profileLookup.get(userId);

      const displayName =
        profile?.display_name ||
        `Student • ${userId.slice(0, 4)}`;
      
      // Convert Map to array for calculation
      const records = Array.from(recordsMap.values());
      
      // Use the exact same calculation function as Home page
      const { overallProgress, subjects } = calculateUserProgress(records);
      
      const lastUpdated = records.reduce((latest, r) => {
        if (!latest || r.updated_at > latest) return r.updated_at;
        return latest;
      }, null as string | null);

      // Only include users with actual progress (> 0%)
      if (overallProgress > 0) {
        results.push({
          profileId: userId,
          displayName,
          overallProgress,
          subjects,
          lastUpdated,
        });
      }
    });

    // Sort by overall progress percentage (descending)
    return results.sort((a, b) => b.overallProgress - a.overallProgress);
  }, [studyRecords, userProfiles]);

  return {
    aggregatedProgress,
    loading,
    error,
  };
};

// Subject labels for display
export const SUBJECT_LABELS: Record<string, string> = {};
ALL_SUBJECTS.forEach((s) => {
  SUBJECT_LABELS[s.id] = s.displayName;
});
