import { usePublicProgress } from "@/hooks/usePublicProgress";
import { ALL_SUBJECTS, useProgressSnapshot } from "@/hooks/useProgressSnapshot";
import { useAuth } from "@/contexts/AuthContext";
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
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// Build subject metadata lookup
const SUBJECT_META = ALL_SUBJECTS.reduce((acc, s) => {
  acc[s.id] = { displayName: s.displayName, color: s.color, fullName: s.data.name };
  return acc;
}, {} as Record<string, { displayName: string; color: string; fullName: string }>);

export default function Community() {
  const { user } = useAuth();
  const { aggregatedProgress, loading, error } = usePublicProgress();
  const mySnapshot = useProgressSnapshot();

  // Merge lists: for current user, always use Home snapshot so progress matches exactly
  const mergedProgress = useMemo(() => {
    if (!user) return aggregatedProgress;

    // Build subjects record from snapshot
    const mySubjects: Record<string, number> = {};
    mySnapshot.subjects.forEach((s) => {
      mySubjects[s.id] = s.progress;
    });

    const myEntry = {
      profileId: user.id,
      displayName: aggregatedProgress.find((p) => p.profileId === user.id)?.displayName || "You",
      overallProgress: mySnapshot.overallProgress,
      subjects: mySubjects,
      lastUpdated: new Date().toISOString(),
    };

    // Replace or append
    const others = aggregatedProgress.filter((p) => p.profileId !== user.id);
    return [myEntry, ...others].sort((a, b) => b.overallProgress - a.overallProgress);
  }, [aggregatedProgress, user, mySnapshot]);

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
            Tip: many students use the default name. Set a display name in Settings to avoid confusion.
          </p>
        </Card>

        {user && (
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-3 rounded-xl border bg-card/50 p-3">
              <CircularProgress percentage={mySnapshot.overallProgress} size={56} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Your progress (same as Home)</p>
                <p className="text-xs text-muted-foreground">Look for "(You)" in the list below.</p>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <Card className="p-4 mb-6 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {mergedProgress.length === 0 ? (
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No progress yet
            </h3>
            <p className="text-muted-foreground">
              Start tracking your study progress to appear here!
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
                {mergedProgress.slice(0, 3).map((entry, index) => (
                  <div 
                    key={entry.profileId}
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
                        {user && entry.profileId === user.id ? `${entry.displayName} (You)` : entry.displayName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircularProgress percentage={entry.overallProgress} size={40} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* All Users - Same view as Home */}
            <div className="space-y-4">
              {mergedProgress.map((u) => {
                const isExpanded = expandedUsers.has(u.profileId);
                const isMe = !!user && u.profileId === user.id;

                return (
                  <Collapsible key={u.profileId}>
                    <Card className={cn("overflow-hidden", isMe && "ring-1 ring-primary/30") }>
                      <CollapsibleTrigger
                        onClick={() => toggleUser(u.profileId)}
                        className={cn(
                          "w-full p-4 flex items-center gap-3 transition-colors",
                          isMe ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                        )}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-foreground truncate">
                            {isMe ? `${u.displayName} (You)` : u.displayName}
                          </p>
                        </div>
                        <CircularProgress percentage={u.overallProgress} size={48} />
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-2">
                          {/* Overall Progress - Same as Home */}
                          <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="bg-card/50 rounded-2xl p-4">
                              <CircularProgress percentage={u.overallProgress} size={100} />
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
                                  const progress = u.subjects[id] ?? 0;
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
