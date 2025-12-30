import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
        
        {/* Desktop navigation */}
        <div className="hidden md:flex gap-2 items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Home</Button>
          </Link>
          <Link to="/tracker">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Tracker</Button>
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

        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-10 w-10"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
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
                <Link to="/auth" className="block">
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
