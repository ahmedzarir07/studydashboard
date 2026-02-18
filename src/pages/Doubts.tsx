import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDoubts, Doubt } from "@/hooks/useDoubts";
import { AskDoubtInput } from "@/components/doubts/AskDoubtInput";
import { DoubtFeedCard } from "@/components/doubts/DoubtFeedCard";
import { AnswersSheet } from "@/components/doubts/AnswersSheet";
import { FeedFilters } from "@/components/doubts/FeedFilters";
import { MessageCircleQuestion, Loader2 } from "lucide-react";

export default function Doubts() {
  const { user } = useAuth();
  const {
    doubts,
    loading,
    createDoubt,
    deleteDoubt,
    reportDoubt,
    toggleDoubtLike,
    sortBy,
    setSortBy,
    filterSubject,
    setFilterSubject,
  } = useDoubts();

  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);

  return (
    <AppLayout title="Community Doubts">
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-5 space-y-3">
        {/* Sticky Ask Input */}
        <AskDoubtInput onPost={createDoubt} />

        {/* Filters */}
        <FeedFilters
          filterSubject={filterSubject}
          setFilterSubject={setFilterSubject}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : doubts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/20">
              <MessageCircleQuestion className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground/80">No doubts yet</h3>
            <p className="text-sm text-muted-foreground text-center">
              Be the first to ask a question!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {doubts.map(d => (
              <DoubtFeedCard
                key={d.id}
                doubt={d}
                userId={user?.id}
                onOpenAnswers={setSelectedDoubt}
                onDelete={deleteDoubt}
                onReport={reportDoubt}
                onToggleLike={toggleDoubtLike}
              />
            ))}
          </div>
        )}

        {/* Answers Bottom Sheet */}
        <AnswersSheet
          doubt={selectedDoubt}
          open={!!selectedDoubt}
          onClose={() => setSelectedDoubt(null)}
        />
      </main>
    </AppLayout>
  );
}
