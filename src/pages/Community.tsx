import { usePublicProgress } from "@/hooks/usePublicProgress";
import { ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/CircularProgress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Loader2, 
  Users, 
  ChevronDown, 
  ChevronRight,
  Trophy,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Build subject metadata lookup
const SUBJECT_META = ALL_SUBJECTS.reduce((acc, s) => {
  acc[s.id] = { displayName: s.displayName, color: s.color, fullName: s.data.name };
  return acc;
}, {} as Record<string, { displayName: string; color: string; fullName: string }>);

export default function Community() {
  const { aggregatedProgress, loading, error } = usePublicProgress();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleUser = (profileId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(profileId)) {
      newExpanded.delete(profileId);
    } else {
      newExpanded.add(profileId);
    }
    setExpandedUsers(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <MobileHeader title="Community" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Community Progress</h1>
            <p className="text-sm text-muted-foreground">
              See how other students are progressing
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="p-3 mb-6 bg-muted/50 border-muted">
          <p className="text-xs text-muted-foreground text-center">
            Progress shown here uses the same calculation as Home.
          </p>
        </Card>

        {error && (
          <Card className="p-4 mb-6 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {aggregatedProgress.length === 0 ? (
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No public progress yet
            </h3>
            <p className="text-muted-foreground">
              Be the first to share your study progress with the community!
              Go to Settings to enable public sharing.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Leaderboard */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h2 className="font-semibold text-foreground">Top Students</h2>
              </div>
              <div className="space-y-3">
                {aggregatedProgress.slice(0, 3).map((user, index) => (
                  <div 
                    key={user.profileId}
                    className="flex items-center gap-3"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      index === 0 ? "bg-yellow-500 text-yellow-950" :
                      index === 1 ? "bg-gray-300 text-gray-700" :
                      "bg-amber-600 text-amber-950"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user.displayName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircularProgress percentage={user.overallProgress} size={40} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* All Users - Same view as Home */}
            <div className="space-y-4">
              {aggregatedProgress.map((user) => {
                const isExpanded = expandedUsers.has(user.profileId);

                return (
                  <Collapsible key={user.profileId}>
                    <Card className="overflow-hidden">
                      <CollapsibleTrigger
                        onClick={() => toggleUser(user.profileId)}
                        className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-foreground truncate">
                            {user.displayName}
                          </p>
                        </div>
                        <CircularProgress percentage={user.overallProgress} size={48} />
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-2">
                          {/* Overall Progress - Same as Home */}
                          <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="bg-card/50 rounded-2xl p-4">
                              <CircularProgress percentage={user.overallProgress} size={100} />
                            </div>
                          </div>

                          {/* Subject Grid - Same as Home */}
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-foreground mb-3">
                              Subject Progress
                            </h3>
                            <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth-touch pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible">
                              <TooltipProvider>
                                {ALL_SUBJECTS.map(({ id, displayName, data, color }) => {
                                  const progress = user.subjects[id] ?? 0;
                                  return (
                                    <Tooltip key={id}>
                                      <TooltipTrigger asChild>
                                        <div className="flex-shrink-0 w-[90px] md:w-auto bg-card/60 rounded-xl p-3 flex flex-col items-center gap-2">
                                          <div className="relative w-12 h-12 md:w-14 md:h-14">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                              <circle
                                                cx="18"
                                                cy="18"
                                                r="15.5"
                                                fill="none"
                                                className="stroke-muted/30"
                                                strokeWidth="3"
                                              />
                                              <circle
                                                cx="18"
                                                cy="18"
                                                r="15.5"
                                                fill="none"
                                                stroke={color}
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray={`${progress * 0.975} 100`}
                                              />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                                              {progress}%
                                            </span>
                                          </div>
                                          <span className="text-[10px] text-muted-foreground text-center leading-tight whitespace-nowrap">
                                            {displayName}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{data.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
