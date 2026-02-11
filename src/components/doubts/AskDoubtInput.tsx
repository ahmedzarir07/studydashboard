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

const SUBJECT_OPTIONS = ALL_SUBJECTS.map(s => ({ id: s.data.id, name: s.displayName }));
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface AskDoubtInputProps {
  onPost: (subject: string, question: string, chapter?: string, imageUrl?: string) => Promise<void>;
}

export function AskDoubtInput({ onPost }: AskDoubtInputProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [question, setQuestion] = useState("");
  const [posting, setPosting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="glass-card p-4 flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">?</AvatarFallback>
        </Avatar>
        <Link
          to="/auth"
          className="flex-1 rounded-full bg-muted/50 border border-border/50 px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/30 transition-colors"
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
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
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
        <div className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-all group">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {user.email?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-full bg-muted/40 border border-border/40 px-4 py-2.5 text-sm text-muted-foreground group-hover:border-primary/30 transition-colors">
            Ask a doubt...
          </div>
          <Button size="sm" variant="ghost" className="text-primary">
            <PenLine className="h-4 w-4" />
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="p-4 pb-3 border-b border-border/30">
          <DialogTitle className="text-base flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" />
            Ask a Doubt
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="bg-muted/30 border-border/40">
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
            className="flex h-10 w-full rounded-md border border-border/40 bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <Textarea
            placeholder="Describe your doubt... *"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="bg-muted/30 border-border/40 min-h-[120px] resize-none"
            maxLength={2000}
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden border border-border/30">
              <img src={imagePreview} alt="Preview" className="w-full max-h-40 object-cover" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7 rounded-full"
                onClick={removeImage}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
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
              className="gap-1.5 text-xs border-border/40"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Add Photo
            </Button>
            <div className="flex-1" />
            <Button
              onClick={handlePost}
              disabled={!subject || !question.trim() || posting}
              className="gap-1.5"
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
