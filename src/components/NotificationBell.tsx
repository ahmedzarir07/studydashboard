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
import { useProgressSnapshot } from "@/hooks/useProgressSnapshot";

// Progress-based motivational messages
const getProgressMessage = (percentage: number) => {
  const dayOfWeek = new Date().getDay(); // 0-6, rotates daily
  
  // Messages based on completion percentage ranges
  if (percentage < 20) {
    // Very low progress - urgent push
    const messages = [
      { title: "এখনই শুরু করো", message: "আজ না করলে, কাল আরও কঠিন হবে।" },
      { title: "সময় কমছে", message: "আজ একটু কষ্ট করো, কাল নিজেকে ধন্যবাদ দেবে।" },
      { title: "শুরু করো", message: "অজুহাত না দিয়ে বই খোলো।" },
    ];
    return messages[dayOfWeek % messages.length];
  } else if (percentage < 40) {
    // Low progress - discipline reminder
    const messages = [
      { title: "নিয়মিত থাকো", message: "নিয়মিত চেষ্টা প্রতিভার থেকেও শক্তিশালী।" },
      { title: "রুটিন মানো", message: "ইচ্ছার উপর নির্ভর করো না—নিয়মের উপর করো।" },
      { title: "ধারাবাহিক হও", message: "প্রতিদিনের ছোট অগ্রগতি একদিন বড় সাফল্য বানায়।" },
    ];
    return messages[dayOfWeek % messages.length];
  } else if (percentage < 60) {
    // Medium progress - encouragement
    const messages = [
      { title: "চালিয়ে যাও", message: "থামো না—তুমি ভাবার চেয়েও কাছাকাছি আছো।" },
      { title: "ভালো করছ", message: "প্রতিদিনের ছোট অগ্রগতি একদিন বড় সাফল্য বানায়।" },
      { title: "এগিয়ে যাচ্ছ", message: "তোমার চেষ্টা বৃথা যাবে না।" },
    ];
    return messages[dayOfWeek % messages.length];
  } else if (percentage < 80) {
    // Good progress - validation
    const messages = [
      { title: "দারুণ অগ্রগতি", message: "থামো না—তুমি ভাবার চেয়েও কাছাকাছি আছো।" },
      { title: "তোমার অর্জন", message: "তুমি যতটুকু পেরেছ, সেটাও একটা অর্জন।" },
      { title: "সামনে এগিয়ে যাও", message: "নিয়মিত চেষ্টা প্রতিভার থেকেও শক্তিশালী।" },
    ];
    return messages[dayOfWeek % messages.length];
  } else {
    // High progress - final push
    const messages = [
      { title: "প্রায় শেষ!", message: "আজ একটু কষ্ট করো, কাল নিজেকে ধন্যবাদ দেবে।" },
      { title: "শেষ ধাপে", message: "থামো না—তুমি ভাবার চেয়েও কাছাকাছি আছো।" },
      { title: "সাফল্যের দোরগোড়ায়", message: "প্রতিদিনের ছোট অগ্রগতি একদিন বড় সাফল্য বানায়।" },
    ];
    return messages[dayOfWeek % messages.length];
  }
};

export function NotificationBell() {
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { overallProgress } = useProgressSnapshot();
  
  const todayMessage = getProgressMessage(overallProgress);

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
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">আজকের অনুপ্রেরণা</h4>
            <span className="text-xs text-muted-foreground">{overallProgress}% সম্পন্ন</span>
          </div>
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
