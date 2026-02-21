import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserProfileDisplay } from "@/components/UserProfileDisplay";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  BookOpen,
  BarChart3,
  Users,
  CalendarDays,
  Download,
  Info,
  Settings,
  Shield,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MessageCircleQuestion,
} from "lucide-react";

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  section?: string;
}

const mainNavItems: NavItem[] = [
  { path: "/", icon: Home, label: "Home", section: "Main" },
  { path: "/tracker", icon: BookOpen, label: "Tracker", section: "Main" },
  { path: "/overview", icon: BarChart3, label: "Overview", section: "Main" },
  
  { path: "/community", icon: Users, label: "Leaderboard", section: "Main" },
  { path: "/doubts", icon: MessageCircleQuestion, label: "Doubts", section: "Main" },
  { path: "/planning", icon: CalendarDays, label: "Planning", section: "Main" },
  { path: "/downloads", icon: Download, label: "Downloads", section: "Main" },
  { path: "/about", icon: Info, label: "About", section: "Main" },
];

const accountNavItems: NavItem[] = [
  { path: "/settings", icon: Settings, label: "Settings", section: "Account" },
];

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsAdmin(data?.role === "admin");
    };

    checkAdmin();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.path}
      to={item.path}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
        isActive(item.path)
          ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.15)]"
          : "text-muted-foreground hover:bg-primary/10 hover:text-foreground border border-transparent"
      )}
    >
      <item.icon className={cn(
        "h-5 w-5 flex-shrink-0 transition-all duration-300",
        isActive(item.path) ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]" : "text-muted-foreground group-hover:text-primary"
      )} />
      {!collapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
    </Link>
  );

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen border-r border-border/50 transition-all duration-300 sticky top-0",
        "bg-card/40 backdrop-blur-xl",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header / User Profile */}
      <div className="p-4 border-b border-border/30">
        {user && !loading ? (
          <Link to="/settings" className="block hover:opacity-90 transition-opacity">
            <div className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}>
              <UserProfileDisplay 
                size="sm" 
                showName={!collapsed} 
                showEmail={!collapsed} 
              />
            </div>
          </Link>
        ) : (
          <div className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
              <LogIn className="h-4 w-4 text-muted-foreground" />
            </div>
            {!collapsed && (
              <span className="text-sm text-muted-foreground">Not signed in</span>
            )}
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-50 p-1 rounded-full bg-card border border-border/50 shadow-md hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Navigation */}
      <ScrollArea className="flex-1 scrollbar-thin">
        <nav className="p-3 space-y-6">
          {/* Main Section */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
                Main
              </p>
            )}
            {mainNavItems.map(renderNavItem)}
          </div>

          {/* Account Section */}
          {user && (
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
                  Account
                </p>
              )}
              {accountNavItems.map(renderNavItem)}
              {isAdmin && renderNavItem({ path: "/admin", icon: Shield, label: "Admin", section: "Account" })}
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border/30 space-y-1">
        <Link
          to="/about"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-muted-foreground hover:bg-primary/10 hover:text-foreground",
            collapsed && "justify-center"
          )}
        >
          <HelpCircle className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Help & Support</span>}
        </Link>

        {!loading && (
          user ? (
            <button
              onClick={handleSignOut}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
            </button>
          ) : (
            <Link
              to="/auth"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 bg-primary/10 text-primary hover:bg-primary/20",
                collapsed && "justify-center"
              )}
            >
              <LogIn className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Sign In</span>}
            </Link>
          )
        )}
      </div>
    </aside>
  );
}
