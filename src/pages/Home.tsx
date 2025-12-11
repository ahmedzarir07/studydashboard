import { Link } from "react-router-dom";
import { BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/CircularProgress";
import { physicsData } from "@/data/physicsData";
import { chemistryData } from "@/data/chemistryData";
import { higherMathData } from "@/data/higherMathData";
import { biologyData } from "@/data/biologyData";
import { ictData } from "@/data/ictData";
import { useState, useEffect } from "react";
import { Status } from "@/types/tracker";

export default function Home() {
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const allSubjects = [physicsData, chemistryData, higherMathData, biologyData, ictData];
    let totalCompleted = 0;
    let totalItems = 0;

    allSubjects.forEach(subject => {
      // Get the storage key using the first chapter's name (same as ProgressTracker)
      const subjectKey = subject.chapters[0]?.name || 'default';
      const statusStorageKey = `activityStatus-${subjectKey}`;
      const savedStatuses = localStorage.getItem(statusStorageKey);
      const parsedStatuses: Record<number, Status[]> = savedStatuses ? JSON.parse(savedStatuses) : {};

      subject.chapters.forEach(chapter => {
        chapter.activities.forEach((activity, idx) => {
          if (activity.name !== "Total Lec") {
            totalItems++;
            // Use saved status from localStorage if available, otherwise use initial status
            const savedStatus = parsedStatuses[chapter.id]?.[idx];
            const currentStatus = savedStatus ?? activity.status;
            if (currentStatus === "Done") {
              totalCompleted++;
            }
          }
        });
      });
    });

    setOverallProgress(totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">HSC Study Tracker</h1>
            <div className="flex gap-4">
              <Link to="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Home</Button>
              </Link>
              <Link to="/tracker">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Tracker</Button>
              </Link>
              <Link to="/resources">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Resources</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        {/* Overall Progress Widget */}
        <div className="flex justify-center mb-12">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <CircularProgress percentage={overallProgress} />
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-4">
            HSC Study Tracker
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete study tracking system for Physics, Chemistry, Higher Math, and Biology
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          <Card className="bg-card border-border hover:bg-card/80 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">Study Tracker</CardTitle>
              <CardDescription className="text-muted-foreground">
                Track all chapters and activities across four subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tracker">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Open Tracker
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:bg-card/80 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-foreground">Resources</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage class notes, MCQs, and other study resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/resources">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  View Resources
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-6">Subjects</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Physics 1st Paper (10 chapters)</span>
            </div>
            <div className="px-6 py-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Chemistry 1st Paper (5 chapters)</span>
            </div>
            <div className="px-6 py-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Higher Math 1st Paper (10 chapters)</span>
            </div>
            <div className="px-6 py-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">Biology 1st Paper (12 chapters)</span>
            </div>
            <div className="px-6 py-3 bg-card border border-border rounded-lg">
              <span className="text-muted-foreground">ICT (6 chapters)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
