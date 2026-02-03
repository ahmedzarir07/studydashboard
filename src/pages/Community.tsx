import { usePublicProgress } from "@/hooks/usePublicProgress";
import { ALL_SUBJECTS, useProgressSnapshot } from "@/hooks/useProgressSnapshot";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
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
  Crown,
  Medal,
  Award,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// Build subject metadata lookup
const SUBJECT_META = ALL_SUBJECTS.reduce((acc, s) => {
  acc[s.data.id] = { displayName: s.displayName, color: s.color, fullName: s.data.name };
  return acc;
}, {} as Record<string, { displayName: string; color: string; fullName: string }>);

// Get rank badge styling
const getRankBadge = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        icon: Crown,
        bgClass: "bg-gradient-to-br from-yellow-400 to-amber-500",
        textClass: "text-yellow-950",
        glowClass: "shadow-[0_0_20px_hsl(45,100%,50%,0.4)]",
        label: "🥇",
      };
    case 2:
      return {
        icon: Medal,
        bgClass: "bg-gradient-to-br from-gray-300 to-gray-400",
        textClass: "text-gray-800",
        glowClass: "shadow-[0_0_15px_hsl(0,0%,70%,0.3)]",
        label: "🥈",
      };
    case 3:
      return {
        icon: Award,
        bgClass: "bg-gradient-to-br from-amber-500 to-orange-600",
        textClass: "text-amber-950",
        glowClass: "shadow-[0_0_15px_hsl(30,100%,50%,0.3)]",
        label: "🥉",
      };
    default:
      return {
        icon: Star,
        bgClass: "bg-muted",
        textClass: "text-muted-foreground",
        glowClass: "",
        label: `#${rank}`,
      };
  }
};

