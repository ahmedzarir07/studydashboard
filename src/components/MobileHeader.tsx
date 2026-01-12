import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, LogOut, Menu, Users, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";
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
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-semibold text-foreground truncate">
          {title}
        </h1>

        {/* Notification Bell - Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <NotificationBell />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex gap-2 items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Home</Button>
          </Link>
          <Link to="/tracker">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Tracker</Button>
          </Link>
          <Link to="/overview">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Overview</Button>
          </Link>
          <Link to="/ai-analysis">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">AI</Button>
          </Link>
          <Link to="/community">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Community</Button>
          </Link>
          <Link to="/planning">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Planning</Button>
          </Link>
          <Link to="/downloads">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Downloads</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">About</Button>
          </Link>
          <NotificationBell />
          {!loading && (
            user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
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
        <div className="md:hidden absolute top-14 left-0 right-0 bg-card border-b border-border shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {!loading && user && (
              <div className="pb-2 mb-2 border-b border-border">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm text-foreground truncate">{user.email}</p>
              </div>
            )}
            <Link to="/community" className="block" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start min-h-[44px]">
                <Users className="h-4 w-4 mr-2" />
                Community
              </Button>
            </Link>
            {user && (
              <Link to="/settings" className="block" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start min-h-[44px]">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            )}
            {!loading && (
              user ? (
                <Button 
                  variant="outline" 
                  className="w-full justify-start min-h-[44px]" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth" className="block" onClick={() => setMenuOpen(false)}>
                  <Button variant="default" className="w-full justify-start min-h-[44px]">
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
