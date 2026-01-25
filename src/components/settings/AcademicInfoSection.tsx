import { GraduationCap, BookOpen, School } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProfileData } from "@/hooks/useProfileSettings";

interface AcademicInfoSectionProps {
  profile: ProfileData;
  onChange: (updates: Partial<ProfileData>) => void;
}

const BOARDS = [
  "Dhaka",
  "Rajshahi",
  "Chittagong",
  "Comilla",
  "Jessore",
  "Sylhet",
  "Barishal",
  "Dinajpur",
  "Mymensingh",
  "Technical",
  "Madrasa",
];

const OPTIONAL_SUBJECTS = [
  "Biology",
  "Higher Math",
  "Statistics",
  "Psychology",
  "Agriculture",
  "Music",
  "Home Economics",
];

const BATCHES = ["2024", "2025", "2026", "2027", "2028"];

export const AcademicInfoSection = ({ profile, onChange }: AcademicInfoSectionProps) => {
  const handleOptionalSubjectChange = (subject: string, checked: boolean) => {
    const current = profile.optional_subjects || [];
    const updated = checked
      ? [...current, subject]
      : current.filter((s) => s !== subject);
    onChange({ optional_subjects: updated });
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-green-500/20">
            <GraduationCap className="h-4 w-4 text-green-400" />
          </div>
          Academic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Study Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              Study Type
            </Label>
            <Select
              value={profile.study_type}
              onValueChange={(value) => onChange({ study_type: value })}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hsc">HSC</SelectItem>
                <SelectItem value="admission">Admission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group */}
          <div className="space-y-2">
            <Label>Group</Label>
            <Select
              value={profile.group_name}
              onValueChange={(value) => onChange({ group_name: value })}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Batch */}
          <div className="space-y-2">
            <Label>Batch</Label>
            <Select
              value={profile.batch}
              onValueChange={(value) => onChange({ batch: value })}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {BATCHES.map((batch) => (
                  <SelectItem key={batch} value={batch}>
                    HSC {batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Passing Year */}
          <div className="space-y-2">
            <Label htmlFor="passingYear">Passing Year</Label>
            <Input
              id="passingYear"
              type="number"
              min="2020"
              max="2030"
              value={profile.passing_year || ""}
              onChange={(e) =>
                onChange({ passing_year: e.target.value ? parseInt(e.target.value) : null })
              }
              placeholder="e.g., 2025"
              className="bg-background/50"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Board Roll */}
          <div className="space-y-2">
            <Label htmlFor="boardRoll">Board Roll</Label>
            <Input
              id="boardRoll"
              value={profile.board_roll}
              onChange={(e) => onChange({ board_roll: e.target.value })}
              placeholder="Enter board roll number"
              className="bg-background/50"
            />
          </div>

          {/* Registration Number */}
          <div className="space-y-2">
            <Label htmlFor="regNumber">Registration Number</Label>
            <Input
              id="regNumber"
              value={profile.registration_number}
              onChange={(e) => onChange({ registration_number: e.target.value })}
              placeholder="Enter registration number"
              className="bg-background/50"
            />
          </div>
        </div>

        {/* Board Name */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <School className="h-3.5 w-3.5 text-muted-foreground" />
            Board Name
          </Label>
          <Select
            value={profile.board_name}
            onValueChange={(value) => onChange({ board_name: value })}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select your board" />
            </SelectTrigger>
            <SelectContent>
              {BOARDS.map((board) => (
                <SelectItem key={board} value={board.toLowerCase()}>
                  {board} Board
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional Subjects */}
        <div className="space-y-3">
          <Label>Optional Subjects</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {OPTIONAL_SUBJECTS.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={`subject-${subject}`}
                  checked={profile.optional_subjects?.includes(subject) || false}
                  onCheckedChange={(checked) =>
                    handleOptionalSubjectChange(subject, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`subject-${subject}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {subject}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
