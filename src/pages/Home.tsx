import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { LogIn, LogOut } from "lucide-react";
import { MonthlySummary } from "@/components/MonthlySummary";

interface SubjectProgress {
  name: string;
  fullName: string;
  progress: number;
  color: string;
}

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [overallProgress, setOverallProgress] = useState(0);
  const [subjectProgresses, setSubjectProgresses] = useState<SubjectProgress[]>([]);

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

      // Fetch all records for the user
      const { data: records } = await supabase
        .from("study_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "status");

      const recordMap = new Map<string, string>();
      records?.forEach((r) => {
        recordMap.set(`${r.subject}-${r.chapter}-${r.activity}`, r.status || "");
      });

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
              const status = recordMap.get(`${subject.id}-${chapter.name}-${activity.name}`);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Study Progress</h1>
            <div className="flex gap-4 items-center">
              <Link to="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Home</Button>
              </Link>
              <Link to="/tracker">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Tracker</Button>
              </Link>
              <Link to="/resources">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Resources</Button>
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
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        {/* Monthly Summary */}
        {user && (
          <div className="mb-8 max-w-md mx-auto">
            <MonthlySummary />
          </div>
        )}

        {/* Overall Progress Widget */}
        <div className="flex flex-col items-center gap-8 mb-12">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <CircularProgress percentage={overallProgress} />
          </div>
          
          {/* Individual Subject Progress */}
          <TooltipProvider>
            <div className="flex flex-wrap justify-center gap-4">
              {subjectProgresses.map((subject, index) => (
                <Tooltip key={subject.name}>
                  <TooltipTrigger asChild>
                    <Link 
                      to={`/tracker?tab=${index}`}
                      className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 min-w-[120px] hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer"
                    >
                      <div className="relative w-16 h-16">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="15.5"
                            fill="none"
                            className="stroke-muted"
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
                      <span className="text-xs text-muted-foreground text-center leading-tight">
                        {subject.name}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{subject.fullName}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Study Progress
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your progress across all 9 subjects (1st and 2nd papers)
          </p>
        </div>

      </main>
    </div>
  );
}
