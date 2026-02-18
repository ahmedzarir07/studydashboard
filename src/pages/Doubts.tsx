import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDoubts, Doubt } from "@/hooks/useDoubts";
import { AskDoubtInput } from "@/components/doubts/AskDoubtInput";
import { DoubtFeedCard } from "@/components/doubts/DoubtFeedCard";
import { AnswersSheet } from "@/components/doubts/AnswersSheet";
import { FeedFilters } from "@/components/doubts/FeedFilters";
import { MessageCircleQuestion, Loader2, Sparkles } from "lucide-react";

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
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-5 space-y-4">
        {/* Page Header */}
        <div className="flex items-center gap-3 pb-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Community Doubts</h1>
            <p className="text-[11px] text-muted-foreground">Ask questions, share knowledge, help others</p>
          </div>
        </div>

        {/* Ask Input */}
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
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-ping" />
            </div>
            <p className="text-xs text-muted-foreground">Loading doubts...</p>
          </div>
        ) : doubts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/30 flex items-center justify-center">
                <MessageCircleQuestion className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-foreground/80">No doubts yet</h3>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                Be the first to ask a question and start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
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
            <div className="text-center py-4">
              <p className="text-[11px] text-muted-foreground/50">— End of feed —</p>
            </div>
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
