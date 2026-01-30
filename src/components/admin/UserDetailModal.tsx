import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  BookOpen,
  GraduationCap,
  MapPin,
  Activity,
  Target,
  MessageSquare,
  CheckCircle,
  CalendarDays,
  Folder,
  TrendingUp,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface UserProgress {
  userId: string;
  email: string;
  displayName: string | null;
  fullName: string | null;
  phone: string | null;
  batch: string | null;
  groupName: string | null;
  boardName: string | null;
  studyType: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  isAdmin: boolean;
  subjects: {
    [subjectId: string]: {
      totalActivities: number;
      completedActivities: number;
      inProgressActivities: number;
      chapters: {
        [chapterName: string]: {
          totalActivities: number;
          completedActivities: number;
          inProgressActivities: number;
        };
      };
    };
  };
  completedChapters: number;
  totalPlans: number;
  totalResources: number;
  totalChatMessages: number;
  hasCoachSettings: boolean;
}

interface UserDetailModalProps {
  user: UserProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailModal({ user, open, onOpenChange }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) return null;

  const getOverallProgress = () => {
    let total = 0;
    let completed = 0;
    Object.values(user.subjects).forEach((s) => {
      total += s.totalActivities;
      completed += s.completedActivities;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getTotalActivities = () => {
    return Object.values(user.subjects).reduce((sum, s) => sum + s.totalActivities, 0);
  };

  const getInProgressActivities = () => {
    return Object.values(user.subjects).reduce((sum, s) => sum + s.inProgressActivities, 0);
  };

  const getCompletedActivities = () => {
    return Object.values(user.subjects).reduce((sum, s) => sum + s.completedActivities, 0);
  };

  const isActiveRecently = () => {
    if (!user.lastActiveAt) return false;
    const lastActive = new Date(user.lastActiveAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastActive >= weekAgo;
  };

  const progress = getOverallProgress();

  const getProgressColor = (p: number) => {
    if (p <= 20) return "text-red-500";
    if (p <= 60) return "text-yellow-500";
    return "text-emerald-500";
  };

  const getProgressBg = (p: number) => {
    if (p <= 20) return "bg-red-500";
    if (p <= 60) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const subjectEntries = Object.entries(user.subjects).sort((a, b) => {
    const aProgress = a[1].totalActivities > 0 ? (a[1].completedActivities / a[1].totalActivities) * 100 : 0;
    const bProgress = b[1].totalActivities > 0 ? (b[1].completedActivities / b[1].totalActivities) * 100 : 0;
    return bProgress - aProgress;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-card border-border/50">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                {(user.displayName || user.fullName || user.email)[0].toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  {user.displayName || user.fullName || "Unknown User"}
                  {user.isAdmin && (
                    <Badge className="bg-primary/20 text-primary border border-primary/30">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => copyToClipboard(user.email, "Email")}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="h-3 w-3" />
                    {user.email}
                    <Copy className="h-3 w-3 opacity-50" />
                  </button>
                </div>
                {user.phone && (
                  <button
                    onClick={() => copyToClipboard(user.phone!, "Phone")}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                  >
                    <Phone className="h-3 w-3" />
                    {user.phone}
                    <Copy className="h-3 w-3 opacity-50" />
                  </button>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isActiveRecently()
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                  : "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {isActiveRecently() ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent px-6 h-auto py-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Study Progress
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Activity Data
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(90vh-220px)]">
            <div className="p-6">
              <TabsContent value="overview" className="m-0 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className={cn("text-2xl font-bold", getProgressColor(progress))}>
                          {progress}%
                        </p>
                        <p className="text-xs text-muted-foreground">Overall Progress</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-500">{getCompletedActivities()}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/20">
                        <Activity className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-500">{getInProgressActivities()}</p>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <BookOpen className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-500">{Object.keys(user.subjects).length}</p>
                        <p className="text-xs text-muted-foreground">Subjects</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Profile Information */}
                <Card className="p-5 border-border/50">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Profile Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium text-foreground">{user.email}</p>
                        </div>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-medium text-foreground">{user.phone}</p>
                          </div>
                        </div>
                      )}
                      {user.fullName && (
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Full Name</p>
                            <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                          </div>
                        </div>
                      )}
                      {user.displayName && (
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Display Name</p>
                            <p className="text-sm font-medium text-foreground">{user.displayName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {user.batch && (
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Batch</p>
                            <p className="text-sm font-medium text-foreground">{user.batch}</p>
                          </div>
                        </div>
                      )}
                      {user.groupName && (
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Group</p>
                            <p className="text-sm font-medium text-foreground capitalize">{user.groupName}</p>
                          </div>
                        </div>
                      )}
                      {user.boardName && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Board</p>
                            <p className="text-sm font-medium text-foreground">{user.boardName}</p>
                          </div>
                        </div>
                      )}
                      {user.studyType && (
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Study Type</p>
                            <p className="text-sm font-medium text-foreground uppercase">{user.studyType}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Timeline */}
                <Card className="p-5 border-border/50">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Joined</p>
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(user.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Last Active</p>
                        <p className="text-sm font-medium text-foreground">
                          {user.lastActiveAt
                            ? `${format(new Date(user.lastActiveAt), "MMMM d, yyyy 'at' h:mm a")} (${formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true })})`
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* User ID */}
                <Card className="p-4 border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <p className="text-sm font-mono text-foreground">{user.userId}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(user.userId, "User ID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="m-0 space-y-4">
                {subjectEntries.length === 0 ? (
                  <Card className="p-8 text-center border-border/50">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No study progress recorded yet</p>
                  </Card>
                ) : (
                  subjectEntries.map(([subjectId, data]) => {
                    const subjectProgress = data.totalActivities > 0
                      ? Math.round((data.completedActivities / data.totalActivities) * 100)
                      : 0;
                    const chapterEntries = Object.entries(data.chapters);

                    return (
                      <Card key={subjectId} className="p-4 border-border/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground capitalize">
                                {subjectId.replace(/-/g, " ")}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {data.completedActivities}/{data.totalActivities} activities completed
                              </p>
                            </div>
                          </div>
                          <span className={cn("text-lg font-bold", getProgressColor(subjectProgress))}>
                            {subjectProgress}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                          <div
                            className={cn("h-full transition-all", getProgressBg(subjectProgress))}
                            style={{ width: `${subjectProgress}%` }}
                          />
                        </div>
                        {chapterEntries.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-border/30">
                            <p className="text-xs text-muted-foreground font-medium">Chapters:</p>
                            <div className="grid gap-2 max-h-40 overflow-y-auto">
                              {chapterEntries.map(([chapter, chapterData]) => {
                                const chapterProgress = chapterData.totalActivities > 0
                                  ? Math.round((chapterData.completedActivities / chapterData.totalActivities) * 100)
                                  : 0;
                                return (
                                  <div
                                    key={chapter}
                                    className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded-lg"
                                  >
                                    <span className="text-foreground truncate max-w-[70%]">{chapter}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className={cn("h-full", getProgressBg(chapterProgress))}
                                          style={{ width: `${chapterProgress}%` }}
                                        />
                                      </div>
                                      <span className={cn("text-xs font-medium w-8 text-right", getProgressColor(chapterProgress))}>
                                        {chapterProgress}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="activity" className="m-0 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="p-4 border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{user.completedChapters}</p>
                        <p className="text-xs text-muted-foreground">Completed Chapters</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <CalendarDays className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{user.totalPlans}</p>
                        <p className="text-xs text-muted-foreground">Monthly Plans</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10">
                        <MessageSquare className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{user.totalChatMessages}</p>
                        <p className="text-xs text-muted-foreground">AI Chat Messages</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Folder className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{user.totalResources}</p>
                        <p className="text-xs text-muted-foreground">Resources Saved</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-5 border-border/50">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Engagement Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Activities Tracked</span>
                      <span className="font-semibold text-foreground">{getTotalActivities()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Activities Completed</span>
                      <span className="font-semibold text-emerald-500">{getCompletedActivities()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Activities In Progress</span>
                      <span className="font-semibold text-yellow-500">{getInProgressActivities()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Study Coach Setup</span>
                      <Badge variant={user.hasCoachSettings ? "default" : "secondary"}>
                        {user.hasCoachSettings ? "Configured" : "Not Set"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
