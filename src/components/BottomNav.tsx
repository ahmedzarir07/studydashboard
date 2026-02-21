import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Download, Shield, CalendarDays, BarChart3, UserCircle, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/tracker", icon: BookOpen, label: "Tracker" },
  { path: "/overview", icon: BarChart3, label: "Overview" },
  { path: "/ai-analysis", icon: Sparkles, label: "AI" },
  { path: "/downloads", icon: Download, label: "Downloads" },
  { path: "/about", icon: Info, label: "About" },
  { path: "/planning", icon: CalendarDays, label: "Planning" },
];

const authItem = { path: "/auth", icon: UserCircle, label: "Sign Up" };

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
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

  // Build nav items: add auth if not logged in, add admin if admin
  const allNavItems = [
    ...navItems,
    ...(isAdmin ? [{ path: "/admin", icon: Shield, label: "Admin" }] : []),
    ...(!user ? [authItem] : []),
  ];

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-stretch justify-evenly">
        {allNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-h-[52px] min-w-[44px] transition-all",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} />
              <span className={cn("text-[9px] font-medium leading-tight", isActive && "text-primary")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
