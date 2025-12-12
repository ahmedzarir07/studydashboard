import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, Loader2, LinkIcon, ExternalLink, CheckSquare, Square } from "lucide-react";
import { Chapter, Status } from "@/types/tracker";
import { useStudyRecords } from "@/hooks/useStudyRecords";
import { useAuth } from "@/contexts/AuthContext";
import { useChapterResources } from "@/hooks/useChapterResources";
import { useChapterCompletions } from "@/hooks/useChapterCompletions";
import { ResourceModal } from "@/components/ResourceModal";

const StatusBadge = ({ status, onClick, disabled }: { status: Status; onClick: () => void; disabled?: boolean }) => {
  const getStatusConfig = (s: Status) => {
    switch (s) {
      case "Done":
        return {
          icon: CheckCircle2,
          variant: "default" as const,
          className: "bg-success text-success-foreground hover:bg-success/90",
        };
      case "In progress":
        return {
          icon: Clock,
          variant: "secondary" as const,
          className: "bg-warning text-warning-foreground hover:bg-warning/90",
        };
      case "Not Started":
        return {
          icon: Circle,
          variant: "outline" as const,
          className: "hover:bg-muted",
        };
      default:
        return {
          icon: Circle,
          variant: "outline" as const,
          className: "opacity-30 hover:opacity-60",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-105 gap-1 text-xs",
        config.className,
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <Icon className="h-3 w-3" />
      {status || "—"}
    </Badge>
  );
};

interface ProgressTrackerProps {
  initialChapters: Chapter[];
  subjectId: string;
}

export const ProgressTracker = ({ initialChapters, subjectId }: ProgressTrackerProps) => {
  const { user } = useAuth();
  const { loading, saveStatus, saveClassNumber, getStatus, getClassNumber } = useStudyRecords(subjectId);
  const { getResource, saveResource, deleteResource, loading: resourcesLoading } = useChapterResources(subjectId);
  const { isChapterCompleted, markChapterCompleted, loading: completionsLoading } = useChapterCompletions();
  
  // Local state for optimistic updates
  const [localStatuses, setLocalStatuses] = useState<Record<string, Status>>({});
  const [localClassNumbers, setLocalClassNumbers] = useState<Record<string, string>>({});
  
  // Resource modal state
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  // Sync local state with database records
  useEffect(() => {
    const statuses: Record<string, Status> = {};
    const classNumbers: Record<string, string> = {};
    
    initialChapters.forEach((chapter) => {
      chapter.activities.forEach((activity) => {
        const key = `${chapter.name}-${activity.name}`;
        if (activity.name === "Total Lec") {
          classNumbers[chapter.name] = getClassNumber(chapter.name);
        } else {
          statuses[key] = getStatus(chapter.name, activity.name);
        }
      });
    });
    
    setLocalStatuses(statuses);
    setLocalClassNumbers(classNumbers);
  }, [initialChapters, getStatus, getClassNumber]);

  const cycleStatus = async (chapterName: string, activityName: string) => {
    if (!user) return;
    
    const key = `${chapterName}-${activityName}`;
    const statusCycle: Status[] = ["", "Not Started", "In progress", "Done"];
    const currentStatus = localStatuses[key] || "";
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const newStatus = statusCycle[nextIndex];
    
    // Optimistic update
    setLocalStatuses((prev) => ({ ...prev, [key]: newStatus }));
    
    // Save to database
    await saveStatus(chapterName, activityName, newStatus);
  };

  const handleClassNumberChange = async (chapterName: string, value: string) => {
    if (!user) return;
    
    // Optimistic update
    setLocalClassNumbers((prev) => ({ ...prev, [chapterName]: value }));
    
    // Save to database
    const numValue = value === "" ? null : parseInt(value, 10);
    await saveClassNumber(chapterName, numValue);
  };

  const getChapterProgress = (chapter: Chapter) => {
    let completedCount = 0;
    let totalCount = 0;
    
    chapter.activities.forEach((activity) => {
      if (activity.name !== "Total Lec") {
        totalCount++;
        const key = `${chapter.name}-${activity.name}`;
        if (localStatuses[key] === "Done") {
          completedCount++;
        }
      }
    });
    
    return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to track your progress.</p>
      </div>
    );
  }

  if (loading || resourcesLoading || completionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const openResourceModal = (chapterName: string) => {
    setSelectedChapter(chapterName);
    setResourceModalOpen(true);
  };

  const handleToggleComplete = async (chapterName: string) => {
    const isCompleted = isChapterCompleted(subjectId, chapterName);
    await markChapterCompleted(subjectId, chapterName, !isCompleted);
  };

  const selectedResource = selectedChapter ? getResource(subjectId, selectedChapter) : null;

  return (
    <>
      <div className="space-y-4">
        {initialChapters.map((chapter) => {
          const progress = getChapterProgress(chapter);
          const resource = getResource(subjectId, chapter.name);
          const completed = isChapterCompleted(subjectId, chapter.name);
          
          return (
            <Card
              key={chapter.id}
              className={cn(
                "p-6 hover:shadow-md transition-shadow duration-300 bg-card border-border",
                completed && "border-success/50 bg-success/5"
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => handleToggleComplete(chapter.name)}
                      title={completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {completed ? (
                        <CheckSquare className="h-5 w-5 text-success" />
                      ) : (
                        <Square className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                    <h3 className={cn(
                      "text-lg font-semibold text-foreground truncate",
                      completed && "line-through text-muted-foreground"
                    )}>
                      {chapter.name}
                    </h3>
                    {resource && (
                      <Badge variant="secondary" className="gap-1 text-xs flex-shrink-0">
                        <LinkIcon className="h-3 w-3" />
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {resource.title}
                        </a>
                        <ExternalLink className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openResourceModal(chapter.name)}
                      className="text-xs"
                    >
                      <LinkIcon className="h-3 w-3 mr-1" />
                      Resource
                    </Button>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">{progress}%</div>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                  {chapter.activities.map((activity, idx) => {
                    const key = `${chapter.name}-${activity.name}`;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="text-xs text-muted-foreground truncate" title={activity.name}>
                          {activity.name}
                        </div>
                        {activity.name === "Total Lec" ? (
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-muted gap-1 text-xs p-0 overflow-hidden"
                          >
                            <Input
                              type="number"
                              min="0"
                              placeholder="—"
                              value={localClassNumbers[chapter.name] || ""}
                              onChange={(e) => handleClassNumberChange(chapter.name, e.target.value)}
                              className="h-6 w-12 text-xs text-center border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </Badge>
                        ) : (
                          <StatusBadge
                            status={localStatuses[key] || ""}
                            onClick={() => cycleStatus(chapter.name, activity.name)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ResourceModal
        open={resourceModalOpen}
        onOpenChange={setResourceModalOpen}
        chapterName={selectedChapter || ""}
        subjectId={subjectId}
        existingResource={selectedResource ? { title: selectedResource.title, url: selectedResource.url } : null}
        onSave={async (title, url) => {
          if (!selectedChapter) return { error: "No chapter selected" };
          return saveResource(subjectId, selectedChapter, title, url);
        }}
        onDelete={() => {
          if (selectedChapter) {
            deleteResource(subjectId, selectedChapter);
          }
        }}
      />
    </>
  );
};
