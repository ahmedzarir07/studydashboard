import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileSettings, ProfileData } from "@/hooks/useProfileSettings";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { PersonalInfoSection } from "@/components/settings/PersonalInfoSection";
import { AcademicInfoSection } from "@/components/settings/AcademicInfoSection";
import { ContactInfoSection } from "@/components/settings/ContactInfoSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { Button } from "@/components/ui/button";
import { Loader2, Settings as SettingsIcon, Save, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user, signOut, loading: authLoading } = useAuth();
  const {
    profile,
    setProfile,
    loading,
    saving,
    avatarUploading,
    isGoogleUser,
    updateProfile,
    uploadAvatar,
    updatePassword,
  } = useProfileSettings();

  const [hasChanges, setHasChanges] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleProfileChange = (updates: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await updateProfile(profile);
    if (success) {
      setHasChanges(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-6">
      <MobileHeader title="Settings" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <ProfileCard
            profile={profile}
            avatarUploading={avatarUploading}
            onAvatarUpload={uploadAvatar}
          />

          {/* Personal Information */}
          <PersonalInfoSection profile={profile} onChange={handleProfileChange} />

          {/* Academic Information */}
          <AcademicInfoSection profile={profile} onChange={handleProfileChange} />

          {/* Contact Information */}
          <ContactInfoSection
            profile={profile}
            onChange={handleProfileChange}
            isGoogleUser={isGoogleUser}
          />

          {/* Security */}
          <SecuritySection
            onPasswordUpdate={updatePassword}
            isGoogleUser={isGoogleUser}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex-1 sm:flex-none"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>

            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="flex-1 sm:flex-none"
              size="lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
