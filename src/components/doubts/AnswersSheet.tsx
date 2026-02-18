import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Doubt, useDoubtAnswers } from "@/hooks/useDoubts";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, Send, Loader2, Trash2, Flag, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";

const SUBJECT_OPTIONS = ALL_SUBJECTS.map((s) => ({ id: s.data.id, name: s.displayName }));

interface AnswersSheetProps {
  doubt: Doubt | null;
  open: boolean;
  onClose: () => void;
}

export function AnswersSheet({ doubt, open, onClose }: AnswersSheetProps) {
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

  const subjectMeta = SUBJECT_OPTIONS.find((s) => s.id === doubt.subject);
  const displayName = doubt.profile?.display_name || "Anonymous";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 flex flex-col border-t border-border/30">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <SheetHeader className="px-4 pb-3 border-b border-border/20">
          <SheetTitle className="text-sm font-medium text-left flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 px-[160px] py-[12px]">
          {/* Original Question */}
          <div className="bg-muted/30 rounded-xl p-3.5 space-y-2 border border-border/20 px-[120px] py-[50px]">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/15 text-primary text-[10px]">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{displayName}</span>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                {subjectMeta?.name || doubt.subject}
              </Badge>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{doubt.question}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(doubt.created_at), { addSuffix: true })}
            </p>
          </div>

          {/* Answers */}
          {loading &&
          <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          }

          {!loading && answers.length === 0 &&
          <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No answers yet. Be the first!</p>
            </div>
          }

          {answers.
          sort((a, b) => b.vote_count - a.vote_count).
          map((answer) => {
            const aName = answer.profile?.display_name || "Anonymous";
            const isOwn = user?.id === answer.user_id;
            return (
              <div key={answer.id} className="flex gap-3">
                  <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
                    <AvatarFallback className="text-[10px] bg-accent/10 text-accent">
                      {aName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{aName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap break-words">
                      {answer.answer_text}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-xs gap-1 h-7 px-2 rounded-lg",
                        answer.user_voted ? "text-primary bg-primary/10" : "text-muted-foreground"
                      )}
                      onClick={() => user && toggleVote(answer.id, answer.user_voted)}
                      disabled={!user}>

                        <ThumbsUp className={cn("h-3 w-3", answer.user_voted && "fill-primary")} />
                        {answer.vote_count}
                      </Button>
                      {isOwn ?
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive/70 text-[10px] rounded-lg" onClick={() => deleteAnswer(answer.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button> :
                    user &&
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground text-[10px] rounded-lg" onClick={() => reportAnswer(answer.id)}>
                          <Flag className="h-3 w-3" />
                        </Button>
                    }
                    </div>
                  </div>
                </div>);

          })}
        </div>

        {/* Answer Input */}
        {user ?
        <div className="p-3 border-t border-border/20 flex gap-2 bg-background/80 backdrop-blur-sm">
            <Textarea
            placeholder="Write your answer..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="min-h-[44px] max-h-[100px] bg-muted/30 border-border/30 flex-1 resize-none text-sm rounded-xl"
            maxLength={2000} />

            <Button
            size="icon"
            onClick={handlePost}
            disabled={!newAnswer.trim() || posting}
            className="self-end h-[44px] w-[44px] rounded-xl">

              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div> :

        <div className="p-3 border-t border-border/20 text-center bg-background/80">
            <Link to="/auth" className="text-sm text-primary hover:underline">Sign in to answer</Link>
          </div>
        }
      </SheetContent>
    </Sheet>);

}