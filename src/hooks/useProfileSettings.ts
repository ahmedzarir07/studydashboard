import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ProfileData {
  full_name: string;
  display_name: string;
  email: string;
  avatar_url: string;
  date_of_birth: string;
  gender: string;
  address: string;
  study_type: string;
  group_name: string;
  batch: string;
  board_roll: string;
  registration_number: string;
  board_name: string;
  passing_year: number | null;
  optional_subjects: string[];
  phone_number: string;
  phone_verified: boolean;
  google_linked: boolean;
}

const defaultProfile: ProfileData = {
  full_name: "",
  display_name: "",
  email: "",
  avatar_url: "",
  date_of_birth: "",
  gender: "",
  address: "",
  study_type: "hsc",
  group_name: "science",
  batch: "",
  board_roll: "",
  registration_number: "",
  board_name: "",
  passing_year: null,
  optional_subjects: [],
  phone_number: "",
  phone_verified: false,
  google_linked: false,
};

export const useProfileSettings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Check if user signed in with Google
  const isGoogleUser = user?.app_metadata?.provider === "google";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            display_name: data.display_name || "",
            email: data.email || user.email || "",
            avatar_url: data.avatar_url || user.user_metadata?.avatar_url || "",
            date_of_birth: data.date_of_birth || "",
            gender: data.gender || "",
            address: data.address || "",
            study_type: data.study_type || "hsc",
            group_name: data.group_name || "science",
            batch: data.batch || "",
            board_roll: data.board_roll || "",
            registration_number: data.registration_number || "",
            board_name: data.board_name || "",
            passing_year: data.passing_year || null,
            optional_subjects: data.optional_subjects || [],
            phone_number: data.phone_number || "",
            phone_verified: data.phone_verified || false,
            google_linked: isGoogleUser || data.google_linked || false,
          });
        } else {
          // Set defaults from auth
          setProfile({
            ...defaultProfile,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || "",
            display_name: user.user_metadata?.name || "",
            avatar_url: user.user_metadata?.avatar_url || "",
            google_linked: isGoogleUser,
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isGoogleUser]);

  const updateProfile = useCallback(
    async (updates: Partial<ProfileData>) => {
      if (!user) return false;

      setSaving(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: updates.full_name,
            display_name: updates.display_name,
            avatar_url: updates.avatar_url,
            date_of_birth: updates.date_of_birth || null,
            gender: updates.gender || null,
            address: updates.address,
            study_type: updates.study_type,
            group_name: updates.group_name,
            batch: updates.batch,
            board_roll: updates.board_roll,
            registration_number: updates.registration_number,
            board_name: updates.board_name,
            passing_year: updates.passing_year,
            optional_subjects: updates.optional_subjects,
            phone_number: updates.phone_number,
          })
          .eq("user_id", user.id);

        if (error) throw error;

        setProfile((prev) => ({ ...prev, ...updates }));
        toast.success("Profile updated successfully!");
        return true;
      } catch (err) {
        console.error("Error updating profile:", err);
        toast.error("Failed to update profile");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) return null;

      setAvatarUploading(true);
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("chat-attachments")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("chat-attachments")
          .getPublicUrl(filePath);

        const avatarUrl = urlData.publicUrl;

        // Update profile with new avatar URL
        await updateProfile({ ...profile, avatar_url: avatarUrl });

        return avatarUrl;
      } catch (err) {
        console.error("Error uploading avatar:", err);
        toast.error("Failed to upload avatar");
        return null;
      } finally {
        setAvatarUploading(false);
      }
    },
    [user, profile, updateProfile]
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;

        toast.success("Password updated successfully!");
        return true;
      } catch (err: any) {
        console.error("Error updating password:", err);
        toast.error(err.message || "Failed to update password");
        return false;
      }
    },
    []
  );

  return {
    profile,
    setProfile,
    loading,
    saving,
    avatarUploading,
    isGoogleUser,
    updateProfile,
    uploadAvatar,
    updatePassword,
  };
};
