import { useState, useEffect } from "react";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Activity {
  name: string;
  status: string;
}

interface PlanningChapterCardProps {
  chapterName: string;
  activities: Activity[];
  plannedActivities: string[];
  completedActivities: string[];
  goals: string;
  notes: string;
  onSave: (activities: string[], goals: string, notes: string) => void;
  onRemove: () => void;
  isPlanned: boolean;
}

// All activities from all subjects that can be planned
const PLANNABLE_ACTIVITIES = [
  // Science subjects
  "Lecture",
  "ক",
  "খ",
  "Notes",
  "MCQ Practice",
  "MCQ Summary",
  "CQ Summary",
  "Written CQ",
  "Revision",
  "Exam",
  // Math subjects
  "CQ Practice",
  "Book Problems",
  // English 1st Paper - Reading
  "SQ",
  "Info Transfer",
  "Vocabulary",
  // English 1st Paper - Grammar
  "Practice",
  "Model Answers",
  "Error Analysis",
  "Mock Practice",
  // English 1st Paper - Writing
  "Practice Drafts",
  "Model Review",
  "Final Draft",
  // English 2nd Paper - Grammar
  "Practice Sets",
  "Error Log",
  "Final Practice",
  // English 2nd Paper - Functional
  "Model Samples",
  "Expressions",
  // English 2nd Paper - Creative
  "Idea Planning",
  "Practice Writing",
  "Model Reading",
  // Bangla 1st Paper - গদ্য
  "Text Reading",
  // Bangla 1st Paper - কবিতা
  "Poem Reading",
  "Theme",
  // Bangla 1st Paper - উপন্যাস
  "Chapter Reading",
  // Bangla 2nd Paper - ব্যাকরণ
  "Rule Notes",
  // Bangla 2nd Paper - নির্মিত
  "Format Templates",
  // Bangla 2nd Paper - প্রবন্ধ
  "Outline",
  "Model Essays",
];

export function PlanningChapterCard({
  chapterName,
  activities,
  plannedActivities,
  completedActivities,
  goals,
  notes,
  onSave,
  onRemove,
  isPlanned,
}: PlanningChapterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(plannedActivities);
  const [localGoals, setLocalGoals] = useState(goals);
  const [localNotes, setLocalNotes] = useState(notes);

  useEffect(() => {
    setSelectedActivities(plannedActivities);
    setLocalGoals(goals);
    setLocalNotes(notes);
  }, [plannedActivities, goals, notes]);

  const handleActivityToggle = (activityName: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activityName)
        ? prev.filter((a) => a !== activityName)
        : [...prev, activityName]
    );
  };

  const handleSave = () => {
    onSave(selectedActivities, localGoals, localNotes);
    setIsExpanded(false);
  };

  const completedCount = selectedActivities.filter((a) =>
    completedActivities.includes(a)
  ).length;
  const totalPlanned = selectedActivities.length;
  const progressPercent = totalPlanned > 0 ? Math.round((completedCount / totalPlanned) * 100) : 0;

  const availableActivities = activities
    .filter((a) => PLANNABLE_ACTIVITIES.includes(a.name))
    .map((a) => a.name);

  return (
    <div
      className={cn(
        "bg-card/60 rounded-xl overflow-hidden transition-all",
        isPlanned && "ring-1 ring-primary/30"
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate pr-2">
            {chapterName}
          </h3>
          {isPlanned && (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden max-w-[120px]">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {completedCount}/{totalPlanned}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPlanned && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Planned
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/50">
          {/* Activity Selection */}
          <div className="pt-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Select Activities
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableActivities.map((activityName) => {
                const isSelected = selectedActivities.includes(activityName);
                const isCompleted = completedActivities.includes(activityName);
                return (
                  <label
                    key={activityName}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all",
                      isSelected
                        ? isCompleted
                          ? "bg-green-500/20 text-green-500"
                          : "bg-primary/20 text-primary"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleActivityToggle(activityName)}
                      className="h-3.5 w-3.5"
                    />
                    {activityName}
                    {isCompleted && <Check className="h-3 w-3" />}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Goals */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Goals (Optional)
            </h4>
            <Textarea
              value={localGoals}
              onChange={(e) => setLocalGoals(e.target.value)}
              placeholder="e.g., Complete all MCQ practice by 15th"
              className="min-h-[60px] text-sm resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Notes (Optional)
            </h4>
            <Textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="Add any review notes..."
              className="min-h-[60px] text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="flex-1">
              Save Plan
            </Button>
            {isPlanned && (
              <Button
                onClick={onRemove}
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
