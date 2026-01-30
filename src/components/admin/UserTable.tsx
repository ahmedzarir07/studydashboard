import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface UserProgress {
  userId: string;
  email: string;
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
}

interface UserTableProps {
  users: UserProgress[];
  onViewUser?: (userId: string) => void;
  onResetProgress?: (userId: string) => void;
}

type SortField = "email" | "createdAt" | "lastActiveAt" | "progress";
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

  const isActiveToday = (lastActiveAt: string | null) => {
    if (!lastActiveAt) return false;
    const lastActive = new Date(lastActiveAt);
    const today = new Date();
    return lastActive.toDateString() === today.toDateString();
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

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((u) =>
        u.email.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((u) => isActiveRecently(u.lastActiveAt));
    } else if (statusFilter === "inactive") {
      result = result.filter((u) => !isActiveRecently(u.lastActiveAt));
    }

    // Progress filter
    if (progressFilter !== "all") {
      result = result.filter((u) => {
        const progress = getOverallProgress(u.subjects);
        if (progressFilter === "low") return progress <= 20;
        if (progressFilter === "medium") return progress > 20 && progress <= 60;
        if (progressFilter === "high") return progress > 60;
        return true;
      });
    }

    // Sorting
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
            placeholder="Search by email..."
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
      <div className="hidden md:block rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[250px]">
                <button
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  User Email
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </TableHead>
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
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => {
              const progress = getOverallProgress(user.subjects);
              const isActive = isActiveRecently(user.lastActiveAt);

              return (
                <TableRow
                  key={user.userId}
                  className="hover:bg-muted/30 border-border/30 transition-colors"
                >
                  <TableCell>
                    <p className="font-medium text-foreground truncate max-w-[220px]">
                      {user.email}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
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
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
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
                    <Badge
                      variant="outline"
                      className={cn(
                        "border",
                        isActive
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                          : "border-muted-foreground/30 bg-muted/30 text-muted-foreground"
                      )}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="bg-primary/20 text-primary border border-primary/30">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted/50">
                        User
                      </Badge>
                    )}
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
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No users found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginatedUsers.map((user) => {
          const progress = getOverallProgress(user.subjects);
          const isActive = isActiveRecently(user.lastActiveAt);

          return (
            <div
              key={user.userId}
              className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-foreground text-sm truncate max-w-[200px]">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
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
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {user.lastActiveAt
                  ? `Active ${formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true })}`
                  : "Never active"}
              </p>
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
