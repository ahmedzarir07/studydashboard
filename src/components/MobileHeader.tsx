import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, LogOut, Menu, Users, Settings, Info, HelpCircle, ShieldCheck, Mail, MessageCircleQuestion, X } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-border/30 shadow-lg shadow-background/50">
      {/* Glass header background */}
      <div className="absolute inset-0 bg-card/60 backdrop-blur-2xl" />
      
      <div className="relative flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-bold text-foreground truncate gradient-text">
          {title}
        </h1>

        <div className="flex items-center gap-1 md:hidden">
          <NotificationBell />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 border-b border-border/30 shadow-2xl shadow-background/50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="absolute inset-0 bg-card/90 backdrop-blur-2xl" />
          <div className="relative px-4 py-4 space-y-2">
            {!loading && user && (
              <Link to="/settings" className="block pb-3 mb-2 border-b border-border/20 hover:opacity-80 transition-opacity" onClick={() => setMenuOpen(false)}>
                <UserProfileDisplay size="md" showName={true} showEmail={true} />
              </Link>
            )}
            <Link to="/community" className="block" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start min-h-[44px] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl">
                <Users className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
            </Link>
            <Link to="/doubts" className="block" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start min-h-[44px] hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl">
                <MessageCircleQuestion className="h-4 w-4 mr-2" />
                Community Doubts
              </Button>
            </Link>
            <div className="border-t border-border/20 pt-3 mt-1">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-semibold px-3 mb-2">Information</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { to: "/about", icon: Info, label: "About", color: "text-blue-400" },
                  { to: "/how-to-use", icon: HelpCircle, label: "How to Use", color: "text-emerald-400" },
                  { to: "/privacy", icon: ShieldCheck, label: "Privacy", color: "text-amber-400" },
                  { to: "/terms", icon: ShieldCheck, label: "Terms", color: "text-violet-400" },
                  { to: "/contact", icon: Mail, label: "Contact", color: "text-pink-400" },
                ].map((item) => (
                  <Link key={item.to} to={item.to} className="block" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/20 hover:bg-primary/10 transition-all duration-200 group border border-transparent hover:border-primary/20">
                      <div className={cn("p-1.5 rounded-lg bg-background/40", item.color)}>
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
                  className="w-full justify-start min-h-[44px] border-border/30 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 rounded-xl mt-2" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth" className="block mt-2" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full justify-start min-h-[44px] bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300 rounded-xl">
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
