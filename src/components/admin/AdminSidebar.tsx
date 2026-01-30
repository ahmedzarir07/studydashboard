import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  CreditCard,
  Activity,
  BarChart3,
  Download,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/progress", icon: TrendingUp, label: "Progress Tracker" },
  { path: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { path: "/admin/activity", icon: Activity, label: "Activity Logs" },
  { path: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/admin/downloads", icon: Download, label: "Downloads" },
];

const bottomNavItems: NavItem[] = [
  { path: "/admin/settings", icon: Settings, label: "Settings" },
  { path: "/admin/support", icon: HelpCircle, label: "Admin Support" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function AdminSidebar({ collapsed, onCollapsedChange }: AdminSidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.path}
      to={item.path}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
        isActive(item.path)
          ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-lg shadow-primary/10"
          : "text-muted-foreground hover:bg-primary/10 hover:text-foreground border border-transparent"
      )}
    >
      <item.icon className={cn(
        "h-5 w-5 flex-shrink-0 transition-all duration-200",
        isActive(item.path) ? "text-primary" : "text-muted-foreground group-hover:text-primary"
      )} />
      {!collapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
      {isActive(item.path) && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      )}
    </Link>
  );

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen bg-card/80 backdrop-blur-xl border-r border-primary/10 transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-primary/10">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-foreground">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">HSC Science Tracker</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        className="absolute -right-3 top-20 z-50 p-1.5 rounded-full bg-card border border-primary/20 shadow-lg hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
            Main Menu
          </p>
        )}
        {navItems.map(renderNavItem)}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-primary/10 space-y-1">
        {bottomNavItems.map(renderNavItem)}
      </div>
    </aside>
  );
}
