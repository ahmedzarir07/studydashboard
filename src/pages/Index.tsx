import { useState } from "react";
import { ProgressTracker } from "@/components/ProgressTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Atom, Calculator, Dna } from "lucide-react";
import { physicsData } from "@/data/physicsData";
import { chemistryData } from "@/data/chemistryData";
import { higherMathData } from "@/data/higherMathData";
import { biologyData } from "@/data/biologyData";

const subjects = [
  { ...physicsData, icon: BookOpen, color: "from-primary to-primary/70" },
  { ...chemistryData, icon: Atom, color: "from-info to-info/70" },
  { ...higherMathData, icon: Calculator, color: "from-secondary to-secondary/70" },
  { ...biologyData, icon: Dna, color: "from-success to-success/70" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState(subjects[0].id);
  const activeSubject = subjects.find((s) => s.id === activeTab) || subjects[0];
  const Icon = activeSubject.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-gradient-to-br ${activeSubject.color} rounded-2xl shadow-lg`}>
              <Icon className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1
                className={`text-4xl font-bold bg-gradient-to-r ${activeSubject.color} bg-clip-text text-transparent`}
              >
                HSC Study Tracker
              </h1>
              <p className="text-muted-foreground mt-1">{activeSubject.name}</p>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 bg-muted/50 p-2 h-auto">
            {subjects.map((subject) => {
              const SubjectIcon = subject.icon;
              return (
                <TabsTrigger
                  key={subject.id}
                  value={subject.id}
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm flex items-center gap-2 py-3"
                >
                  <SubjectIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{subject.name}</span>
                  <span className="sm:hidden">{subject.name.split(" ")[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mb-6 p-4 bg-accent/50 rounded-xl border border-accent">
            <p className="text-sm text-accent-foreground">
              <strong>How to use:</strong> Click on any status badge to cycle through: Empty → Not
              Started → In Progress → Done
            </p>
          </div>

          {subjects.map((subject) => (
            <TabsContent key={subject.id} value={subject.id} className="mt-0">
              <ProgressTracker initialChapters={subject.chapters} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
