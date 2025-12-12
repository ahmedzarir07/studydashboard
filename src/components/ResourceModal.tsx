import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LinkIcon, Trash2 } from "lucide-react";

interface ResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterName: string;
  subjectId: string;
  existingResource?: { title: string; url: string } | null;
  onSave: (title: string, url: string) => Promise<{ error?: string }>;
  onDelete?: () => void;
}

export const ResourceModal = ({
  open,
  onOpenChange,
  chapterName,
  existingResource,
  onSave,
  onDelete,
}: ResourceModalProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(existingResource?.title || "");
      setUrl(existingResource?.url || "");
    }
  }, [open, existingResource]);

  const validateUrl = (urlString: string) => {
    return urlString.startsWith("http://") || urlString.startsWith("https://");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!url.trim()) {
      toast({ title: "URL is required", variant: "destructive" });
      return;
    }
    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "URL must start with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const result = await onSave(title.trim(), url.trim());
    setSaving(false);

    if (result.error) {
      toast({ title: "Error saving resource", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Resource saved" });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    onDelete?.();
    onOpenChange(false);
    toast({ title: "Resource removed" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            {existingResource ? "Edit Resource" : "Add Resource"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{chapterName}</p>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Lecture Notes PDF"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/resource"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Must start with http:// or https://
            </p>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          {existingResource && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
