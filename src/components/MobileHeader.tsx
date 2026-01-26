import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, LogOut, Menu, Users, Settings } from "lucide-react";
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
        
        {/* Desktop navigation */}
        <div className="hidden md:flex gap-1 items-center">
          <Link to="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-glow-sm transition-all duration-300"
            >
              Home
            </Button>
          </Link>
          <Link to="/tracker">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-glow-sm transition-all duration-300"
            >
              Tracker
            </Button>
          </Link>
          <Link to="/overview">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-glow-sm transition-all duration-300"
            >
              Overview
            </Button>
          </Link>
          <Link to="/ai-analysis">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-secondary hover:bg-secondary/10 hover:shadow-glow-purple transition-all duration-300"
            >
              AI
            </Button>
          </Link>
          <Link to="/community">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-glow-sm transition-all duration-300"
            >
              Community
            </Button>
          </Link>
          <Link to="/planning">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-accent hover:bg-accent/10 hover:shadow-glow-cyan transition-all duration-300"
            >
              Planning
            </Button>
          </Link>
          <Link to="/downloads">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-glow-sm transition-all duration-300"
            >
              Downloads
            </Button>
          </Link>
          <Link to="/about">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-glow-sm transition-all duration-300"
            >
              About
            </Button>
          </Link>
          <NotificationBell />
          {!loading && (
            user ? (
              <div className="flex items-center gap-2">
                <Link to="/settings" className="cursor-pointer hover:opacity-80 transition-opacity" title="Settings">
                  <UserProfileDisplay size="sm" showName={false} />
                </Link>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={handleSignOut}
                  className="border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary hover:shadow-glow-sm transition-all duration-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-glow transition-all duration-300"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-primary/10 shadow-lg shadow-primary/10">
          <div className="px-4 py-3 space-y-2">
            {!loading && user && (
              <div className="pb-3 mb-2 border-b border-primary/10">
                <UserProfileDisplay size="md" showName={true} showEmail={true} />
              </div>
            )}
            <Link to="/community" className="block" onClick={() => setMenuOpen(false)}>
              <Button 
                variant="ghost" 
                className="w-full justify-start min-h-[44px] hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <Users className="h-4 w-4 mr-2" />
                Community
              </Button>
            </Link>
            {user && (
              <Link to="/settings" className="block" onClick={() => setMenuOpen(false)}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start min-h-[44px] hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            )}
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
