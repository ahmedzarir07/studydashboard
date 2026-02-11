import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDoubts, useDoubtAnswers, Doubt } from "@/hooks/useDoubts";
import { ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  MessageCircleQuestion,
  Send,
  ThumbsUp,
  MessageSquare,
  Clock,
  Loader2,
  Trash2,
  Flag,
  ArrowUpDown,
  Filter,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const SUBJECT_OPTIONS = ALL_SUBJECTS.map(s => ({ id: s.data.id, name: s.displayName }));

function AskDoubtCard({ onPost }: { onPost: (subject: string, question: string, chapter?: string) => Promise<void> }) {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [question, setQuestion] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!subject || !question.trim()) return;
    setPosting(true);
    await onPost(subject, question.trim(), chapter.trim() || undefined);
    setSubject("");
    setChapter("");
    setQuestion("");
    setPosting(false);
  };

  return (
    <Card className="glass-card neon-border p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold gradient-text">Ask a Doubt</h2>
          <p className="text-xs text-muted-foreground">Get help from fellow students</p>
        </div>
      </div>

      <Select value={subject} onValueChange={setSubject}>
        <SelectTrigger className="bg-background/50">
          <SelectValue placeholder="Select Subject *" />
        </SelectTrigger>
        <SelectContent>
          {SUBJECT_OPTIONS.map(s => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        type="text"
        placeholder="Chapter (optional)"
        value={chapter}
        onChange={e => setChapter(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <Textarea
        placeholder="Write your question... *"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        className="bg-background/50 min-h-[100px]"
        maxLength={2000}
      />

      <Button
        onClick={handlePost}
        disabled={!subject || !question.trim() || posting}
        className="w-full"
      >
        {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
        Post Doubt
      </Button>
    </Card>
  );
}

function DoubtCard({
  doubt,
  userId,
  onOpenAnswers,
  onDelete,
  onReport,
}: {
  doubt: Doubt;
  userId?: string;
  onOpenAnswers: (d: Doubt) => void;
  onDelete: (id: string) => void;
  onReport: (id: string) => void;
}) {
  const subjectMeta = SUBJECT_OPTIONS.find(s => s.id === doubt.subject);
  const displayName = doubt.profile?.display_name || "Anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(doubt.created_at), { addSuffix: true });
  const isOwn = userId === doubt.user_id;

  return (
    <Card className="glass-card p-4 space-y-3 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground">{displayName}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {subjectMeta?.name || doubt.subject}
            </Badge>
            {doubt.chapter && (
              <span className="text-[10px] text-muted-foreground">· {doubt.chapter}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{doubt.question}</p>

      {doubt.image_url && (
        <img src={doubt.image_url} alt="Doubt image" className="rounded-lg max-h-48 object-cover w-full" />
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-border/30">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1.5 flex-1"
          onClick={() => onOpenAnswers(doubt)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {doubt.answer_count} {doubt.answer_count === 1 ? "Answer" : "Answers"}
        </Button>

        {isOwn ? (
          <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => onDelete(doubt.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => onReport(doubt.id)}>
            <Flag className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </Card>
  );
}

function AnswersDialog({
  doubt,
  open,
  onClose,
}: {
  doubt: Doubt | null;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { answers, loading, postAnswer, toggleVote, deleteAnswer, reportAnswer } = useDoubtAnswers(doubt?.id || null);
  const [newAnswer, setNewAnswer] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!newAnswer.trim()) return;
    setPosting(true);
    await postAnswer(newAnswer.trim());
    setNewAnswer("");
    setPosting(false);
  };

  if (!doubt) return null;

  const subjectMeta = SUBJECT_OPTIONS.find(s => s.id === doubt.subject);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b border-border/30">
          <DialogTitle className="text-base flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5 text-primary" />
            Doubt Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Question */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{subjectMeta?.name || doubt.subject}</Badge>
              {doubt.chapter && <span className="text-xs text-muted-foreground">{doubt.chapter}</span>}
            </div>
            <p className="text-sm font-medium text-foreground">{doubt.question}</p>
            <p className="text-[10px] text-muted-foreground">
              {doubt.profile?.display_name || "Anonymous"} · {formatDistanceToNow(new Date(doubt.created_at), { addSuffix: true })}
            </p>
          </div>

          {/* Answers */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </h3>

            {loading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}

            {!loading && answers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No answers yet. Be the first!</p>
            )}

            {answers
              .sort((a, b) => b.vote_count - a.vote_count)
              .map(answer => {
                const aName = answer.profile?.display_name || "Anonymous";
                const isOwn = user?.id === answer.user_id;
                return (
                  <Card key={answer.id} className="p-3 space-y-2 bg-muted/20">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarFallback className="text-[10px] bg-accent/20">{aName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium">{aName}</span>
                        <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">{answer.answer_text}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-9">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("text-xs gap-1 h-7", answer.user_voted && "text-primary")}
                        onClick={() => user && toggleVote(answer.id, answer.user_voted)}
                        disabled={!user}
                      >
                        <ThumbsUp className={cn("h-3.5 w-3.5", answer.user_voted && "fill-primary")} />
                        {answer.vote_count}
                      </Button>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                      </span>
                      {isOwn ? (
                        <Button variant="ghost" size="sm" className="h-7 text-destructive text-[10px]" onClick={() => deleteAnswer(answer.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      ) : user && (
                        <Button variant="ghost" size="sm" className="h-7 text-muted-foreground text-[10px]" onClick={() => reportAnswer(answer.id)}>
                          <Flag className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Answer Input */}
        {user ? (
          <div className="p-4 border-t border-border/30 flex gap-2">
            <Textarea
              placeholder="Write your answer..."
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
              className="min-h-[60px] bg-background/50 flex-1"
              maxLength={2000}
            />
            <Button size="icon" onClick={handlePost} disabled={!newAnswer.trim() || posting} className="self-end">
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <div className="p-4 border-t border-border/30 text-center">
            <Link to="/auth" className="text-sm text-primary hover:underline">Sign in to answer</Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Doubts() {
  const { user } = useAuth();
  const {
    doubts,
    loading,
    createDoubt,
    deleteDoubt,
    reportDoubt,
    sortBy,
    setSortBy,
    filterSubject,
    setFilterSubject,
  } = useDoubts();

  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);

  return (
    <AppLayout title="Community Doubts">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Hero */}
        <div className="glass-card neon-border p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent rounded-full blur-3xl" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl pulse-glow">
              <MessageCircleQuestion className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Community Doubts</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ask questions, help others, learn together
              </p>
            </div>
          </div>
        </div>

        {/* Ask Doubt */}
        {user ? (
          <AskDoubtCard onPost={createDoubt} />
        ) : (
          <Card className="glass-card p-5 text-center space-y-2">
            <Sparkles className="h-8 w-8 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Sign in to ask or answer doubts</p>
            <Link to="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="flex-1 bg-background/50 h-9 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {SUBJECT_OPTIONS.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
            <SelectTrigger className="w-[140px] bg-background/50 h-9 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most_answers">Most Answers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Doubt Feed */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : doubts.length === 0 ? (
          <div className="glass-card p-8 text-center space-y-3">
            <MessageCircleQuestion className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="font-semibold gradient-text">No doubts yet</h3>
            <p className="text-sm text-muted-foreground">Be the first to ask a question!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doubts.map(d => (
              <DoubtCard
                key={d.id}
                doubt={d}
                userId={user?.id}
                onOpenAnswers={setSelectedDoubt}
                onDelete={deleteDoubt}
                onReport={reportDoubt}
              />
            ))}
          </div>
        )}

        {/* Answers Dialog */}
        <AnswersDialog
          doubt={selectedDoubt}
          open={!!selectedDoubt}
          onClose={() => setSelectedDoubt(null)}
        />
      </main>
    </AppLayout>
  );
}
