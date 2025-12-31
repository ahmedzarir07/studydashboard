import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, TrendingUp, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { physicsData } from "@/data/physicsData";
import { physics2ndData } from "@/data/physics2ndData";
import { chemistryData } from "@/data/chemistryData";
import { chemistry2ndData } from "@/data/chemistry2ndData";
import { higherMathData } from "@/data/higherMathData";
import { higherMath2ndData } from "@/data/higherMath2ndData";
import { biologyData } from "@/data/biologyData";
import { biology2ndData } from "@/data/biology2ndData";
import { ictData } from "@/data/ictData";
import { english1stData } from "@/data/english1stData";
import { english2ndData } from "@/data/english2ndData";
import { bangla1stData } from "@/data/bangla1stData";
import { bangla2ndData } from "@/data/bangla2ndData";

const allSubjects = [
  { data: physicsData, label: "Physics 1st", short: "Phy 1", color: "hsl(217 91% 60%)" },
  { data: physics2ndData, label: "Physics 2nd", short: "Phy 2", color: "hsl(199 89% 60%)" },
  { data: chemistryData, label: "Chemistry 1st", short: "Chem 1", color: "hsl(142 76% 45%)" },
  { data: chemistry2ndData, label: "Chemistry 2nd", short: "Chem 2", color: "hsl(142 71% 55%)" },
  { data: higherMathData, label: "Higher Math 1st", short: "HM 1", color: "hsl(262 83% 58%)" },
  { data: higherMath2ndData, label: "Higher Math 2nd", short: "HM 2", color: "hsl(262 78% 68%)" },
  { data: biologyData, label: "Biology 1st", short: "Bio 1", color: "hsl(25 95% 53%)" },
  { data: biology2ndData, label: "Biology 2nd", short: "Bio 2", color: "hsl(25 90% 63%)" },
  { data: ictData, label: "ICT", short: "ICT", color: "hsl(199 89% 48%)" },
  { data: english1stData, label: "English 1st", short: "Eng 1", color: "hsl(340 82% 52%)" },
  { data: english2ndData, label: "English 2nd", short: "Eng 2", color: "hsl(280 70% 55%)" },
  { data: bangla1stData, label: "বাংলা ১ম পত্র", short: "বাংলা ১", color: "hsl(45 93% 47%)" },
  { data: bangla2ndData, label: "বাংলা ২য় পত্র", short: "বাংলা ২", color: "hsl(35 90% 50%)" },
];

interface SubjectProgress {
  id: string;
  label: string;
  short: string;
  color: string;
  totalChapters: number;
  completedChapters: number;
  totalActivities: number;
  completedActivities: number;
  progressPercent: number;
}

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studyRecords, setStudyRecords] = useState<Map<string, Set<string>>>(new Map());
  const [chapterCompletions, setChapterCompletions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      // Fetch completed activities
      const { data: records } = await supabase
        .from("study_records")
        .select("subject, chapter, activity, status")
        .eq("user_id", user.id)
        .eq("type", "status")
        .eq("status", "Done");

      const recordMap = new Map<string, Set<string>>();
      records?.forEach((r) => {
        const key = `${r.subject}-${r.chapter}`;
        if (!recordMap.has(key)) {
          recordMap.set(key, new Set());
        }
        recordMap.get(key)!.add(r.activity);
      });
      setStudyRecords(recordMap);

      // Fetch chapter completions
      const { data: completions } = await supabase
        .from("chapter_completions")
        .select("subject, chapter, completed")
        .eq("user_id", user.id)
        .eq("completed", true);

      const completionSet = new Set<string>();
      completions?.forEach((c) => {
        completionSet.add(`${c.subject}-${c.chapter}`);
      });
      setChapterCompletions(completionSet);

      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  const subjectProgress = useMemo<SubjectProgress[]>(() => {
    return allSubjects.map((subject) => {
      const totalChapters = subject.data.chapters.length;
      let completedChapters = 0;
      let totalActivities = 0;
      let completedActivities = 0;

      subject.data.chapters.forEach((chapter) => {
        const key = `${subject.data.id}-${chapter.name}`;
        const chapterActivities = chapter.activities.length;
        totalActivities += chapterActivities;

        const completed = studyRecords.get(key);
        if (completed) {
          completedActivities += completed.size;
        }

        if (chapterCompletions.has(key)) {
          completedChapters++;
        }
      });

      const progressPercent = totalActivities > 0 
        ? Math.round((completedActivities / totalActivities) * 100) 
        : 0;

      return {
        id: subject.data.id,
        label: subject.label,
        short: subject.short,
        color: subject.color,
        totalChapters,
        completedChapters,
        totalActivities,
        completedActivities,
        progressPercent,
      };
    });
  }, [studyRecords, chapterCompletions]);

  const overallStats = useMemo(() => {
    const totalSubjects = subjectProgress.length;
    const totalChapters = subjectProgress.reduce((sum, s) => sum + s.totalChapters, 0);
    const completedChapters = subjectProgress.reduce((sum, s) => sum + s.completedChapters, 0);
    const totalActivities = subjectProgress.reduce((sum, s) => sum + s.totalActivities, 0);
    const completedActivities = subjectProgress.reduce((sum, s) => sum + s.completedActivities, 0);
    const overallPercent = totalActivities > 0 
      ? Math.round((completedActivities / totalActivities) * 100) 
      : 0;

    return {
      totalSubjects,
      totalChapters,
      completedChapters,
      totalActivities,
      completedActivities,
      overallPercent,
    };
  }, [subjectProgress]);

  const handleSubjectClick = (index: number) => {
    navigate(`/tracker?tab=${index}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader title="Overview" />

      <main className="px-4 py-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Overall Progress Card */}
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-2xl p-6 mb-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Overall Progress</h2>
                  <p className="text-sm text-muted-foreground">Across all subjects</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-3xl font-bold text-foreground">
                    {overallStats.overallPercent}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {overallStats.completedActivities} / {overallStats.totalActivities} activities
                  </span>
                </div>
                <Progress value={overallStats.overallPercent} className="h-3" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-background/60 rounded-xl p-3 text-center">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-semibold text-foreground">{overallStats.totalSubjects}</p>
                  <p className="text-xs text-muted-foreground">Subjects</p>
                </div>
                <div className="bg-background/60 rounded-xl p-3 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <p className="text-lg font-semibold text-foreground">{overallStats.completedChapters}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="bg-background/60 rounded-xl p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-lg font-semibold text-foreground">
                    {overallStats.totalChapters - overallStats.completedChapters}
                  </p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
              </div>
            </div>

            {/* Subject Progress List */}
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Subject Breakdown
            </h3>
            <div className="space-y-3">
              {subjectProgress.map((subject, index) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectClick(index)}
                  className="w-full bg-card/60 hover:bg-card/80 rounded-xl p-4 transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {subject.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {subject.progressPercent}%
                    </span>
                  </div>
                  
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${subject.progressPercent}%`,
                        backgroundColor: subject.color,
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{subject.completedChapters}/{subject.totalChapters} chapters</span>
                    <span>{subject.completedActivities}/{subject.totalActivities} activities</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
