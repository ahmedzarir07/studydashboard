import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, CheckCircle2, Download } from "lucide-react";
import { useChapterCompletions } from "@/hooks/useChapterCompletions";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { generateMonthlyProgressPDF } from "@/lib/pdfGenerator";

export const MonthlySummary = () => {
  const { getMonthlyCompletions, loading } = useChapterCompletions();
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const monthlyCompletions = getMonthlyCompletions();
  const currentMonth = format(new Date(), "MMMM yyyy");

  const handleDownloadMonthlyPDF = async () => {
    if (!user?.email) return;
    await generateMonthlyProgressPDF(user.email, currentMonth, monthlyCompletions);
  };

  // Group by subject
  const bySubject = monthlyCompletions.reduce((acc, c) => {
    acc[c.subject] = (acc[c.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-32 mb-4"></div>
          <div className="h-10 bg-muted rounded w-16"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4 md:p-6 bg-card/80 backdrop-blur-sm border border-accent/40 hover:border-accent/60 hover:shadow-md transition-all duration-200">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs font-medium truncate">{currentMonth}</span>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {monthlyCompletions.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Chapters Completed
                </p>
              </div>
              {Object.keys(bySubject).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(bySubject).map(([subject, count]) => (
                    <Badge key={subject} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      {subject}: {count}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(true)}
              disabled={monthlyCompletions.length === 0}
              className="text-primary hover:text-primary/80 px-2 flex-shrink-0"
            >
              <span className="hidden sm:inline">View Details</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
          
          {/* Download Monthly PDF Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMonthlyPDF}
            disabled={monthlyCompletions.length === 0}
            className="w-full gap-2 h-9 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="truncate">Download Monthly Progress (PDF)</span>
          </Button>
        </div>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {currentMonth} - Completed Chapters
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {monthlyCompletions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No chapters completed this month yet.
              </p>
            ) : (
              monthlyCompletions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {c.chapter}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {c.subject}
                      </Badge>
                      {c.completed_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(c.completed_at), "MMM d, h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
