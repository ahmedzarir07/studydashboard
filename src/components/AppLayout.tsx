import { ReactNode } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { Footer } from "@/components/Footer";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showMobileHeader?: boolean;
}

export function AppLayout({ children, title = "Study Progress", showMobileHeader = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-[60px] md:pb-0 w-full max-w-full overflow-x-hidden">
        {/* Mobile Header - Only visible on mobile */}
        {showMobileHeader && (
          <div className="md:hidden">
            <MobileHeader title={title} />
          </div>
        )}

        {/* Desktop Top Bar */}
        <div className="hidden md:block sticky top-0 z-30">
          <div className="relative">
            <div className="absolute inset-0 bg-card/40 backdrop-blur-2xl border-b border-border/20" />
            <div className="relative flex items-center justify-between px-6 h-14 max-w-7xl mx-auto">
              <h1 className="text-lg font-bold gradient-text">{title}</h1>
              <div className="flex items-center gap-3">
                {/* Can add desktop notification bell or actions here */}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 w-full max-w-full">
          {children}
        </div>

        {/* Desktop Footer */}
        <Footer />

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
