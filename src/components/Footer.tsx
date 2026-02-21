import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="hidden md:block w-full border-t border-border/20 mt-auto">
      <div className="absolute inset-0 bg-card/30 backdrop-blur-xl" />
      <div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-sm text-muted-foreground">
        <span className="text-xs">© 2026 HSC Progress Tracker. All rights reserved.</span>
        <nav className="flex items-center gap-6">
          {[
            { to: "/about", label: "About" },
            { to: "/how-to-use", label: "How to Use" },
            { to: "/privacy", label: "Privacy" },
            { to: "/terms", label: "Terms" },
            { to: "/contact", label: "Contact" },
          ].map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className="text-xs hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
