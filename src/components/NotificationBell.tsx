import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Daily motivational messages that rotate
const dailyMessages = [
  { title: "আজকের অনুপ্রেরণা", message: "আজ ১ ঘণ্টা পড়লে কাল ১ ঘণ্টা এগিয়ে থাকবে।" },
  { title: "পড়াশোনার সময়", message: "সিলেবাস নিজে নিজে শেষ হবে না—তোমাকেই করতে হবে।" },
  { title: "ছোট পদক্ষেপ", message: "প্রতিদিন ছোট ছোট পদক্ষেপই বড় ফলাফল আনে।" },
  { title: "সময়ের মূল্য", message: "বাকি সময় কম—এখনই শুরু করো।" },
  { title: "শুরু করো", message: "অজুহাত না দিয়ে বই খোলো।" },
  { title: "তোমার অর্জন", message: "তুমি যতটুকু পেরেছ, সেটাও একটা অর্জন।" },
  { title: "থামবে না", message: "ধীরে হলেও এগিয়ে যাচ্ছ—থামবে না।" },
  { title: "লক্ষ্যের দিকে", message: "প্রতিটা পৃষ্ঠা তোমাকে লক্ষ্যের কাছে নিয়ে যাচ্ছে।" },
  { title: "চালিয়ে যাও", message: "কঠিন লাগলেও চালিয়ে যাও—ফল পাবে।" },
  { title: "চেষ্টা", message: "তোমার চেষ্টা বৃথা যাবে না।" },
  { title: "রুটিন", message: "রুটিন মানো—মন না চাইলেও পড়ো।" },
  { title: "ফোকাস", message: "মোবাইল দূরে রাখো, বই কাছে রাখো।" },
  { title: "নিয়ম", message: "ইচ্ছার উপর নির্ভর করো না—নিয়মের উপর করো।" },
  { title: "উন্নতি", message: "গতকালের চেয়ে আজ একটু বেশি পড়ো।" },
  { title: "ধারাবাহিকতা", message: "প্রতিদিন ১% উন্নতি = মাসে ৩০% উন্নতি।" },
];

const getTodayMessage = () => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return dailyMessages[dayOfYear % dailyMessages.length];
};

export function NotificationBell() {
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const todayMessage = getTodayMessage();

  // Check if we should show notification on app open
  useEffect(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('daily-motivation-shown');
    const notificationsEnabled = localStorage.getItem('study-coach-reminder-enabled') === 'true';

    if (notificationsEnabled && lastShown !== today) {
      // Mark notification as new
      setHasNewNotification(true);
      
      // Show toast notification after a short delay
      const timer = setTimeout(() => {
        toast({
          title: `🔔 ${todayMessage.title}`,
          description: todayMessage.message,
          duration: 6000,
        });
        localStorage.setItem('daily-motivation-shown', today);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [toast, todayMessage]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setHasNewNotification(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {hasNewNotification && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">আজকের অনুপ্রেরণা</h4>
          <div className={cn(
            "p-3 rounded-lg bg-primary/5 border border-primary/20"
          )}>
            <p className="text-sm font-medium text-primary mb-1">{todayMessage.title}</p>
            <p className="text-sm text-muted-foreground">{todayMessage.message}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 AI Analysis পেজে Study Coach থেকে নোটিফিকেশন চালু/বন্ধ করতে পারবে।
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
