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
