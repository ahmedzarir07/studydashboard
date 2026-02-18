import { Doubt } from "@/hooks/useDoubts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Trash2, Flag, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";
import { cn } from "@/lib/utils";

const SUBJECT_OPTIONS = ALL_SUBJECTS.map(s => ({ id: s.data.id, name: s.displayName }));

interface DoubtFeedCardProps {
  doubt: Doubt;
  userId?: string;
  onOpenAnswers: (d: Doubt) => void;
  onDelete: (id: string) => void;
  onReport: (id: string) => void;
  onToggleLike: (id: string, currentlyLiked: boolean) => void;
}

export function DoubtFeedCard({ doubt, userId, onOpenAnswers, onDelete, onReport, onToggleLike }: DoubtFeedCardProps) {
  const subjectMeta = SUBJECT_OPTIONS.find(s => s.id === doubt.subject);
  const displayName = doubt.profile?.display_name || "Anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(doubt.created_at), { addSuffix: true });
  const isOwn = userId === doubt.user_id;

  return (
    <article
      className="glass-card p-0 overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer group"
      onClick={() => onOpenAnswers(doubt)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/15 ring-offset-2 ring-offset-background">
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground truncate">{displayName}</span>
            <span className="text-[10px] text-muted-foreground/70 flex items-center gap-0.5 flex-shrink-0">
              <Clock className="h-2.5 w-2.5" />
              {timeAgo}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge
              variant="secondary"
              className="text-[10px] px-2 py-0 h-[18px] bg-primary/10 text-primary border-primary/20 font-medium rounded-md"
            >
              {subjectMeta?.name || doubt.subject}
            </Badge>
            {doubt.chapter && (
              <span className="text-[10px] text-muted-foreground/60 truncate max-w-[150px]">· {doubt.chapter}</span>
            )}
          </div>
        </div>
      </div>

      {/* Question Body */}
      <div className="px-4 py-2">
        <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap break-words line-clamp-4">
          {doubt.question}
        </p>
      </div>

      {/* Image */}
      {doubt.image_url && (
        <div className="px-4 pb-2">
          <div className="rounded-xl overflow-hidden border border-border/20">
            <img
              src={doubt.image_url}
              alt="Doubt attachment"
              className="max-h-56 object-cover w-full"
            />
          </div>
        </div>
      )}

      {/* Engagement Bar */}
      <div
        className="flex items-center px-2 py-1.5 mx-3 mb-3 rounded-xl bg-muted/30 border border-border/15"
        onClick={e => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-xs gap-1.5 h-8 px-3 rounded-lg transition-all",
            doubt.user_liked
              ? "text-destructive bg-destructive/10 hover:bg-destructive/15 hover:text-destructive"
              : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          )}
          onClick={() => onToggleLike(doubt.id, doubt.user_liked)}
          disabled={!userId}
        >
          <Heart className={cn("h-3.5 w-3.5 transition-all", doubt.user_liked && "fill-current scale-110")} />
          {doubt.like_count > 0 && <span className="font-medium">{doubt.like_count}</span>}
        </Button>

        <div className="w-px h-4 bg-border/30 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1.5 flex-1 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
          onClick={() => onOpenAnswers(doubt)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="font-medium">{doubt.answer_count}</span>
          <span className="hidden sm:inline">{doubt.answer_count === 1 ? "Answer" : "Answers"}</span>
        </Button>

        <div className="w-px h-4 bg-border/30 mx-1" />

        {isOwn ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
            onClick={() => onDelete(doubt.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-warning hover:bg-warning/10 rounded-lg"
            onClick={() => onReport(doubt.id)}
          >
            <Flag className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </article>
  );
}
