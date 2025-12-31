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

import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader title={activeSubject.data.name} />

      <main className="px-4 py-4 max-w-5xl mx-auto">
        {/* Subject Pills - Horizontal scroll on mobile */}
        <div className="mb-4 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth-touch pb-2">
            {subjects.map((subject, index) => {
              const isActive = index === activeIndex;
              const Icon = subject.icon;
              return (
                <button
                  key={subject.data.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all min-h-[40px]",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card/60 text-muted-foreground active:bg-card"
                  )}
                >
                  <Icon className="h-4 w-4" />
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
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <ProgressTracker 
            key={activeSubject.data.id}
            initialChapters={activeSubject.data.chapters} 
            subjectId={activeSubject.data.id} 
          />
        </Suspense>
      </main>

      <BottomNav />
    </div>
  );
}
