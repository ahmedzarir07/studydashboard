import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Tracker from "./pages/Tracker";
import Overview from "./pages/Overview";
import Downloads from "./pages/Downloads";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import HowToUse from "./pages/HowToUse";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import MonthlyPlanning from "./pages/MonthlyPlanning";
import Settings from "./pages/Settings";
import Community from "./pages/Community";
import AIAnalysis from "./pages/AIAnalysis";
import ResetPassword from "./pages/ResetPassword";
import Drive from "./pages/Drive";
import DriveCallback from "./pages/DriveCallback";
import Doubts from "./pages/Doubts";
import NotFound from "./pages/NotFound";
import { JoinChannelDialog } from "./components/JoinChannelDialog";

// Initialize React Query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <JoinChannelDialog />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/planning" element={<MonthlyPlanning />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/community" element={<Community />} />
            <Route path="/ai-analysis" element={<AIAnalysis />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/drive" element={<Drive />} />
            <Route path="/drive/callback" element={<DriveCallback />} />
            <Route path="/doubts" element={<Doubts />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
