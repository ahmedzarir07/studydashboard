import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@/components/CircularProgress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { physicsData } from "@/data/physicsData";
import { physics2ndData } from "@/data/physics2ndData";
import { chemistryData } from "@/data/chemistryData";
import { chemistry2ndData } from "@/data/chemistry2ndData";
import { higherMathData } from "@/data/higherMathData";
import { higherMath2ndData } from "@/data/higherMath2ndData";
import { biologyData } from "@/data/biologyData";
import { biology2ndData } from "@/data/biology2ndData";
import { ictData } from "@/data/ictData";
import { useState, useEffect } from "react";
import { MonthlySummary } from "@/components/MonthlySummary";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateOverallProgressPDF, generateDetailedProgressPDF } from "@/lib/pdfGenerator";

interface SubjectProgress {
  name: string;
  fullName: string;
  progress: number;
  color: string;
}

export default function Home() {
  const { user } = useAuth();
  const [overallProgress, setOverallProgress] = useState(0);
  const [subjectProgresses, setSubjectProgresses] = useState<SubjectProgress[]>([]);
  const [recordMap, setRecordMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) {
      setOverallProgress(0);
      setSubjectProgresses([]);
      return;
    }

    const fetchProgress = async () => {
      const allSubjects = [
        { data: physicsData, color: "hsl(var(--primary))", displayName: "Physics 1st" },
        { data: physics2ndData, color: "hsl(217 91% 60%)", displayName: "Physics 2nd" },
        { data: chemistryData, color: "hsl(142 76% 36%)", displayName: "Chemistry 1st" },
        { data: chemistry2ndData, color: "hsl(142 71% 45%)", displayName: "Chemistry 2nd" },
        { data: higherMathData, color: "hsl(262 83% 58%)", displayName: "HM 1st" },
        { data: higherMath2ndData, color: "hsl(262 78% 68%)", displayName: "HM 2nd" },
        { data: biologyData, color: "hsl(25 95% 53%)", displayName: "Biology 1st" },
        { data: biology2ndData, color: "hsl(25 90% 63%)", displayName: "Biology 2nd" },
        { data: ictData, color: "hsl(199 89% 48%)", displayName: "ICT" },
      ];

      const { data: records } = await supabase
        .from("study_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "status");

      const newRecordMap = new Map<string, string>();
      records?.forEach((r) => {
        newRecordMap.set(`${r.subject}-${r.chapter}-${r.activity}`, r.status || "");
      });
      setRecordMap(newRecordMap);

      let totalCompleted = 0;
      let totalItems = 0;
      const progresses: SubjectProgress[] = [];

      allSubjects.forEach(({ data: subject, color, displayName }) => {
        let subjectCompleted = 0;
        let subjectTotal = 0;

        subject.chapters.forEach((chapter) => {
          chapter.activities.forEach((activity) => {
            if (activity.name !== "Total Lec") {
              totalItems++;
              subjectTotal++;
              const status = newRecordMap.get(`${subject.id}-${chapter.name}-${activity.name}`);
              if (status === "Done") {
                totalCompleted++;
                subjectCompleted++;
              }
            }
          });
        });

        progresses.push({
          name: displayName,
          fullName: subject.name,
          progress: subjectTotal > 0 ? Math.round((subjectCompleted / subjectTotal) * 100) : 0,
          color,
        });
      });

      setOverallProgress(totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0);
      setSubjectProgresses(progresses);
    };

    fetchProgress();
  }, [user]);

  const handleDownloadOverallPDF = async () => {
    if (!user?.email) return;
    await generateOverallProgressPDF(user.email, overallProgress, subjectProgresses);
  };

  const handleDownloadDetailedPDF = async () => {
    if (!user?.email) return;
    
    const allSubjects = [
      { data: physicsData, displayName: "Physics 1st" },
      { data: physics2ndData, displayName: "Physics 2nd" },
      { data: chemistryData, displayName: "Chemistry 1st" },
      { data: chemistry2ndData, displayName: "Chemistry 2nd" },
      { data: higherMathData, displayName: "HM 1st" },
      { data: higherMath2ndData, displayName: "HM 2nd" },
      { data: biologyData, displayName: "Biology 1st" },
      { data: biology2ndData, displayName: "Biology 2nd" },
      { data: ictData, displayName: "ICT" },
    ];

    const subjectDetails = allSubjects.map(({ data, displayName }) => ({
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
      subjectProgresses,
      subjectDetails,
      recordMap
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader title="Study Progress" />

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

        {/* Monthly Summary */}
        {user && (
          <div className="mb-6">
            <MonthlySummary />
          </div>
        )}

        {/* Overall Progress - Centered on mobile */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="bg-card/50 rounded-2xl p-6 md:p-8">
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
              {subjectProgresses.map((subject, index) => (
                <Tooltip key={subject.name}>
                  <TooltipTrigger asChild>
                    <Link 
                      to={`/tracker?tab=${index}`}
                      className="flex-shrink-0 w-[100px] md:w-auto bg-card/60 rounded-xl p-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform"
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
              ))}
            </TooltipProvider>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link 
            to="/tracker" 
            className="touch-button w-full bg-primary text-primary-foreground"
          >
            Start Studying
          </Link>
          <Link 
            to="/resources" 
            className="touch-button w-full bg-card text-foreground border border-border"
          >
            View Study Tips
          </Link>
        </div>
      </main>

      {/* Mobile Download Buttons - Sticky */}
      {user && (
        <div className="fixed bottom-16 left-0 right-0 px-4 py-2 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-40">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadOverallPDF}
              className="flex-1 gap-1 h-10 text-xs"
            >
              <Download className="h-3 w-3" />
              1 Page
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadDetailedPDF}
              className="flex-1 gap-1 h-10 text-xs"
            >
              <Download className="h-3 w-3" />
              Full Report
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
