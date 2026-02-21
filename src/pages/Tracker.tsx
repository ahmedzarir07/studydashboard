import { useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Atom, BookOpen, Calculator, Dna, Monitor, Loader2, FileText, Languages, BookMarked } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

import { AppLayout } from "@/components/AppLayout";
import { ProgressTracker } from "@/components/ProgressTracker";
import { SubjectProgressBar } from "@/components/SubjectProgressBar";
import { cn } from "@/lib/utils";

const subjects = [
  { data: physicsData, icon: BookOpen, label: "Phy 1", color: "hsl(217 91% 60%)" },
  { data: physics2ndData, icon: BookOpen, label: "Phy 2", color: "hsl(199 89% 60%)" },
  { data: chemistryData, icon: Atom, label: "Chem 1", color: "hsl(142 76% 45%)" },
  { data: chemistry2ndData, icon: Atom, label: "Chem 2", color: "hsl(142 71% 55%)" },
  { data: higherMathData, icon: Calculator, label: "HM 1", color: "hsl(262 83% 58%)" },
  { data: higherMath2ndData, icon: Calculator, label: "HM 2", color: "hsl(262 78% 68%)" },
  { data: biologyData, icon: Dna, label: "Bio 1", color: "hsl(25 95% 53%)" },
  { data: biology2ndData, icon: Dna, label: "Bio 2", color: "hsl(25 90% 63%)" },
  { data: ictData, icon: Monitor, label: "ICT", color: "hsl(199 89% 48%)" },
  { data: english1stData, icon: FileText, label: "Eng 1", color: "hsl(340 82% 52%)" },
  { data: english2ndData, icon: Languages, label: "Eng 2", color: "hsl(280 70% 55%)" },
  { data: bangla1stData, icon: BookMarked, label: "বাংলা ১", color: "hsl(45 93% 47%)" },
  { data: bangla2ndData, icon: BookMarked, label: "বাংলা ২", color: "hsl(35 90% 50%)" },
];

export default function Tracker() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const tabIndex = searchParams.get('tab');
  const initialIndex = tabIndex !== null ? parseInt(tabIndex) : 0;
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (tabIndex !== null) {
      setActiveIndex(parseInt(tabIndex));
    }
  }, [tabIndex]);

  const activeSubject = subjects[activeIndex] || subjects[0];

  return (
    <AppLayout title={activeSubject.data.name}>
      <main className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-4 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Subject Pills */}
          <div className="mb-4 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 overflow-x-auto scroll-smooth-touch pb-2 scrollbar-hide">
              {subjects.map((subject, index) => {
                const isActive = index === activeIndex;
                const Icon = subject.icon;
                return (
                  <button
                    key={subject.data.id}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 min-h-[40px] border",
                      isActive 
                        ? "bg-primary/15 text-primary border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.15)]" 
                        : "bg-card/40 backdrop-blur-sm text-muted-foreground active:bg-card border-transparent hover:border-border/50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive && "drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]")} />
                    <span>{subject.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Progress Bar */}
          <SubjectProgressBar 
            subjectId={activeSubject.data.id}
            chapters={activeSubject.data.chapters}
            subjectName={activeSubject.data.name}
            color={activeSubject.color}
          />

          {/* Chapter List */}
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="h-8 w-8 animate-spin text-primary relative" />
              </div>
            </div>
          }>
            <ProgressTracker 
              key={activeSubject.data.id}
              initialChapters={activeSubject.data.chapters} 
              subjectId={activeSubject.data.id} 
            />
          </Suspense>
        </div>
      </main>
    </AppLayout>
  );
}
