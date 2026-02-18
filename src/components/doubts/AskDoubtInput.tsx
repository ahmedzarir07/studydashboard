import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, PenLine, ImagePlus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SUBJECT_OPTIONS = ALL_SUBJECTS.map(s => ({ id: s.data.id, name: s.displayName, chapters: s.data.chapters.map(c => c.name) }));

interface AskDoubtInputProps {
  onPost: (subject: string, question: string, chapter?: string, imageUrl?: string) => Promise<void>;
}

export function AskDoubtInput({ onPost }: AskDoubtInputProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const selectedSubjectChapters = SUBJECT_OPTIONS.find(s => s.id === subject)?.chapters || [];
  const [question, setQuestion] = useState("");
  const [posting, setPosting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="glass-card p-3.5 flex items-center gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-border/30 ring-offset-2 ring-offset-background">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">?</AvatarFallback>
        </Avatar>
        <Link
          to="/auth"
          className="flex-1 rounded-xl bg-muted/40 border border-border/40 px-4 py-3 text-sm text-muted-foreground hover:border-primary/30 hover:bg-muted/60 transition-all"
        >
          Sign in to ask a doubt...
        </Link>
      </div>
    );
  }

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
    const ext = file.name.split(".").pop();
    const path = `doubts/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-attachments").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("chat-attachments").getPublicUrl(path);
    return data.publicUrl;
  };

  const handlePost = async () => {
    if (!subject || !question.trim()) return;
    setPosting(true);
    let imageUrl: string | undefined;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) imageUrl = url;
    }
    await onPost(subject, question.trim(), chapter.trim() || undefined, imageUrl);
    setSubject("");
    setChapter("");
    setQuestion("");
    removeImage();
    setPosting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="glass-card p-3.5 flex items-center gap-3 cursor-pointer hover:border-primary/40 transition-all group active:scale-[0.99]">
          <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/15 ring-offset-2 ring-offset-background">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary text-xs font-semibold">
              {user.email?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-xl bg-muted/30 border border-border/30 px-4 py-2.5 text-sm text-muted-foreground group-hover:border-primary/20 group-hover:bg-muted/40 transition-all">
            Ask a doubt...
          </div>
          <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 rounded-xl h-9 w-9 p-0">
            <PenLine className="h-4 w-4" />
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md gap-0 p-0 border-border/30 bg-card">
        <DialogHeader className="p-4 pb-3 border-b border-border/20">
          <DialogTitle className="text-base flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <PenLine className="h-4 w-4 text-primary" />
            </div>
            Ask a Doubt
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <Select value={subject} onValueChange={v => { setSubject(v); setChapter(""); }}>
            <SelectTrigger className="bg-muted/30 border-border/30 rounded-xl">
              <SelectValue placeholder="Select Subject *" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={chapter} onValueChange={setChapter} disabled={!subject}>
            <SelectTrigger className="bg-muted/30 border-border/30 rounded-xl">
              <SelectValue placeholder={subject ? "Select Chapter (optional)" : "Select subject first"} />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {selectedSubjectChapters.map(ch => (
                <SelectItem key={ch} value={ch} className="text-xs">{ch}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Describe your doubt in detail... *"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="bg-muted/30 border-border/30 min-h-[120px] resize-none rounded-xl"
            maxLength={2000}
          />

          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-border/30">
              <img src={imagePreview} alt="Preview" className="w-full max-h-40 object-cover" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg"
                onClick={removeImage}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-border/30 rounded-xl hover:bg-muted/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Add Photo
            </Button>
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground/50">{question.length}/2000</span>
            <Button
              onClick={handlePost}
              disabled={!subject || !question.trim() || posting}
              className="gap-1.5 rounded-xl px-5"
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
