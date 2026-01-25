import { useRef } from "react";
import { Camera, Loader2, Mail, GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileData } from "@/hooks/useProfileSettings";

interface ProfileCardProps {
  profile: ProfileData;
  avatarUploading: boolean;
  onAvatarUpload: (file: File) => void;
}

export const ProfileCard = ({
  profile,
  avatarUploading,
  onAvatarUpload,
}: ProfileCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return;
      }
      onAvatarUpload(file);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar Section */}
        <div className="relative group">
          <Avatar className="h-24 w-24 border-2 border-primary/30">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
              {getInitials(profile.full_name || profile.display_name || "U")}
            </AvatarFallback>
          </Avatar>
          
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
          >
            {avatarUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-foreground">
            {profile.full_name || profile.display_name || "Your Name"}
          </h2>
          
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{profile.email}</span>
          </div>
          
          {profile.batch && (
            <div className="mt-3">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                <GraduationCap className="h-3 w-3 mr-1" />
                HSC {profile.batch}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
