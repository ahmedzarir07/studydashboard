import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  created_at: string;
  last_active_at: string | null;
}

interface StudyRecord {
  id: string;
  user_id: string;
  subject: string;
  chapter: string;
  activity: string;
  type: string;
  status: string | null;
}

interface UserProgress {
  userId: string;
  email: string;
  createdAt: string;
  lastActiveAt: string | null;
  isAdmin: boolean;
  subjects: {
    [subjectId: string]: {
      totalActivities: number;
      completedActivities: number;
      inProgressActivities: number;
      chapters: {
        [chapterName: string]: {
          totalActivities: number;
          completedActivities: number;
          inProgressActivities: number;
        };
      };
    };
  };
}

export const useAdminData = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);
  const [adminUserIds, setAdminUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if current user is admin
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error checking role:", roleError);
          setLoading(false);
          return;
        }

        const userIsAdmin = roleData?.role === "admin";
        setIsAdmin(userIsAdmin);

        if (!userIsAdmin) {
          setLoading(false);
          return;
        }

        // Fetch all profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        } else {
          setProfiles(profilesData || []);
        }

        // Fetch all study records
        const { data: recordsData, error: recordsError } = await supabase
          .from("study_records")
          .select("*");

        if (recordsError) {
          console.error("Error fetching study records:", recordsError);
        } else {
          setStudyRecords(recordsData || []);
        }

        // Fetch all admin user IDs
        const { data: adminsData, error: adminsError } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");

        if (adminsError) {
          console.error("Error fetching admins:", adminsError);
        } else {
          setAdminUserIds(adminsData?.map((a) => a.user_id) || []);
        }
      } catch (error) {
        console.error("Error in admin data fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [user]);

  const usersProgress = useMemo((): UserProgress[] => {
    return profiles.map((profile) => {
      const userRecords = studyRecords.filter(
        (r) => r.user_id === profile.user_id
      );

      const subjects: UserProgress["subjects"] = {};

      userRecords.forEach((record) => {
        if (!subjects[record.subject]) {
          subjects[record.subject] = {
            totalActivities: 0,
            completedActivities: 0,
            inProgressActivities: 0,
            chapters: {},
          };
        }

        const subject = subjects[record.subject];
        
        if (!subject.chapters[record.chapter]) {
          subject.chapters[record.chapter] = {
            totalActivities: 0,
            completedActivities: 0,
            inProgressActivities: 0,
          };
        }

        const chapter = subject.chapters[record.chapter];

        // Count activities
        if (record.status === "Done") {
          subject.completedActivities++;
          chapter.completedActivities++;
        } else if (record.status === "In progress") {
          subject.inProgressActivities++;
          chapter.inProgressActivities++;
        }
        
        subject.totalActivities++;
        chapter.totalActivities++;
      });

      return {
        userId: profile.user_id,
        email: profile.email || "Unknown",
        createdAt: profile.created_at,
        lastActiveAt: profile.last_active_at,
        isAdmin: adminUserIds.includes(profile.user_id),
        subjects,
      };
    });
  }, [profiles, studyRecords, adminUserIds]);

  return {
    loading,
    isAdmin,
    usersProgress,
    totalUsers: profiles.length,
  };
};
