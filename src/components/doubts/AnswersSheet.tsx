import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Doubt, useDoubtAnswers } from "@/hooks/useDoubts";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, Send, Loader2, Trash2, Flag, Clock, MessageSquare, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SUBJECT_OPTIONS = ALL_SUBJECTS.map((s) => ({ id: s.data.id, name: s.displayName }));

interface AnswersSheetProps {
  doubt: Doubt | null;
  open: boolean;
  onClose: () => void;
}

export function AnswersSheet({ doubt, open, onClose }: AnswersSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { answers, loading, postAnswer, toggleVote, deleteAnswer, reportAnswer } = useDoubtAnswers(doubt?.id || null);
  const [newAnswer, setNewAnswer] = useState("");
  const [posting, setPosting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Only images allowed", variant: "destructive" });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const path = `answers/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-attachments").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("chat-attachments").getPublicUrl(path);
    return data.publicUrl;
  };

  const handlePost = async () => {
    if (!newAnswer.trim() && !imageFile) return;
    setPosting(true);
    let imageUrl: string | undefined;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) imageUrl = url;
    }
    await postAnswer(newAnswer.trim(), imageUrl);
    setNewAnswer("");
    removeImage();
    setPosting(false);
  };

  if (!doubt) return null;

  const subjectMeta = SUBJECT_OPTIONS.find((s) => s.id === doubt.subject);
  const displayName = doubt.profile?.display_name || "Anonymous";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 flex flex-col border-t border-border/30 bg-background">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        <SheetHeader className="px-4 pb-3 border-b border-border/15">
          <SheetTitle className="text-sm font-semibold text-left flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
            </div>
            {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 px-4 py-3">
          {/* Original Question */}
          <div className="rounded-xl p-4 space-y-2.5 bg-muted/20 border border-border/20">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 ring-1 ring-primary/15">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary text-[10px] font-semibold">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold block">{displayName}</span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 rounded-md">
                    {subjectMeta?.name || doubt.subject}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDistanceToNow(new Date(doubt.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[13px] text-foreground/90 leading-relaxed">{doubt.question}</p>
            {doubt.image_url && (
              <div className="rounded-xl overflow-hidden border border-border/20">
                <img src={doubt.image_url} alt="Attachment" className="max-h-44 object-cover w-full" />
              </div>
            )}
          </div>

          {/* Answers */}
          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}

          {!loading && answers.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-muted/30 border border-border/20 flex items-center justify-center mx-auto">
                <MessageSquare className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">No answers yet. Be the first!</p>
            </div>
          )}

          {answers
            .sort((a, b) => b.vote_count - a.vote_count)
            .map((answer) => {
              const aName = answer.profile?.display_name || "Anonymous";
              const isOwn = user?.id === answer.user_id;
              return (
                <div key={answer.id} className="flex gap-3 group/answer">
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5 ring-1 ring-border/30">
                    <AvatarFallback className="text-[10px] bg-muted/50 text-muted-foreground font-medium">
                      {aName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{aName}</span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[13px] text-foreground/85 leading-relaxed whitespace-pre-wrap break-words">
                      {answer.answer_text}
                    </p>
                    {answer.image_url && (
                      <div className="rounded-xl overflow-hidden border border-border/20">
                        <img
                          src={answer.image_url}
                          alt="Answer attachment"
                          className="max-h-44 object-cover w-full"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "text-xs gap-1 h-7 px-2.5 rounded-lg transition-all",
                          answer.user_voted ? "text-primary bg-primary/10" : "text-muted-foreground/60 hover:text-primary"
                        )}
                        onClick={() => user && toggleVote(answer.id, answer.user_voted)}
                        disabled={!user}
                      >
                        <ThumbsUp className={cn("h-3 w-3", answer.user_voted && "fill-primary")} />
                        <span className="font-medium">{answer.vote_count}</span>
                      </Button>
                      {isOwn ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-muted-foreground/40 hover:text-destructive text-[10px] rounded-lg opacity-0 group-hover/answer:opacity-100 transition-opacity"
                          onClick={() => deleteAnswer(answer.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      ) : (
                        user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-muted-foreground/40 hover:text-warning text-[10px] rounded-lg opacity-0 group-hover/answer:opacity-100 transition-opacity"
                            onClick={() => reportAnswer(answer.id)}
                          >
                            <Flag className="h-3 w-3" />
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Answer Input */}
        {user ? (
          <div className="p-3 border-t border-border/15 bg-card/80 backdrop-blur-sm space-y-2">
            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden border border-border/30 mx-1">
                <img src={imagePreview} alt="Preview" className="w-full max-h-28 object-cover" />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full shadow-lg"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
              <Textarea
                placeholder="Write your answer..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="min-h-[42px] max-h-[100px] bg-muted/30 border-border/30 flex-1 resize-none text-sm rounded-xl"
                maxLength={2000}
              />
              <Button
                size="icon"
                onClick={handlePost}
                disabled={(!newAnswer.trim() && !imageFile) || posting}
                className="self-end h-10 w-10 rounded-xl flex-shrink-0"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-border/15 text-center bg-card/80">
            <Link to="/auth" className="text-sm text-primary hover:underline font-medium">Sign in to answer</Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