export default function Community() {
  const { user } = useAuth();
  const { aggregatedProgress, loading, error } = usePublicProgress();
  const mySnapshot = useProgressSnapshot();

  // Merge lists: for current user, use Home snapshot to ensure real-time accuracy
  // Other users' data comes directly from aggregatedProgress (database)
  const mergedProgress = useMemo(() => {
    // If no user logged in, just return aggregated data as-is
    if (!user) return aggregatedProgress;

    // Build subjects record from current user's snapshot
    const mySubjects: Record<string, number> = {};
    mySnapshot.subjects.forEach((s) => {
      mySubjects[s.id] = s.progress;
    });

    // Find existing profile data for display name
    const existingProfile = aggregatedProgress.find((p) => p.profileId === user.id);
    
    const myEntry = {
      profileId: user.id,
      displayName: existingProfile?.displayName || "You",
      email: user.email || null,
      overallProgress: mySnapshot.overallProgress,
      subjects: mySubjects,
      lastUpdated: new Date().toISOString(),
    };

    // Get all other users' progress directly from database (no modifications)
    const others = aggregatedProgress.filter((p) => p.profileId !== user.id);
    
    // Only include current user if they have progress
    const result = mySnapshot.overallProgress > 0 
      ? [myEntry, ...others] 
      : others;
    
    return result.sort((a, b) => b.overallProgress - a.overallProgress);
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

  // Find current user's rank
  const myRank = useMemo(() => {
    if (!user) return null;
    const idx = mergedProgress.findIndex((p) => p.profileId === user.id);
    return idx >= 0 ? idx + 1 : null;
  }, [mergedProgress, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative" />
          </div>
          <p className="text-muted-foreground text-sm">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout title="Community">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Hero Header */}
        <div className="glass-card neon-border p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-2xl" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl pulse-glow">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold gradient-text">Community Progress</h1>
              <p className="text-sm text-muted-foreground mt-1">
                See how other HSC students are progressing
              </p>
            </div>
            {myRank && (
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">Your Rank</span>
                <span className="text-2xl font-bold gradient-text">#{myRank}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="glass-card p-3 border-primary/20">
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Tip: Set a display name in Settings to stand out on the leaderboard
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </p>
        </div>

        {/* Current User Quick Stats */}
        {user && (
          <div className="glass-card neon-border p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
            <div className="flex items-center gap-4 relative z-10">
              <CircularProgress percentage={mySnapshot.overallProgress} size={64} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Your Progress</p>
                <p className="text-xs text-muted-foreground">Synced with your Home page</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="font-medium text-accent">{mySnapshot.overallProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <Card className="p-4 border-destructive/50 bg-destructive/10">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        )}

        {mergedProgress.length === 0 ? (
          <div className="glass-card neon-border p-8 text-center">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <Sparkles className="h-14 w-14 text-primary relative" />
            </div>
            <h3 className="text-lg font-semibold gradient-text mb-2">
              No progress yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Start tracking your study progress to appear here!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Leaderboard */}
            <div className="glass-card neon-border p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl" />
              
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <h2 className="font-semibold gradient-text">Top Students</h2>
              </div>
              
              <div className="grid gap-3">
                {mergedProgress.slice(0, 3).map((entry, index) => {
                  const rank = index + 1;
                  const badge = getRankBadge(rank);
                  const isMe = user && entry.profileId === user.id;
                  const BadgeIcon = badge.icon;
                  
                  return (
                    <div 
                      key={entry.profileId}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-xl transition-all",
                        "bg-gradient-to-r from-muted/30 to-transparent",
                        "border border-border/50 hover:border-primary/30",
                        isMe && "ring-1 ring-primary/40 bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        badge.bgClass,
                        badge.textClass,
                        badge.glowClass
                      )}>
                        <BadgeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium truncate",
                          isMe ? "text-primary" : "text-foreground"
                        )}>
                          {isMe ? `${entry.displayName} (You)` : entry.displayName}
                        </p>
                        {entry.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.email}
                          </p>
                        )}
                      </div>
                      <CircularProgress percentage={entry.overallProgress} size={48} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All Users List */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">
                All Students ({mergedProgress.length})
              </h3>
              
              {mergedProgress.map((u, idx) => {
                const isExpanded = expandedUsers.has(u.profileId);
                const isMe = !!user && u.profileId === user.id;
                const rank = idx + 1;
                const badge = getRankBadge(rank);

                return (
                  <Collapsible key={u.profileId}>
                    <div className={cn(
                      "glass-card overflow-hidden transition-all",
                      isMe && "neon-border",
                      isExpanded && "ring-1 ring-primary/30"
                    )}>
                      <CollapsibleTrigger
                        onClick={() => toggleUser(u.profileId)}
                        className={cn(
                          "w-full p-4 flex items-center gap-3 transition-colors",
                          isMe ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"
                        )}
                      >
                        {/* Rank Badge */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                          rank <= 3 ? badge.bgClass : "bg-muted",
                          rank <= 3 ? badge.textClass : "text-muted-foreground"
                        )}>
                          {rank <= 3 ? rank : `#${rank}`}
                        </div>
                        
                        {/* Chevron */}
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        
                        {/* Name & Email */}
                        <div className="flex-1 min-w-0 text-left">
                          <p className={cn(
                            "font-medium truncate",
                            isMe ? "text-primary" : "text-foreground"
                          )}>
                            {isMe ? `${u.displayName} (You)` : u.displayName}
                          </p>
                          {u.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {u.email}
                            </p>
                          )}
                        </div>
                        
                        {/* Progress */}
                        <CircularProgress percentage={u.overallProgress} size={44} />
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-2 border-t border-border/30">
                          {/* Overall Progress Display */}
                          <div className="flex flex-col items-center gap-4 mb-6 py-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl" />
                              <div className="relative bg-card/50 rounded-2xl p-4 border border-border/50">
                                <CircularProgress percentage={u.overallProgress} size={100} />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">Overall Progress</p>
                          </div>

                          {/* Subject Grid */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Star className="h-4 w-4 text-accent" />
                              Subject Progress
                            </h4>
                            <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth-touch pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible">
                              <TooltipProvider>
                                {ALL_SUBJECTS.map(({ displayName, data, color }) => {
                                  const id = data.id;
                                  const progress = u.subjects[id] ?? 0;
                                  return (
                                    <Tooltip key={id}>
                                      <TooltipTrigger asChild>
                                        <div className="flex-shrink-0 w-[90px] md:w-auto glass-card p-3 flex flex-col items-center gap-2 hover:border-primary/30 transition-all">
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
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
