import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Users, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Shield,
  Clock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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
};

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { loading, isAdmin, usersProgress, totalUsers } = useAdminData();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
        <MobileHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="p-8 text-center max-w-md">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have admin privileges to view this page.
            </p>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  const toggleUser = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const toggleSubject = (key: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubjects(newExpanded);
  };

  const getOverallProgress = (subjects: Record<string, { completedActivities: number; totalActivities: number }>) => {
    let total = 0;
    let completed = 0;
    Object.values(subjects).forEach((s) => {
      total += s.totalActivities;
      completed += s.completedActivities;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <MobileHeader />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">{totalUsers} registered users</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-primary">
              {usersProgress.filter((u) => u.isAdmin).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Active Today</p>
            <p className="text-2xl font-bold text-green-500">
              {usersProgress.filter((u) => {
                if (!u.lastActiveAt) return false;
                const lastActive = new Date(u.lastActiveAt);
                const today = new Date();
                return lastActive.toDateString() === today.toDateString();
              }).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Avg Progress</p>
            <p className="text-2xl font-bold text-yellow-500">
              {usersProgress.length > 0
                ? Math.round(
                    usersProgress.reduce(
                      (acc, u) => acc + getOverallProgress(u.subjects),
                      0
                    ) / usersProgress.length
                  )
                : 0}%
            </p>
          </Card>
        </div>

        {/* Users List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="hidden md:table-cell">Last Active</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersProgress.map((userProgress) => {
                  const isExpanded = expandedUsers.has(userProgress.userId);
                  const overallProgress = getOverallProgress(userProgress.subjects);
                  const subjectKeys = Object.keys(userProgress.subjects);

                  return (
                    <Collapsible key={userProgress.userId} asChild>
                      <>
                        <CollapsibleTrigger asChild>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleUser(userProgress.userId)}
                          >
                            <TableCell>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground truncate max-w-[200px]">
                                  {userProgress.email}
                                </p>
                                <p className="text-xs text-muted-foreground md:hidden">
                                  {userProgress.lastActiveAt
                                    ? formatDistanceToNow(new Date(userProgress.lastActiveAt), { addSuffix: true })
                                    : "Never"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                              {format(new Date(userProgress.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {userProgress.lastActiveAt
                                  ? formatDistanceToNow(new Date(userProgress.lastActiveAt), { addSuffix: true })
                                  : "Never"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={overallProgress} 
                                  className="w-20 h-2"
                                />
                                <span className={cn(
                                  "text-sm font-medium",
                                  overallProgress >= 70 ? "text-green-500" :
                                  overallProgress >= 40 ? "text-yellow-500" :
                                  "text-red-500"
                                )}>
                                  {overallProgress}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {userProgress.isAdmin ? (
                                <Badge variant="default" className="bg-primary">Admin</Badge>
                              ) : (
                                <Badge variant="secondary">User</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <TableRow className={cn(!isExpanded && "hidden")}>
                            <TableCell colSpan={6} className="p-0">
                              <div className="bg-muted/30 p-4 space-y-3">
                                {subjectKeys.length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-4">
                                    No study records yet
                                  </p>
                                ) : (
                                  subjectKeys.map((subjectId) => {
                                    const subject = userProgress.subjects[subjectId];
                                    const subjectKey = `${userProgress.userId}-${subjectId}`;
                                    const isSubjectExpanded = expandedSubjects.has(subjectKey);
                                    const subjectProgress = subject.totalActivities > 0
                                      ? Math.round((subject.completedActivities / subject.totalActivities) * 100)
                                      : 0;
                                    const chapterKeys = Object.keys(subject.chapters);

                                    return (
                                      <div key={subjectId} className="bg-card rounded-lg p-3">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSubject(subjectKey);
                                          }}
                                          className="w-full flex items-center justify-between"
                                        >
                                          <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-primary" />
                                            <span className="font-medium text-foreground">
                                              {subjectLabels[subjectId] || subjectId}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                              <Progress 
                                                value={subjectProgress} 
                                                className="w-16 h-2"
                                              />
                                              <span className="text-sm text-muted-foreground">
                                                {subjectProgress}%
                                              </span>
                                            </div>
                                            {isSubjectExpanded ? (
                                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                          </div>
                                        </button>

                                        {isSubjectExpanded && (
                                          <div className="mt-3 pl-6 space-y-2">
                                            {chapterKeys.map((chapterName) => {
                                              const chapter = subject.chapters[chapterName];
                                              const chapterProgress = chapter.totalActivities > 0
                                                ? Math.round((chapter.completedActivities / chapter.totalActivities) * 100)
                                                : 0;

                                              return (
                                                <div 
                                                  key={chapterName}
                                                  className="flex items-center justify-between py-1"
                                                >
                                                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                    {chapterName}
                                                  </span>
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                      {chapter.completedActivities}/{chapter.totalActivities}
                                                    </span>
                                                    <div className={cn(
                                                      "w-2 h-2 rounded-full",
                                                      chapterProgress >= 100 ? "bg-emerald-500" :
                                                      chapterProgress >= 70 ? "bg-green-500" :
                                                      chapterProgress >= 40 ? "bg-yellow-500" :
                                                      chapterProgress > 0 ? "bg-red-500" :
                                                      "bg-muted"
                                                    )} />
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  );
                })}

                {usersProgress.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
