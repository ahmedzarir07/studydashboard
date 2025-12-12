import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Atom, BookOpen, Calculator, Dna, Monitor, LogIn, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProgressTracker } from "@/components/ProgressTracker";
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
import { MonthlySummary } from "@/components/MonthlySummary";

const subjects = [
  { data: physicsData, icon: BookOpen, gradient: "from-blue-600 to-cyan-600" },
  { data: physics2ndData, icon: BookOpen, gradient: "from-blue-500 to-cyan-500" },
  { data: chemistryData, icon: Atom, gradient: "from-green-600 to-emerald-600" },
  { data: chemistry2ndData, icon: Atom, gradient: "from-green-500 to-emerald-500" },
  { data: higherMathData, icon: Calculator, gradient: "from-purple-600 to-pink-600" },
  { data: higherMath2ndData, icon: Calculator, gradient: "from-purple-500 to-pink-500" },
  { data: biologyData, icon: Dna, gradient: "from-orange-600 to-red-600" },
  { data: biology2ndData, icon: Dna, gradient: "from-orange-500 to-red-500" },
  { data: ictData, icon: Monitor, gradient: "from-teal-600 to-sky-600" },
];

export default function Tracker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const tabIndex = searchParams.get('tab');
  const initialSubject = tabIndex !== null ? subjects[parseInt(tabIndex)] || subjects[0] : subjects[0];
  const [activeSubject, setActiveSubject] = useState(initialSubject);

  useEffect(() => {
    if (tabIndex !== null) {
      const subject = subjects[parseInt(tabIndex)];
      if (subject) setActiveSubject(subject);
    }
  }, [tabIndex]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-100">Study Progress</h1>
            <div className="flex gap-4 items-center">
              <Link to="/">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">Home</Button>
              </Link>
              <Link to="/tracker">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">Tracker</Button>
              </Link>
              <Link to="/resources">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">Resources</Button>
              </Link>
              {!loading && (
                user ? (
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="text-slate-300 border-slate-600">
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

      <div className="container mx-auto px-4 py-8">
        {/* Monthly Summary */}
        {user && (
          <div className="mb-8 max-w-md">
            <MonthlySummary />
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${activeSubject.gradient}`}>
              <activeSubject.icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-100">{activeSubject.data.name}</h2>
          </div>
        </div>

        <Tabs value={activeSubject.data.id} className="w-full" onValueChange={(value) => {
          const subject = subjects.find(s => s.data.id === value);
          if (subject) setActiveSubject(subject);
        }}>
          <TabsList className="flex flex-wrap w-full mb-8 bg-slate-800/50 border border-slate-700 h-auto gap-1 p-1">
            {subjects.map((subject) => (
              <TabsTrigger
                key={subject.data.id}
                value={subject.data.id}
                className="flex items-center gap-1 data-[state=active]:bg-slate-700 text-xs px-2 py-1.5"
              >
                <subject.icon className="w-3 h-3" />
                <span className="hidden md:inline">{subject.data.name.replace(" Paper", "")}</span>
                <span className="md:hidden">{subject.data.name.split(" ")[0].slice(0, 3)}{subject.data.name.includes("2nd") ? "2" : "1"}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map((subject) => (
            <TabsContent key={subject.data.id} value={subject.data.id}>
              <ProgressTracker initialChapters={subject.data.chapters} subjectId={subject.data.id} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
