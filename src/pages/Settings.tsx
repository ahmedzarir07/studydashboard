import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserSettings } from "@/hooks/useUserSettings";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Settings as SettingsIcon, Globe, User, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { settings, loading, saving, updateDisplayName, togglePublicProgress } = useUserSettings();
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [hasEditedName, setHasEditedName] = useState(false);

  // Initialize input when settings load
  if (!hasEditedName && settings.displayName !== null && displayNameInput === "") {
    setDisplayNameInput(settings.displayName || "");
  }

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

  const handleSaveDisplayName = () => {
    updateDisplayName(displayNameInput.trim());
    setHasEditedName(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <MobileHeader title="Settings" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your profile and privacy</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="mt-1.5 bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  This name will be shown in the community progress page
                </p>
                <div className="flex gap-2">
                  <Input
                    id="displayName"
                    value={displayNameInput}
                    onChange={(e) => {
                      setDisplayNameInput(e.target.value);
                      setHasEditedName(true);
                    }}
                    placeholder="Enter your display name"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveDisplayName}
                    disabled={saving || !hasEditedName}
                    size="sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Privacy</h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="public-toggle" className="text-base font-medium">
                  Share my progress publicly
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to see your study progress on the Community page.
                  Your email will never be shared.
                </p>
              </div>
              <Switch
                id="public-toggle"
                checked={settings.isPublic}
                onCheckedChange={togglePublicProgress}
                disabled={saving}
              />
            </div>
          </Card>

          {/* Sign Out */}
          <Card className="p-6">
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
