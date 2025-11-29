import { useState } from "react";
import { Link } from "react-router-dom";
import { Atom, BookOpen, Calculator, Dna } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProgressTracker } from "@/components/ProgressTracker";
import { physicsData } from "@/data/physicsData";
import { chemistryData } from "@/data/chemistryData";
import { higherMathData } from "@/data/higherMathData";
import { biologyData } from "@/data/biologyData";

const subjects = [
  { data: physicsData, icon: BookOpen, gradient: "from-blue-600 to-cyan-600" },
  { data: chemistryData, icon: Atom, gradient: "from-green-600 to-emerald-600" },
  { data: higherMathData, icon: Calculator, gradient: "from-purple-600 to-pink-600" },
  { data: biologyData, icon: Dna, gradient: "from-orange-600 to-red-600" },
];

export default function Tracker() {
  const [activeSubject, setActiveSubject] = useState(subjects[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-100">HSC Study Tracker</h1>
            <div className="flex gap-4">
              <Link to="/">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">হোম</Button>
              </Link>
              <Link to="/tracker">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">ট্র্যাকার</Button>
              </Link>
              <Link to="/resources">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">রিসোর্স</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${activeSubject.gradient}`}>
              <activeSubject.icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-100">{activeSubject.data.name}</h2>
          </div>
        </div>

        <Tabs defaultValue={physicsData.id} className="w-full" onValueChange={(value) => {
          const subject = subjects.find(s => s.data.id === value);
          if (subject) setActiveSubject(subject);
        }}>
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-800/50 border border-slate-700">
            {subjects.map((subject) => (
              <TabsTrigger
                key={subject.data.id}
                value={subject.data.id}
                className="flex items-center gap-2 data-[state=active]:bg-slate-700"
              >
                <subject.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{subject.data.name.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map((subject) => (
            <TabsContent key={subject.data.id} value={subject.data.id}>
              <ProgressTracker initialChapters={subject.data.chapters} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
