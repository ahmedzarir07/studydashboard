import { User, Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileData } from "@/hooks/useProfileSettings";

interface PersonalInfoSectionProps {
  profile: ProfileData;
  onChange: (updates: Partial<ProfileData>) => void;
}

export const PersonalInfoSection = ({ profile, onChange }: PersonalInfoSectionProps) => {
  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <User className="h-4 w-4 text-blue-400" />
          </div>
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.full_name}
              onChange={(e) => onChange({ full_name: e.target.value })}
              placeholder="Enter your full name"
              className="bg-background/50"
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={profile.display_name}
              onChange={(e) => onChange({ display_name: e.target.value })}
              placeholder="How you appear to others"
              className="bg-background/50"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={profile.date_of_birth}
              onChange={(e) => onChange({ date_of_birth: e.target.value })}
              className="bg-background/50"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={profile.gender}
              onValueChange={(value) => onChange({ gender: value })}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            Address
          </Label>
          <Input
            id="address"
            value={profile.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Enter your address"
            className="bg-background/50"
          />
        </div>
      </CardContent>
    </Card>
  );
};
