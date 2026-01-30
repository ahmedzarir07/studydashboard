import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { DatabaseStatsCard } from "@/components/admin/DatabaseStatsCard";
import { UserTable } from "@/components/admin/UserTable";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Users, 
  Shield,
  UserCheck,
  TrendingUp,
  Activity,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { loading, isAdmin, usersProgress, totalUsers, databaseStats } = useAdminData();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md border-destructive/30 bg-destructive/5">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have admin privileges to view this page.
          </p>
        </Card>
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

  // Calculate metrics
  const activeToday = usersProgress.filter((u) => {
    if (!u.lastActiveAt) return false;
    const lastActive = new Date(u.lastActiveAt);
    const today = new Date();
    return lastActive.toDateString() === today.toDateString();
  }).length;

  const activeThisWeek = usersProgress.filter((u) => {
    if (!u.lastActiveAt) return false;
    const lastActive = new Date(u.lastActiveAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastActive >= weekAgo;
  }).length;

  const avgProgress = usersProgress.length > 0
    ? Math.round(
        usersProgress.reduce(
          (acc, u) => acc + getOverallProgress(u.subjects),
          0
        ) / usersProgress.length
      )
    : 0;

  const adminCount = usersProgress.filter((u) => u.isAdmin).length;
  const highPerformers = usersProgress.filter((u) => getOverallProgress(u.subjects) >= 60).length;
  const usersWithActivity = usersProgress.filter((u) => Object.keys(u.subjects).length > 0).length;

  // Note: View user is handled internally by UserTable with UserDetailModal

  const handleResetProgress = (userId: string) => {
    toast.info("Reset progress feature coming soon!");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onCollapsedChange={setSidebarCollapsed} 
      />

      {/* Mobile Navigation */}
      <AdminMobileNav />

      {/* Main Content */}
      <main className="flex-1 min-h-screen lg:pb-0 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Dashboard Overview
              </h1>
              <p className="text-muted-foreground">
                Real-time database stats and user management
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="hidden sm:flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <AdminMetricCard
              title="Total Users"
              value={totalUsers}
              icon={Users}
              variant="primary"
            />
            <AdminMetricCard
              title="Active Today"
              value={activeToday}
              icon={Activity}
              variant="success"
            />
            <AdminMetricCard
              title="Avg Progress"
              value={`${avgProgress}%`}
              icon={TrendingUp}
              variant="warning"
            />
            <AdminMetricCard
              title="Admins"
              value={adminCount}
              icon={Shield}
              variant="default"
            />
          </div>

          {/* Database Stats */}
          <div className="mb-6">
            <DatabaseStatsCard stats={databaseStats} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeThisWeek}</p>
                  <p className="text-sm text-muted-foreground">Active this week</p>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{highPerformers}</p>
                  <p className="text-sm text-muted-foreground">High performers (60%+)</p>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/10">
                  <Activity className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{usersWithActivity}</p>
                  <p className="text-sm text-muted-foreground">Users with activity</p>
                </div>
              </div>
            </Card>
          </div>

          {/* User Table Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">User Management</h2>
                <p className="text-sm text-muted-foreground">
                  Complete data from all {totalUsers} users
                </p>
              </div>
            </div>

            <UserTable
              users={usersProgress}
              onResetProgress={handleResetProgress}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
