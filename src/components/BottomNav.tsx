import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Download, Shield, CalendarDays, BarChart3, UserCircle, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/tracker", icon: BookOpen, label: "Study" },
  { path: "/overview", icon: BarChart3, label: "Stats" },
  { path: "/community", icon: Users, label: "Community" },
  { path: "/planning", icon: CalendarDays, label: "Plan" },
  { path: "/downloads", icon: Download, label: "Files" },
];

const authItem = { path: "/auth", icon: UserCircle, label: "Sign Up" };
const settingsItem = { path: "/settings", icon: Settings, label: "Settings" };

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

  // Build nav items: add auth if not logged in, add settings if logged in, add admin if admin
  const allNavItems = [
    ...navItems,
    ...(isAdmin ? [{ path: "/admin", icon: Shield, label: "Admin" }] : []),
    ...(user ? [settingsItem] : [authItem]),
  ];

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-stretch">
        {allNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "bottom-nav-item",
                isActive && "active"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
