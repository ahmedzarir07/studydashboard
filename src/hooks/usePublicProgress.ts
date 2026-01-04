import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateUserProgress, ALL_SUBJECTS } from "./useProgressSnapshot";

interface PublicStudyRecord {
  user_id: string;
  profile_id: string;
  display_name: string | null;
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
  const { user } = useAuth();
  const [studyRecords, setStudyRecords] = useState<PublicStudyRecord[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if current user is admin
        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();
          
          setIsAdmin(roleData?.role === "admin");
        }
        
        // Fetch all profiles
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, user_id, email, display_name, last_active_at, created_at");
        
        setUserProfiles(profilesData || []);
        
        // Fetch public study progress from view
        const { data: studyData, error: studyError } = await supabase
          .from("public_study_progress")
          .select("user_id, profile_id, display_name, subject, chapter, activity, status, updated_at")
          .order("updated_at", { ascending: false });

        if (studyError) {
          console.error("Error fetching public study progress:", studyError);
          setError(studyError.message);
        } else {
          setStudyRecords(studyData || []);
        }
      } catch (err) {
        console.error("Error fetching public progress:", err);
        setError("Failed to load community progress");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Aggregate progress by user using the SAME calculation as Home
  const aggregatedProgress: CommunityUserProgress[] = useMemo(() => {
    // Create a lookup for profile data by user_id only
    const profileLookup = new Map<string, UserProfile>();
    userProfiles.forEach((profile) => {
      profileLookup.set(profile.user_id, profile);
    });

    // Group records by user_id (same as Home uses auth.user.id)
    const recordsByUser = new Map<string, PublicStudyRecord[]>();
    studyRecords.forEach((record) => {
      if (!record.user_id) return;
      
      if (!recordsByUser.has(record.user_id)) {
        recordsByUser.set(record.user_id, []);
      }
      recordsByUser.get(record.user_id)!.push(record);
    });

    // Calculate progress for each user using the SAME function as Home
    const results: CommunityUserProgress[] = [];

    recordsByUser.forEach((records, userId) => {
      const profile = profileLookup.get(userId);
      const displayName = profile?.display_name || records[0]?.display_name || profile?.email || "Anonymous Student";
      
      // Use the exact same calculation function as Home page
      const { overallProgress, subjects } = calculateUserProgress(records);
      
      const lastUpdated = records.reduce((latest, r) => {
        if (!latest || r.updated_at > latest) return r.updated_at;
        return latest;
      }, null as string | null);

      results.push({
        profileId: userId,
        displayName,
        overallProgress,
        subjects,
        lastUpdated,
      });
    });

    // Sort by overall progress percentage (descending)
    return results.sort((a, b) => b.overallProgress - a.overallProgress);
  }, [studyRecords, userProfiles]);

  return {
    aggregatedProgress,
    isAdmin,
    loading,
    error,
  };
};

// Subject labels for display
export const SUBJECT_LABELS: Record<string, string> = {};
ALL_SUBJECTS.forEach((s) => {
  SUBJECT_LABELS[s.id] = s.displayName;
});
