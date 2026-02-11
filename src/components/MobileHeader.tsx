import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, LogOut, Menu, Users, Settings, Info, HelpCircle, ShieldCheck, Mail, MessageCircleQuestion } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";
import { UserProfileDisplay } from "@/components/UserProfileDisplay";
interface MobileHeaderProps {
  title?: string;
}

export function MobileHeader({ title = "Study Progress" }: MobileHeaderProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-primary/10 shadow-lg shadow-primary/5">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-bold text-foreground truncate gradient-text">
          {title}
        </h1>

        {/* Notification Bell - Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <NotificationBell />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all duration-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-primary/10 shadow-lg shadow-primary/10 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="px-4 py-3 space-y-2">
            {!loading && user && (
              <Link to="/settings" className="block pb-3 mb-2 border-b border-primary/10 hover:opacity-80 transition-opacity" onClick={() => setMenuOpen(false)}>
                <UserProfileDisplay size="md" showName={true} showEmail={true} />
              </Link>
            )}
            <Link to="/community" className="block" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start min-h-[44px] hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <Users className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
            </Link>
            <Link to="/doubts" className="block" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start min-h-[44px] hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <MessageCircleQuestion className="h-4 w-4 mr-2" />
                Community Doubts
              </Button>
            </Link>
            <div className="border-t border-primary/10 pt-3 mt-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold px-3 mb-1">Information</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { to: "/about", icon: Info, label: "About", color: "text-blue-400" },
                  { to: "/how-to-use", icon: HelpCircle, label: "How to Use", color: "text-emerald-400" },
                  { to: "/privacy", icon: ShieldCheck, label: "Privacy", color: "text-amber-400" },
                  { to: "/terms", icon: ShieldCheck, label: "Terms", color: "text-violet-400" },
                  { to: "/contact", icon: Mail, label: "Contact", color: "text-pink-400" },
                ].map((item) => (
                  <Link key={item.to} to={item.to} className="block" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/30 hover:bg-primary/10 transition-all duration-200 group">
                      <div className={cn("p-1.5 rounded-lg bg-background/60", item.color)}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            {!loading && (
              user ? (
                <Button 
                  variant="outline" 
                  className="w-full justify-start min-h-[44px] border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-300" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth" className="block" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full justify-start min-h-[44px] bg-gradient-to-r from-primary to-secondary hover:shadow-glow transition-all duration-300">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
