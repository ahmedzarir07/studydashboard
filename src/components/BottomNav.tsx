import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Download, Info, Shield, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/tracker", icon: BookOpen, label: "Study" },
  { path: "/planning", icon: CalendarDays, label: "Plan" },
  { path: "/downloads", icon: Download, label: "Files" },
];

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

  const allNavItems = isAdmin 
    ? [...navItems, { path: "/admin", icon: Shield, label: "Admin" }]
    : navItems;

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
