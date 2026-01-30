import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreVertical,
  Eye,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCog,
  Clock,
  Shield,
  BookOpen,
  CalendarDays,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

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

interface UserTableProps {
  users: UserProgress[];
  onViewUser?: (userId: string) => void;
  onResetProgress?: (userId: string) => void;
}

type SortField = "email" | "createdAt" | "lastActiveAt" | "progress" | "activities";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | "active" | "inactive";
type ProgressFilter = "all" | "low" | "medium" | "high";

const ITEMS_PER_PAGE = 10;

export function UserTable({ users, onViewUser, onResetProgress }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const getOverallProgress = (subjects: UserProgress["subjects"]) => {
    let total = 0;
    let completed = 0;
    Object.values(subjects).forEach((s) => {
      total += s.totalActivities;
      completed += s.completedActivities;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getTotalActivities = (subjects: UserProgress["subjects"]) => {
    return Object.values(subjects).reduce((sum, s) => sum + s.totalActivities, 0);
  };

  const isActiveRecently = (lastActiveAt: string | null) => {
    if (!lastActiveAt) return false;
    const lastActive = new Date(lastActiveAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastActive >= weekAgo;
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((u) =>
        u.email.toLowerCase().includes(searchLower) ||
        u.displayName?.toLowerCase().includes(searchLower) ||
        u.fullName?.toLowerCase().includes(searchLower) ||
        u.phone?.includes(search)
      );
    }

    if (statusFilter === "active") {
      result = result.filter((u) => isActiveRecently(u.lastActiveAt));
    } else if (statusFilter === "inactive") {
      result = result.filter((u) => !isActiveRecently(u.lastActiveAt));
    }

    if (progressFilter !== "all") {
      result = result.filter((u) => {
        const progress = getOverallProgress(u.subjects);
        if (progressFilter === "low") return progress <= 20;
        if (progressFilter === "medium") return progress > 20 && progress <= 60;
        if (progressFilter === "high") return progress > 60;
        return true;
      });
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "lastActiveAt":
          const aTime = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
          const bTime = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
          comparison = aTime - bTime;
          break;
        case "progress":
          comparison = getOverallProgress(a.subjects) - getOverallProgress(b.subjects);
          break;
        case "activities":
          comparison = getTotalActivities(a.subjects) - getTotalActivities(b.subjects);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [users, search, statusFilter, progressFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 20) return "text-red-500";
    if (progress <= 60) return "text-yellow-500";
    return "text-emerald-500";
  };

  const getProgressBg = (progress: number) => {
    if (progress <= 20) return "bg-red-500";
    if (progress <= 60) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, name, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-card border-border/50"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value: StatusFilter) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px] bg-card border-border/50">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={progressFilter}
            onValueChange={(value: ProgressFilter) => {
              setProgressFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px] bg-card border-border/50">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Progress" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Progress</SelectItem>
              <SelectItem value="low">0-20%</SelectItem>
              <SelectItem value="medium">21-60%</SelectItem>
              <SelectItem value="high">61-100%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {paginatedUsers.length} of {filteredAndSortedUsers.length} users
      </p>

      {/* Desktop Table */}
      <div className="hidden lg:block rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[220px]">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    User
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Joined
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("lastActiveAt")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Last Active
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("progress")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Progress
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("activities")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Activities
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => {
                const progress = getOverallProgress(user.subjects);
                const totalActivities = getTotalActivities(user.subjects);
                const isActive = isActiveRecently(user.lastActiveAt);

                return (
                  <TableRow
                    key={user.userId}
                    className="hover:bg-muted/30 border-border/30 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground truncate max-w-[200px]">
                          {user.displayName || user.fullName || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-xs text-muted-foreground">{user.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.batch && (
                          <Badge variant="outline" className="text-xs">
                            {user.batch}
                          </Badge>
                        )}
                        {user.groupName && (
                          <p className="text-xs text-muted-foreground mt-1">{user.groupName}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">
                          {user.lastActiveAt
                            ? formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true })
                            : "Never"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full transition-all", getProgressBg(progress))}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className={cn("text-sm font-medium w-10", getProgressColor(progress))}>
                          {progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">
                        {totalActivities}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1" title="Completed Chapters">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs">{user.completedChapters}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Monthly Plans">
                          <CalendarDays className="h-3 w-3 text-purple-500" />
                          <span className="text-xs">{user.totalPlans}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Chat Messages">
                          <MessageSquare className="h-3 w-3 text-cyan-500" />
                          <span className="text-xs">{user.totalChatMessages}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {user.isAdmin ? (
                          <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted/50 text-xs">
                            User
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            isActive
                              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                              : "border-muted-foreground/30 text-muted-foreground"
                          )}
                        >
                          {isActive ? "Active" : "Idle"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onViewUser?.(user.userId)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onResetProgress?.(user.userId)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset Progress
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <UserCog className="h-4 w-4 mr-2" />
                            Manage User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-3">
        {paginatedUsers.map((user) => {
          const progress = getOverallProgress(user.subjects);
          const totalActivities = getTotalActivities(user.subjects);
          const isActive = isActiveRecently(user.lastActiveAt);

          return (
            <div
              key={user.userId}
              className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {user.displayName || user.fullName || user.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {user.isAdmin && (
                    <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs">
                      Admin
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewUser?.(user.userId)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onResetProgress?.(user.userId)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Progress
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Batch & Group */}
              {(user.batch || user.groupName) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {user.batch && (
                    <Badge variant="outline" className="text-xs">
                      {user.batch}
                    </Badge>
                  )}
                  {user.groupName && (
                    <Badge variant="secondary" className="text-xs bg-muted/50">
                      {user.groupName}
                    </Badge>
                  )}
                </div>
              )}

              {/* Progress */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full", getProgressBg(progress))}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={cn("text-sm font-medium", getProgressColor(progress))}>
                    {progress}%
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    isActive
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                      : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isActive ? "Active" : "Idle"}
                </Badge>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{totalActivities} activities</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span>{user.completedChapters} chapters</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-cyan-500" />
                  <span>{user.totalChatMessages}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Joined {format(new Date(user.createdAt), "MMM d, yyyy")}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {user.lastActiveAt
                    ? formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true })
                    : "Never active"}
                </div>
              </div>
            </div>
          );
        })}
        {paginatedUsers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No users found matching your criteria
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
