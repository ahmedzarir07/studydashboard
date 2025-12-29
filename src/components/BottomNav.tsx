import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Download, Info } from "lucide-react";
import { cn } from "@/lib/utils";


const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/tracker", icon: BookOpen, label: "Study" },
  { path: "/downloads", icon: Download, label: "Downloads" },
  { path: "/about", icon: Info, label: "About" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-stretch">
        {navItems.map((item) => {
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
