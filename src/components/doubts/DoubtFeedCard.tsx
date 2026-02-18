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
      className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-4 space-y-3 hover:border-primary/20 transition-all duration-200 cursor-pointer"
      onClick={() => onOpenAnswers(doubt)}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-primary/10">
          <AvatarFallback className="bg-primary/15 text-primary text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground truncate">{displayName}</span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge
              variant="secondary"
              className="text-[10px] px-2 py-0 bg-primary/10 text-primary border-primary/20 font-medium"
            >
              {subjectMeta?.name || doubt.subject}
            </Badge>
            {doubt.chapter && (
              <span className="text-[10px] text-muted-foreground">· {doubt.chapter}</span>
            )}
          </div>
        </div>
      </div>

      {/* Question Body */}
      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
        {doubt.question}
      </p>

      {/* Image */}
      {doubt.image_url && (
        <img
          src={doubt.image_url}
          alt="Doubt attachment"
          className="rounded-lg max-h-52 object-cover w-full border border-border/20"
        />
      )}

      {/* Engagement Bar */}
      <div className="flex items-center gap-1 pt-1 border-t border-border/20" onClick={e => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-xs gap-1.5 h-8 px-3 rounded-lg",
            doubt.user_liked ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
          )}
          onClick={() => onToggleLike(doubt.id, doubt.user_liked)}
          disabled={!userId}
        >
          <Heart className={cn("h-3.5 w-3.5", doubt.user_liked && "fill-red-500")} />
          {doubt.like_count > 0 && doubt.like_count}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1.5 flex-1 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
          onClick={() => onOpenAnswers(doubt)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {doubt.answer_count} {doubt.answer_count === 1 ? "Answer" : "Answers"}
        </Button>

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
