import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StudyCoachSettings {
  id: string;
  user_id: string;
  batch: string;
  months_remaining: number;
  completion_percentage: number;
  risk_level: string;
  notifications_enabled: boolean;
  notification_email: string | null;
  notification_time: string;
  last_notification_sent: string | null;
  created_at: string;
  updated_at: string;
}

type InsertSettings = Omit<StudyCoachSettings, 'id' | 'created_at' | 'updated_at' | 'last_notification_sent'>;

export function useStudyCoachSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["study-coach-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("study_coach_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as StudyCoachSettings | null;
    },
    enabled: !!user,
  });

  const saveSettings = useMutation({
    mutationFn: async (newSettings: Partial<InsertSettings> & { batch: string; months_remaining: number; completion_percentage: number; risk_level: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const settingsData = {
        user_id: user.id,
        batch: newSettings.batch,
        months_remaining: newSettings.months_remaining,
        completion_percentage: newSettings.completion_percentage,
        risk_level: newSettings.risk_level,
        notifications_enabled: newSettings.notifications_enabled ?? false,
        notification_email: newSettings.notification_email ?? user.email,
        notification_time: newSettings.notification_time ?? "08:00:00",
      };

      if (settings) {
        // Update existing settings
        const { data, error } = await supabase
          .from("study_coach_settings")
          .update(settingsData)
          .eq("id", settings.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from("study_coach_settings")
          .insert(settingsData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-coach-settings", user?.id] });
    },
    onError: (error) => {
      console.error("Failed to save settings:", error);
      toast.error("সেটিংস সংরক্ষণে সমস্যা হয়েছে");
    },
  });

  const updateNotificationSettings = useMutation({
    mutationFn: async ({ enabled }: { enabled: boolean }) => {
      if (!user || !settings) throw new Error("Settings not found");
      
      const { data, error } = await supabase
        .from("study_coach_settings")
        .update({
          notifications_enabled: enabled,
        })
        .eq("id", settings.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["study-coach-settings", user?.id] });
      if (data.notifications_enabled) {
        toast.success("দৈনিক রিমাইন্ডার চালু করা হয়েছে");
      } else {
        toast.success("দৈনিক রিমাইন্ডার বন্ধ করা হয়েছে");
      }
    },
    onError: (error) => {
      console.error("Failed to update notification settings:", error);
      toast.error("রিমাইন্ডার সেটিংস আপডেট করতে সমস্যা হয়েছে");
    },
  });

  return {
    settings,
    isLoading,
    saveSettings,
    updateNotificationSettings,
  };
}
