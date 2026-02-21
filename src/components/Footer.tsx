import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="hidden md:block w-full border-t border-border/50 bg-card/80 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>© 2026 HSC Progress Tracker. All rights reserved.</span>
        <nav className="flex items-center gap-6">
          <Link to="/about" className="hover:text-foreground transition-colors underline">About</Link>
          <Link to="/how-to-use" className="hover:text-foreground transition-colors underline">How to Use</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors underline">Terms of Service</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors underline">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
