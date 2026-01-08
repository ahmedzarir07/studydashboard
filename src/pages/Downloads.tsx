import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Download, FileText, ClipboardList } from "lucide-react";
import { generateOverallProgressPDF, generateDetailedProgressPDF } from "@/lib/pdfGenerator";
import { Card, CardContent } from "@/components/ui/card";
import { ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";

interface SubjectProgress {
  name: string;
  fullName: string;
  progress: number;
  color: string;
}

export default function Downloads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overallProgress, setOverallProgress] = useState(0);
  const [subjectProgresses, setSubjectProgresses] = useState<SubjectProgress[]>([]);
  const [recordMap, setRecordMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProgress = async () => {
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

      ALL_SUBJECTS.forEach(({ data: subject, color, displayName }) => {
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
      setIsLoading(false);
    };

    fetchProgress();
  }, [user, navigate]);

  const handleDownloadOverallPDF = async () => {
    if (!user?.email) return;
    await generateOverallProgressPDF(user.email, overallProgress, subjectProgresses);
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
      subjectProgresses,
      subjectDetails,
      recordMap
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Downloads" />

      <main className="px-4 py-6 max-w-md mx-auto">
        <p className="text-sm text-muted-foreground mb-6 px-1">
          Download your progress reports as PDF files.
        </p>

        <div className="space-y-4">
          {/* 1-Page Summary Card */}
          <Card className="border-border/50 bg-card/60">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">
                    1-Page Progress Summary
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    All subjects combined in a single-page overview with overall progress percentage.
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownloadOverallPDF}
                    disabled={isLoading}
                    className="mt-4 gap-2 w-full"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Report Card */}
          <Card className="border-border/50 bg-card/60">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-secondary text-secondary-foreground">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">
                    Full Progress Report
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Detailed subject-wise and chapter-wise progress with activity status for each subject.
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownloadDetailedPDF}
                    disabled={isLoading}
                    className="mt-4 gap-2 w-full"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
