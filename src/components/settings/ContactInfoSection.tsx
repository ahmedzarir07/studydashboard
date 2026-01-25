import { Phone, Mail, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ProfileData } from "@/hooks/useProfileSettings";

interface ContactInfoSectionProps {
  profile: ProfileData;
  onChange: (updates: Partial<ProfileData>) => void;
  isGoogleUser: boolean;
}

export const ContactInfoSection = ({
  profile,
  onChange,
  isGoogleUser,
}: ContactInfoSectionProps) => {
  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Phone className="h-4 w-4 text-purple-400" />
          </div>
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            Phone Number
            {profile.phone_verified && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </Label>
          <Input
            id="phone"
            type="tel"
            value={profile.phone_number}
            onChange={(e) => onChange({ phone_number: e.target.value })}
            placeholder="+880 1XXX-XXXXXX"
            className="bg-background/50"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            Email Address
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="bg-background/50 opacity-60"
          />
          {isGoogleUser && (
            <p className="text-xs text-muted-foreground">
              Email cannot be changed for Google-linked accounts
            </p>
          )}
        </div>

        {/* Google Linked Indicator */}
        {isGoogleUser && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="p-2 rounded-full bg-red-500/20">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                />
                <path
                  fill="#34A853"
                  d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970244 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                />
                <path
                  fill="#4A90E2"
                  d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7## C1.2323784,17.3388284 L5.27698177,14.2678769 Z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Google Account Linked</p>
              <p className="text-xs text-muted-foreground">
                You signed in with Google
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
