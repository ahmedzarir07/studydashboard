import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserSettings {
  displayName: string | null;
  isPublic: boolean;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    displayName: null,
    isPublic: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch profile for display name
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        // Check if any records are public (to determine toggle state)
        const { data: studyData, error: studyError } = await supabase
          .from("study_records")
          .select("is_public")
          .eq("user_id", user.id)
          .eq("is_public", true)
          .limit(1);

        if (studyError) {
          console.error("Error checking public status:", studyError);
        }

        setSettings({
          displayName: profileData?.display_name || null,
          isPublic: (studyData?.length || 0) > 0,
        });
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // Update display name
  const updateDisplayName = useCallback(async (displayName: string) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName || null })
        .eq("user_id", user.id);

      if (error) throw error;

      setSettings((prev) => ({ ...prev, displayName }));
      toast.success("Display name updated");
    } catch (err) {
      console.error("Error updating display name:", err);
      toast.error("Failed to update display name");
    } finally {
      setSaving(false);
    }
  }, [user]);

  // Toggle public visibility for all records
  const togglePublicProgress = useCallback(async (isPublic: boolean) => {
    if (!user) return;

    setSaving(true);
    try {
      // Update all study records
      const { error: studyError } = await supabase
        .from("study_records")
        .update({ is_public: isPublic })
        .eq("user_id", user.id);

      if (studyError) throw studyError;

      // Update all chapter completions
      const { error: chapterError } = await supabase
        .from("chapter_completions")
        .update({ is_public: isPublic })
        .eq("user_id", user.id);

      if (chapterError) throw chapterError;

      setSettings((prev) => ({ ...prev, isPublic }));
      toast.success(isPublic ? "Your progress is now public" : "Your progress is now private");
    } catch (err) {
      console.error("Error toggling public visibility:", err);
      toast.error("Failed to update visibility settings");
    } finally {
      setSaving(false);
    }
  }, [user]);

  return {
    settings,
    loading,
    saving,
    updateDisplayName,
    togglePublicProgress,
  };
};
