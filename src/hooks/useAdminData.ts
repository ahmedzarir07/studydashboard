import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  full_name: string | null;
  phone_number: string | null;
  batch: string | null;
  group_name: string | null;
  board_name: string | null;
  study_type: string | null;
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
  created_at: string;
  updated_at: string;
}

interface ChapterCompletion {
  id: string;
  user_id: string;
  subject: string;
  chapter: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface MonthlyPlan {
  id: string;
  user_id: string;
  month_year: string;
  subject: string;
  chapter: string;
  planned_activities: string[];
  goals: string | null;
  created_at: string;
}

interface ChapterResource {
  id: string;
  user_id: string;
  subject: string;
  chapter: string;
  title: string;
  url: string;
  created_at: string;
}

interface AiChatMessage {
  id: string;
  user_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface StudyCoachSettings {
  id: string;
  user_id: string;
  batch: string;
  months_remaining: number;
  completion_percentage: number;
  notifications_enabled: boolean;
  created_at: string;
}

interface UserProgress {
  userId: string;
  email: string;
  displayName: string | null;
  fullName: string | null;
  phone: string | null;
  batch: string | null;
  groupName: string | null;
  boardName: string | null;
  studyType: string | null;
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
  completedChapters: number;
  totalPlans: number;
  totalResources: number;
  totalChatMessages: number;
  hasCoachSettings: boolean;
}

interface DatabaseStats {
  totalProfiles: number;
  totalStudyRecords: number;
  totalChapterCompletions: number;
  totalMonthlyPlans: number;
  totalResources: number;
  totalChatMessages: number;
  totalCoachSettings: number;
}

export const useAdminData = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);
  const [chapterCompletions, setChapterCompletions] = useState<ChapterCompletion[]>([]);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[]>([]);
  const [chapterResources, setChapterResources] = useState<ChapterResource[]>([]);
  const [aiChatMessages, setAiChatMessages] = useState<AiChatMessage[]>([]);
  const [studyCoachSettings, setStudyCoachSettings] = useState<StudyCoachSettings[]>([]);
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

        // Fetch all data in parallel
        const [
          profilesRes,
          recordsRes,
          completionsRes,
          plansRes,
          resourcesRes,
          chatRes,
          coachRes,
          adminsRes,
        ] = await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("study_records").select("*"),
          supabase.from("chapter_completions").select("*"),
          supabase.from("monthly_study_plans").select("*"),
          supabase.from("chapter_resources").select("*"),
          supabase.from("ai_chat_messages").select("*").order("created_at", { ascending: false }),
          supabase.from("study_coach_settings").select("*"),
          supabase.from("user_roles").select("user_id").eq("role", "admin"),
        ]);

        if (profilesRes.error) console.error("Profiles error:", profilesRes.error);
        if (recordsRes.error) console.error("Records error:", recordsRes.error);
        if (completionsRes.error) console.error("Completions error:", completionsRes.error);
        if (plansRes.error) console.error("Plans error:", plansRes.error);
        if (resourcesRes.error) console.error("Resources error:", resourcesRes.error);
        if (chatRes.error) console.error("Chat error:", chatRes.error);
        if (coachRes.error) console.error("Coach error:", coachRes.error);
        if (adminsRes.error) console.error("Admins error:", adminsRes.error);

        setProfiles(profilesRes.data || []);
        setStudyRecords(recordsRes.data || []);
        setChapterCompletions(completionsRes.data || []);
        setMonthlyPlans(plansRes.data || []);
        setChapterResources(resourcesRes.data || []);
        setAiChatMessages(chatRes.data || []);
        setStudyCoachSettings(coachRes.data || []);
        setAdminUserIds(adminsRes.data?.map((a) => a.user_id) || []);
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
      const userRecords = studyRecords.filter((r) => r.user_id === profile.user_id);
      const userCompletions = chapterCompletions.filter((c) => c.user_id === profile.user_id);
      const userPlans = monthlyPlans.filter((p) => p.user_id === profile.user_id);
      const userResources = chapterResources.filter((r) => r.user_id === profile.user_id);
      const userChats = aiChatMessages.filter((m) => m.user_id === profile.user_id);
      const userCoach = studyCoachSettings.find((s) => s.user_id === profile.user_id);

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
        displayName: profile.display_name,
        fullName: profile.full_name,
        phone: profile.phone_number,
        batch: profile.batch,
        groupName: profile.group_name,
        boardName: profile.board_name,
        studyType: profile.study_type,
        createdAt: profile.created_at,
        lastActiveAt: profile.last_active_at,
        isAdmin: adminUserIds.includes(profile.user_id),
        subjects,
        completedChapters: userCompletions.filter((c) => c.completed).length,
        totalPlans: userPlans.length,
        totalResources: userResources.length,
        totalChatMessages: userChats.length,
        hasCoachSettings: !!userCoach,
      };
    });
  }, [profiles, studyRecords, chapterCompletions, monthlyPlans, chapterResources, aiChatMessages, studyCoachSettings, adminUserIds]);

  const databaseStats = useMemo((): DatabaseStats => ({
    totalProfiles: profiles.length,
    totalStudyRecords: studyRecords.length,
    totalChapterCompletions: chapterCompletions.length,
    totalMonthlyPlans: monthlyPlans.length,
    totalResources: chapterResources.length,
    totalChatMessages: aiChatMessages.length,
    totalCoachSettings: studyCoachSettings.length,
  }), [profiles, studyRecords, chapterCompletions, monthlyPlans, chapterResources, aiChatMessages, studyCoachSettings]);

  return {
    loading,
    isAdmin,
    usersProgress,
    totalUsers: profiles.length,
    databaseStats,
    rawData: {
      profiles,
      studyRecords,
      chapterCompletions,
      monthlyPlans,
      chapterResources,
      aiChatMessages,
      studyCoachSettings,
    },
  };
};
