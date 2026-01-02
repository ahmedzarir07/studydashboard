import { usePublicProgress, AggregatedUserProgress } from "@/hooks/usePublicProgress";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Users, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Trophy,
  Sparkles,
  Mail,
  Clock,
  Shield,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const subjectLabels: Record<string, string> = {
  physics1: "Physics 1st",
  physics2: "Physics 2nd",
  chemistry1: "Chemistry 1st",
  chemistry2: "Chemistry 2nd",
  higherMath1: "Higher Math 1st",
  higherMath2: "Higher Math 2nd",
  biology1: "Biology 1st",
  biology2: "Biology 2nd",
  ict: "ICT",
  english1: "English 1st",
  english2: "English 2nd",
  bangla1: "Bangla 1st",
  bangla2: "Bangla 2nd",
};

type SortOption = "activities" | "lastActive" | "registered" | "progress";

export default function Community() {
  const { aggregatedProgress, isAdmin, loading, error } = usePublicProgress();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("activities");
  const [filterSubject, setFilterSubject] = useState<string>("all");

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

  const getOverallProgress = (subjects: Record<string, { completedActivities: number; totalActivities: number }>) => {
    let total = 0;
    let completed = 0;
    Object.values(subjects).forEach((s) => {
      total += s.totalActivities;
      completed += s.completedActivities;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Get all unique subjects across all users
  const allSubjects = Array.from(
    new Set(aggregatedProgress.flatMap((user) => Object.keys(user.subjects)))
  );

  // Filter and sort users
  const filteredAndSortedProgress = [...aggregatedProgress]
    .filter((user) => {
      if (filterSubject === "all") return true;
      return Object.keys(user.subjects).includes(filterSubject);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "lastActive":
          if (!a.lastActiveAt && !b.lastActiveAt) return 0;
          if (!a.lastActiveAt) return 1;
          if (!b.lastActiveAt) return -1;
          return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
        case "registered":
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "progress":
          return getOverallProgress(b.subjects) - getOverallProgress(a.subjects);
        case "activities":
        default:
          const aTotal = Object.values(a.subjects).reduce((sum, s) => sum + s.completedActivities, 0);
          const bTotal = Object.values(b.subjects).reduce((sum, s) => sum + s.completedActivities, 0);
          return bTotal - aTotal;
      }
    });

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <MobileHeader title="Community" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Community Progress</h1>
            <p className="text-sm text-muted-foreground">
              See how other students are progressing
            </p>
          </div>
          {isAdmin && (
            <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-500">
              <Shield className="h-3 w-3" />
              Admin View
            </Badge>
          )}
        </div>

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
            {/* Admin Filters */}
            {isAdmin && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground">Admin Filters</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Sort by</label>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                      <SelectTrigger className="w-full">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activities">Most Activities</SelectItem>
                        <SelectItem value="progress">Highest Progress %</SelectItem>
                        <SelectItem value="lastActive">Last Active</SelectItem>
                        <SelectItem value="registered">Recently Registered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Filter by Subject</label>
                    <Select value={filterSubject} onValueChange={setFilterSubject}>
                      <SelectTrigger className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {allSubjects.map((subjectId) => (
                          <SelectItem key={subjectId} value={subjectId}>
                            {subjectLabels[subjectId] || subjectId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Showing {filteredAndSortedProgress.length} of {aggregatedProgress.length} students
                </p>
              </Card>
            )}

            {/* Leaderboard */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h2 className="font-semibold text-foreground">Top Students</h2>
              </div>
              <div className="space-y-3">
                {aggregatedProgress.slice(0, 3).map((user, index) => {
                  const overallProgress = getOverallProgress(user.subjects);
                  const totalCompleted = Object.values(user.subjects).reduce(
                    (sum, s) => sum + s.completedActivities, 0
                  );

                  return (
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
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{totalCompleted} activities completed</span>
                          {isAdmin && user.email && (
                            <span className="flex items-center gap-1 text-primary">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">{overallProgress}%</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* All Users */}
            <div className="space-y-3">
              {filteredAndSortedProgress.map((user) => {
                const isExpanded = expandedUsers.has(user.profileId);
                const overallProgress = getOverallProgress(user.subjects);
                const subjectKeys = Object.keys(user.subjects);

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
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{subjectKeys.length} subjects</span>
                            {isAdmin && user.email && (
                              <span className="flex items-center gap-1 text-primary">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </span>
                            )}
                            {isAdmin && user.lastActiveAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last active: {format(new Date(user.lastActiveAt), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={overallProgress} 
                            className="w-20 h-2"
                          />
                          <span className={cn(
                            "text-sm font-medium min-w-[3ch]",
                            overallProgress >= 70 ? "text-green-500" :
                            overallProgress >= 40 ? "text-yellow-500" :
                            "text-muted-foreground"
                          )}>
                            {overallProgress}%
                          </span>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-0 space-y-2">
                          {subjectKeys.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No progress data yet
                            </p>
                          ) : (
                            subjectKeys.map((subjectId) => {
                              const subject = user.subjects[subjectId];
                              const subjectProgress = subject.totalActivities > 0
                                ? Math.round((subject.completedActivities / subject.totalActivities) * 100)
                                : 0;

                              return (
                                <div 
                                  key={subjectId}
                                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium text-foreground">
                                      {subjectLabels[subjectId] || subjectId}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {subject.completedActivities}/{subject.totalActivities}
                                    </span>
                                    <Progress 
                                      value={subjectProgress} 
                                      className="w-16 h-2"
                                    />
                                    <span className="text-xs text-muted-foreground min-w-[3ch]">
                                      {subjectProgress}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
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
