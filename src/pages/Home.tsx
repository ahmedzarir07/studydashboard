import { Link } from "react-router-dom";
import { CircularProgress } from "@/components/CircularProgress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { MonthlySummary } from "@/components/MonthlySummary";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateOverallProgressPDF, generateDetailedProgressPDF } from "@/lib/pdfGenerator";
import { useProgressSnapshot, ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";
import { useProgressCelebration } from "@/hooks/useProgressCelebration";
import { ProgressCelebration } from "@/components/ProgressCelebration";

export default function Home() {
  const { user } = useAuth();
  const { overallProgress, subjects, recordMap, loading } = useProgressSnapshot();
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

    await generateDetailedProgressPDF(
      user.email,
      overallProgress,
      subjects,
      subjectDetails,
      recordMap
    );
  };

  return (
    <AppLayout title="Study Progress">
      <div className="relative overflow-hidden">
        {/* Progress Celebration Popup */}
        {celebration?.shouldCelebrate && (
          <ProgressCelebration
            previousProgress={celebration.previousProgress}
            currentProgress={celebration.currentProgress}
            onClose={dismissCelebration}
          />
        )}

        {/* Animated Glow Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Large primary orb - top right */}
          <div className="glow-orb w-[300px] h-[300px] md:w-[500px] md:h-[500px] top-[-100px] right-[-100px] md:top-[-150px] md:right-[-150px]" 
               style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)' }} />
          
          {/* Medium secondary orb - bottom left */}
          <div className="glow-orb w-[250px] h-[250px] md:w-[400px] md:h-[400px] bottom-[10%] left-[-80px] md:left-[-120px]" 
               style={{ background: 'radial-gradient(circle, hsl(var(--secondary) / 0.12) 0%, transparent 70%)', animationDelay: '2s' }} />
          
          {/* Small accent orb - center right */}
          <div className="glow-orb w-[150px] h-[150px] md:w-[250px] md:h-[250px] top-[40%] right-[-50px] md:right-[-80px]" 
               style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)', animationDelay: '4s' }} />
          
          {/* Tiny floating orb - mid left */}
          <div className="glow-orb w-[100px] h-[100px] md:w-[150px] md:h-[150px] top-[25%] left-[5%]" 
               style={{ background: 'radial-gradient(circle, hsl(var(--neon-purple) / 0.08) 0%, transparent 70%)', animationDelay: '1s' }} />
          
          {/* Extra small accent orb - bottom right */}
          <div className="glow-orb w-[80px] h-[80px] md:w-[120px] md:h-[120px] bottom-[25%] right-[10%]" 
               style={{ background: 'radial-gradient(circle, hsl(var(--neon-cyan) / 0.1) 0%, transparent 70%)', animationDelay: '3s' }} />
        </div>

        <main className="px-4 py-6 max-w-4xl mx-auto">
          {/* Desktop Download Buttons */}
          {user && (
            <div className="hidden md:flex justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadOverallPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Overall Progress (1 Page)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadDetailedPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Detailed Progress (Full Report)
              </Button>
            </div>
          )}

          {/* Overall Progress - Centered on mobile */}
          <div className="relative z-10 flex flex-col items-center gap-6 mb-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border-2 border-primary/30 shadow-lg shadow-primary/10">
              <CircularProgress percentage={overallProgress} size={140} />
            </div>
          </div>

          {/* Subject Grid - Horizontal scroll on mobile, grid on desktop */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-foreground mb-4 px-1">
              Subject Progress
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth-touch pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible">
              <TooltipProvider>
                {subjects.map((subject, index) => {
                  // Get border color class based on subject color
                  const getBorderColor = (color: string) => {
                    if (color.includes('3b82f6') || color.includes('blue')) return 'border-blue-500/50 hover:border-blue-500/80';
                    if (color.includes('22c55e') || color.includes('green')) return 'border-green-500/50 hover:border-green-500/80';
                    if (color.includes('ec4899') || color.includes('pink')) return 'border-pink-500/50 hover:border-pink-500/80';
                    if (color.includes('a855f7') || color.includes('purple')) return 'border-purple-500/50 hover:border-purple-500/80';
                    if (color.includes('06b6d4') || color.includes('cyan')) return 'border-cyan-500/50 hover:border-cyan-500/80';
                    if (color.includes('f59e0b') || color.includes('amber')) return 'border-amber-500/50 hover:border-amber-500/80';
                    if (color.includes('f97316') || color.includes('orange')) return 'border-orange-500/50 hover:border-orange-500/80';
                    return 'border-primary/50 hover:border-primary/80';
                  };
                  
                  return (
                  <Tooltip key={subject.name}>
                    <TooltipTrigger asChild>
                      <Link 
                        to={`/tracker?tab=${index}`}
                        className={`flex-shrink-0 w-[100px] md:w-auto bg-card/60 rounded-xl p-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-all duration-200 border-2 ${getBorderColor(subject.color)} hover:shadow-md`}
                      >
                        <div className="relative w-14 h-14 md:w-16 md:h-16">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="15.5"
                              fill="none"
                              className="stroke-muted/30"
                              strokeWidth="3"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15.5"
                              fill="none"
                              stroke={subject.color}
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={`${subject.progress * 0.975} 100`}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                            {subject.progress}%
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground text-center leading-tight whitespace-nowrap">
                          {subject.name}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{subject.fullName}</p>
                    </TooltipContent>
                  </Tooltip>
                );
                })}
              </TooltipProvider>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 mb-8">
            <Link 
              to="/tracker" 
              className="touch-button w-full bg-primary text-primary-foreground border-2 border-primary/50 hover:border-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
            >
              Start Studying
            </Link>
          </div>

          {/* Monthly Summary - At bottom */}
          {user && (
            <div className="mb-6">
              <MonthlySummary />
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
