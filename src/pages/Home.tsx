import { Link } from "react-router-dom";
import { CircularProgress } from "@/components/CircularProgress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { MonthlySummary } from "@/components/MonthlySummary";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Sparkles, BookOpen, TrendingUp, Zap } from "lucide-react";
import { generateOverallProgressPDF, generateDetailedProgressPDF } from "@/lib/pdfGenerator";
import { useProgressSnapshot, ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";
import { useProgressCelebration } from "@/hooks/useProgressCelebration";
import { ProgressCelebration } from "@/components/ProgressCelebration";

export default function Home() {
  const { user } = useAuth();
  const { overallProgress, subjects, recordMap, loading, refetch } = useProgressSnapshot();
  const { celebration, dismissCelebration } = useProgressCelebration(overallProgress, loading);

  const handleDownloadOverallPDF = async () => {
    if (!user?.email) return;
    await generateOverallProgressPDF(user.email, overallProgress, subjects);
  };

  const handleDownloadDetailedPDF = async () => {
    if (!user?.email) return;
    const subjectDetails = ALL_SUBJECTS.map(({ data, displayName }) => ({
      id: data.id,
      name: data.name,
      displayName,
      chapters: data.chapters.map(ch => ({
        name: ch.name,
        activities: ch.activities,
      })),
    }));
    await generateDetailedProgressPDF(user.email, overallProgress, subjects, subjectDetails, recordMap);
  };

  return (
    <AppLayout title="Study Progress">
      <div className="relative overflow-hidden">
        {celebration?.shouldCelebrate && (
          <ProgressCelebration
            previousProgress={celebration.previousProgress}
            currentProgress={celebration.currentProgress}
            onClose={dismissCelebration}
          />
        )}

        {/* Animated Glow Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="glow-orb w-[200px] h-[200px] md:w-[500px] md:h-[500px] top-[-80px] right-[-80px] md:top-[-150px] md:right-[-150px]" 
               style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)' }} />
          <div className="glow-orb w-[180px] h-[180px] md:w-[400px] md:h-[400px] bottom-[15%] left-[-60px] md:left-[-120px]" 
               style={{ background: 'radial-gradient(circle, hsl(var(--secondary) / 0.1) 0%, transparent 70%)', animationDelay: '2s' }} />
          <div className="glow-orb w-[100px] h-[100px] md:w-[250px] md:h-[250px] top-[40%] right-[-30px] md:right-[-80px]" 
               style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.08) 0%, transparent 70%)', animationDelay: '4s' }} />
        </div>

        <main className="px-4 py-6 max-w-4xl mx-auto relative z-10">
          {/* Welcome Banner */}
          {!user && (
            <div className="glass-card neon-border p-6 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-2xl" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 pulse-glow">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold gradient-text">Welcome to HSC Tracker</h2>
                  <p className="text-sm text-muted-foreground mt-1">Sign in to track your HSC study progress</p>
                </div>
                <Link to="/auth">
                  <Button className="rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Desktop Download Buttons */}
          {user && (
            <div className="hidden md:flex justify-end gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={handleDownloadOverallPDF} className="gap-2 rounded-xl border-border/50 hover:border-primary/30 hover:bg-primary/5">
                <Download className="h-4 w-4" />
                Overall Progress
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadDetailedPDF} className="gap-2 rounded-xl border-border/50 hover:border-primary/30 hover:bg-primary/5">
                <Download className="h-4 w-4" />
                Detailed Report
              </Button>
            </div>
          )}

          {/* Overall Progress */}
          <div className="relative z-10 flex flex-col items-center gap-4 mb-6">
            <div className="glass-card neon-border p-6 md:p-8 w-fit relative">
              <CircularProgress percentage={overallProgress} size={120} />
              <Button
                variant="ghost"
                size="icon"
                onClick={refetch}
                disabled={loading}
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-card border border-border/50 shadow-md hover:bg-primary/10 hover:border-primary/30 transition-all"
                title="Refresh progress"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Subject Grid */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Subject Progress</h2>
            </div>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide scroll-smooth-touch touch-pan-x overscroll-x-contain pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-3 md:overflow-visible">
              <TooltipProvider>
                {subjects.map((subject, index) => {
                  const getBorderColor = (color: string) => {
                    if (color.includes('3b82f6') || color.includes('blue')) return 'border-blue-500/30 hover:border-blue-500/60';
                    if (color.includes('22c55e') || color.includes('green')) return 'border-green-500/30 hover:border-green-500/60';
                    if (color.includes('ec4899') || color.includes('pink')) return 'border-pink-500/30 hover:border-pink-500/60';
                    if (color.includes('a855f7') || color.includes('purple')) return 'border-purple-500/30 hover:border-purple-500/60';
                    if (color.includes('06b6d4') || color.includes('cyan')) return 'border-cyan-500/30 hover:border-cyan-500/60';
                    if (color.includes('f59e0b') || color.includes('amber')) return 'border-amber-500/30 hover:border-amber-500/60';
                    if (color.includes('f97316') || color.includes('orange')) return 'border-orange-500/30 hover:border-orange-500/60';
                    return 'border-primary/30 hover:border-primary/60';
                  };
                  
                  return (
                    <Tooltip key={subject.name}>
                      <TooltipTrigger asChild>
                        <Link 
                          to={`/tracker?tab=${index}`}
                          className={`flex-shrink-0 w-[100px] md:w-auto rounded-xl p-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-all duration-300 border ${getBorderColor(subject.color)} bg-card/40 backdrop-blur-sm hover:shadow-md hover:bg-card/60`}
                        >
                          <div className="relative w-12 h-12 md:w-14 md:h-14">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted/20" strokeWidth="2.5" />
                              <circle cx="18" cy="18" r="15.5" fill="none" stroke={subject.color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${subject.progress * 0.975} 100`} />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                              {subject.progress}%
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-1">
                            {subject.name}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent><p>{subject.fullName}</p></TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <Link 
              to="/tracker" 
              className="touch-button w-full rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_4px_30px_hsl(var(--primary)/0.5)] hover:scale-[1.01]"
            >
              <Zap className="h-5 w-5" />
              Start Studying
            </Link>
          </div>

          {/* Monthly Summary */}
          {user && (
            <div className="mb-4">
              <MonthlySummary />
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
