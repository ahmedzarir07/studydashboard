import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyCoachSettings } from "@/hooks/useStudyCoachSettings";
import { useProgressSnapshot } from "@/hooks/useProgressSnapshot";
import { supabase } from "@/integrations/supabase/client";
import { 
  GraduationCap, 
  Calendar, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Lightbulb,
  Flame,
  Bell,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "batch" | "months" | "completion" | "result";
type RiskLevel = "safe" | "slightly_behind" | "high_risk";

interface CoachResult {
  safePercentage: number;
  riskLevel: RiskLevel;
  motivationalMessages: string[];
  todayActions: string[];
  isAIGenerated?: boolean;
}

// Daily rotation of message tones
const getTodayTone = (): string => {
  const tones = ["reality", "encouragement", "discipline", "progress", "urgency"];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return tones[dayOfYear % tones.length];
};

// Time-based greeting
const getTimeOfDay = (): "morning" | "afternoon" | "evening" | "night" => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

const getMotivationalMessages = (monthsRemaining: number, riskLevel: RiskLevel, tone: string): string[] => {
  const urgencyFactor = monthsRemaining <= 3 ? "high" : monthsRemaining <= 6 ? "medium" : "low";
  const timeOfDay = getTimeOfDay();
  
  const timeGreetings: Record<string, string> = {
    morning: "সকালের পড়া সারাদিনের ভিত্তি—এখনই শুরু করো।",
    afternoon: "দুপুরের ক্লান্তি কাটাও, কিছুটা পড়ে নাও।",
    evening: "সন্ধ্যায় রিভিশন দাও—মস্তিষ্ক তখন তীক্ষ্ণ থাকে।",
    night: "রাতে গুছিয়ে পড়ো, কালকের প্ল্যান করো।"
  };
  
  const messages: Record<string, string[]> = {
    reality: [
      "আজ ১ ঘণ্টা পড়লে কাল ১ ঘণ্টা এগিয়ে থাকবে।",
      "সিলেবাস নিজে নিজে শেষ হবে না—তোমাকেই করতে হবে।",
      "প্রতিদিন ছোট ছোট পদক্ষেপই বড় ফলাফল আনে।",
      "বাকি সময় কম—এখনই শুরু করো।",
      "অজুহাত না দিয়ে বই খোলো।",
      "যা আজ পড়বে না, তা জমতে থাকবে।",
      "প্রতিদিন ২ ঘণ্টা পড়লে মাসে ৬০ ঘণ্টা হয়।",
      timeGreetings[timeOfDay]
    ],
    encouragement: [
      "তুমি যতটুকু পেরেছ, সেটাও একটা অর্জন।",
      "ধীরে হলেও এগিয়ে যাচ্ছ—থামবে না।",
      "প্রতিটা পৃষ্ঠা তোমাকে লক্ষ্যের কাছে নিয়ে যাচ্ছে।",
      "কঠিন লাগলেও চালিয়ে যাও—ফল পাবে।",
      "তোমার চেষ্টা বৃথা যাবে না।",
      "প্রতিটা দিন একটা নতুন সুযোগ।",
      "তুমি পারবে, শুধু লেগে থাকো।",
      "ছোট ছোট জয় উদযাপন করো।"
    ],
    discipline: [
      "রুটিন মানো—মন না চাইলেও পড়ো।",
      "মোবাইল দূরে রাখো, বই কাছে রাখো।",
      "প্রতিদিন নির্দিষ্ট সময় পড়ার অভ্যাস করো।",
      "ইচ্ছার উপর নির্ভর করো না—নিয়মের উপর করো।",
      "আজ ফাঁকি দিলে কাল আরও কঠিন হবে।",
      "৫০ মিনিট পড়ো, ১০ মিনিট বিশ্রাম নাও।",
      "পড়ার আগে টেবিল গুছিয়ে বসো।",
      "একবারে একটা বিষয়ে মনোযোগ দাও।"
    ],
    progress: [
      "গতকালের চেয়ে আজ একটু বেশি পড়ো।",
      "ছোট উন্নতিও উন্নতি—এগিয়ে যাও।",
      "প্রতিদিন ১% উন্নতি = মাসে ৩০% উন্নতি।",
      "যা পড়েছ তা রিভিশন দাও, নতুন কিছু যোগ করো।",
      "ধারাবাহিকতাই সাফল্যের চাবিকাঠি।",
      "গতকাল যা কঠিন ছিল, আজ তা সহজ হবে।",
      "প্রতিটা অধ্যায় শেষ করা একটা মাইলফলক।",
      "নিজের সাথে প্রতিযোগিতা করো।"
    ],
    urgency: [
      urgencyFactor === "high" ? "সময় প্রায় শেষ—প্রতিটা মুহূর্ত গুরুত্বপূর্ণ!" : "সময় আছে, কিন্তু অপচয় করো না।",
      "আজ যা পড়বে না, পরীক্ষায় তা আসতে পারে।",
      "প্রতিদিন গুনে গুনে পড়ো—সময় চলে যাচ্ছে।",
      urgencyFactor === "high" ? "এখন পড়াই একমাত্র কাজ!" : "অগ্রাধিকার ঠিক রাখো।",
      "পরে পড়ব বললে পরে আর সময় থাকবে না।",
      "প্রতিটা দিন গণনা করো।",
      urgencyFactor === "high" ? "ফাইনাল স্প্রিন্টে আছ—সব দিয়ে দাও!" : "এখন থেকে প্রস্তুতি নাও।",
      "সময় তোমার জন্য অপেক্ষা করবে না।"
    ]
  };
  
  // Add risk-specific messages
  if (riskLevel === "high_risk") {
    messages[tone] = [
      ...messages[tone],
      "ঝুঁকিতে আছ—এখনই গতি বাড়াও।",
      "প্রতিদিন অন্তত ৩-৪ ঘণ্টা পড়া জরুরি।",
      "দুর্বল বিষয়গুলোতে বেশি সময় দাও।"
    ];
  } else if (riskLevel === "slightly_behind") {
    messages[tone] = [
      ...messages[tone],
      "একটু বেশি পড়লেই ধরে ফেলতে পারবে।",
      "প্রতিদিন ৩০ মিনিট বাড়তি পড়ো।"
    ];
  }
  
  return messages[tone] || messages.encouragement;
};

const getTodayActions = (completion: number, monthsRemaining: number, batch: string): string[] => {
  const actions: string[] = [];
  const timeOfDay = getTimeOfDay();
  
  // Time-specific suggestions
  const timeActions: Record<string, string> = {
    morning: "সকালে কঠিন বিষয় পড়ো—মস্তিষ্ক তখন সবচেয়ে সক্রিয়।",
    afternoon: "দুপুরে হালকা টপিক রিভিশন দাও বা নোট গুছাও।",
    evening: "সন্ধ্যায় MCQ/CQ প্র্যাকটিস করো।",
    night: "রাতে আজকের পড়া রিভিউ করো ও কাল কী পড়বে ঠিক করো।"
  };
  
  if (completion < 20) {
    actions.push("আজ যেকোনো ১টি নতুন অধ্যায় শুরু করো এবং মূল ধারণাগুলো বুঝে নাও।");
    actions.push("প্রতিদিন কমপক্ষে ২-৩ ঘণ্টা পড়ার রুটিন তৈরি করো।");
    actions.push("ক্লাস লেকচার ও বেসিক কনসেপ্ট ক্লিয়ার করায় ফোকাস করো।");
  } else if (completion < 40) {
    actions.push("দুর্বল বিষয়ে আজ ১ ঘণ্টা অতিরিক্ত সময় দাও।");
    actions.push("আজ অন্তত ১টি অধ্যায়ের সমস্যা সমাধান প্র্যাকটিস করো।");
    actions.push("যেসব টপিক পড়েছ সেগুলোর ছোট রিভিশন দাও।");
  } else if (completion < 60) {
    actions.push("পুরোনো অধ্যায়গুলো রিভিশন দিতে শুরু করো।");
    actions.push("প্রতিদিন ১ ঘণ্টা MCQ প্র্যাকটিস করো।");
    actions.push("নতুন অধ্যায় পড়ার পাশাপাশি আগের টপিক রিভাইজ করো।");
  } else if (completion < 80) {
    actions.push("প্রতিদিন ১টি সৃজনশীল প্রশ্ন লেখার অভ্যাস করো।");
    actions.push("দুর্বল টপিকগুলোতে বেশি সময় দিয়ে সেগুলো শক্তিশালী করো।");
    actions.push("বিগত বছরের প্রশ্ন দেখে প্রশ্নের প্যাটার্ন বুঝো।");
  } else {
    actions.push("মডেল টেস্ট দেওয়া শুরু করো।");
    actions.push("দুর্বল টপিকগুলো চিহ্নিত করে সেগুলোতে ফোকাস করো।");
    actions.push("সময় ধরে পরীক্ষা দেওয়ার অভ্যাস করো।");
  }
  
  if (monthsRemaining <= 3) {
    actions.push("বিগত বছরের প্রশ্ন সলভ করা শুরু করো—এটা অত্যন্ত জরুরি।");
  } else if (monthsRemaining <= 6) {
    actions.push("সপ্তাহে অন্তত ১টি পূর্ণাঙ্গ মডেল টেস্ট দাও।");
  }
  
  // Add time-specific action
  actions.push(timeActions[timeOfDay]);
  
  return actions.slice(0, 3);
};

export function StudyCoach() {
  const { user } = useAuth();
  const { settings, saveSettings, updateNotificationSettings } = useStudyCoachSettings();
  const progressSnapshot = useProgressSnapshot();
  
  const [step, setStep] = useState<Step>("batch");
  const [batch, setBatch] = useState<"2026" | "2027" | null>(null);
  const [monthsRemaining, setMonthsRemaining] = useState<number>(12);
  const [completion, setCompletion] = useState<number>(30);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [lastShownDate, setLastShownDate] = useState<string | null>(null);

  // Auto-set completion from overall progress
  useEffect(() => {
    if (!progressSnapshot.loading && progressSnapshot.overallProgress > 0 && !settings) {
      setCompletion(progressSnapshot.overallProgress);
    }
  }, [progressSnapshot.loading, progressSnapshot.overallProgress, settings]);

  // Load saved settings when available
  useEffect(() => {
    if (settings) {
      setBatch(settings.batch as "2026" | "2027");
      setMonthsRemaining(settings.months_remaining);
      // Always use live overall progress instead of saved static value
      if (!progressSnapshot.loading) {
        setCompletion(progressSnapshot.overallProgress);
      } else {
        setCompletion(settings.completion_percentage);
      }
      setIsNotificationEnabled(settings.notifications_enabled);
      
      // If we have saved settings, show the result
      if (settings.risk_level) {
        const currentCompletion = !progressSnapshot.loading ? progressSnapshot.overallProgress : settings.completion_percentage;
        const tone = getTodayTone();
        const motivationalMessages = getMotivationalMessages(settings.months_remaining, settings.risk_level as RiskLevel, tone);
        const todayActions = getTodayActions(currentCompletion, settings.months_remaining, settings.batch);
        
        let safePercentage: number;
        if (settings.batch === "2027") {
          safePercentage = Math.min(80, Math.round((24 - settings.months_remaining) * 3));
        } else {
          safePercentage = Math.min(90, Math.round((12 - settings.months_remaining) * 7));
        }
        safePercentage = Math.max(0, safePercentage);

        // Recalculate risk level based on live progress
        let riskLevel: RiskLevel;
        if (currentCompletion >= safePercentage) {
          riskLevel = "safe";
        } else if (currentCompletion >= safePercentage - 10) {
          riskLevel = "slightly_behind";
        } else {
          riskLevel = "high_risk";
        }
        
        setResult({
          safePercentage,
          riskLevel,
          motivationalMessages: getMotivationalMessages(settings.months_remaining, riskLevel, tone),
          todayActions: getTodayActions(currentCompletion, settings.months_remaining, settings.batch),
        });
        setStep("result");
        
        fetchAIContent(currentCompletion, settings.months_remaining, settings.batch, riskLevel);
      }
    }
  }, [settings, user?.email, progressSnapshot.loading, progressSnapshot.overallProgress]);

  const fetchAIContent = async (comp: number, months: number, userBatch: string, risk: RiskLevel) => {
    if (!user) return; // Only fetch AI for logged-in users
    
    setIsLoadingAI(true);
    try {
      const tone = getTodayTone();
      const { data, error } = await supabase.functions.invoke('study-coach-ai', {
        body: {
          completion: comp,
          monthsRemaining: months,
          batch: userBatch,
          riskLevel: risk,
          tone,
          progressData: progressSnapshot && !progressSnapshot.loading ? {
            overallProgress: progressSnapshot.overallProgress,
            subjects: progressSnapshot.subjects
          } : null
        }
      });
      
      if (error) throw error;
      
      if (data && !data.error && data.todayActions?.length > 0) {
        setResult(prev => prev ? {
          ...prev,
          todayActions: data.todayActions,
          motivationalMessages: data.motivationalMessages,
          isAIGenerated: true
        } : null);
      }
    } catch (error) {
      console.error("Failed to fetch AI content:", error);
      // Keep static content as fallback
    } finally {
      setIsLoadingAI(false);
    }
  };

  const calculateResult = () => {
    if (!batch) return;
    
    setIsCalculating(true);
    
    // Simulate calculation delay for UX
    setTimeout(async () => {
      let safePercentage: number;
      
      if (batch === "2027") {
        safePercentage = Math.min(80, Math.round((24 - monthsRemaining) * 3));
      } else {
        safePercentage = Math.min(90, Math.round((12 - monthsRemaining) * 7));
      }
      
      // Ensure safe percentage is at least 0
      safePercentage = Math.max(0, safePercentage);
      
      let riskLevel: RiskLevel;
      if (completion >= safePercentage) {
        riskLevel = "safe";
      } else if (completion >= safePercentage - 10) {
        riskLevel = "slightly_behind";
      } else {
        riskLevel = "high_risk";
      }
      
      const tone = getTodayTone();
      const motivationalMessages = getMotivationalMessages(monthsRemaining, riskLevel, tone);
      const todayActions = getTodayActions(completion, monthsRemaining, batch);
      
      setResult({
        safePercentage,
        riskLevel,
        motivationalMessages,
        todayActions
      });
      
      // Save settings if user is logged in
      if (user) {
        saveSettings.mutate({
          batch,
          months_remaining: monthsRemaining,
          completion_percentage: completion,
          risk_level: riskLevel,
          notifications_enabled: isNotificationEnabled,
        });
        
        // Fetch AI content
        fetchAIContent(completion, monthsRemaining, batch, riskLevel);
      }
      
      setStep("result");
      setIsCalculating(false);
    }, 500);
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setIsNotificationEnabled(enabled);
    if (user && settings) {
      updateNotificationSettings.mutate({
        enabled,
      });
    }
    // Store in localStorage for in-app reminder check
    if (enabled) {
      localStorage.setItem('study-coach-reminder-enabled', 'true');
    } else {
      localStorage.removeItem('study-coach-reminder-enabled');
    }
  };

  // Check if we should show daily reminder notification
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('study-coach-last-shown');
    const reminderEnabled = localStorage.getItem('study-coach-reminder-enabled') === 'true';
    
    if (reminderEnabled && storedDate !== today && result) {
      setLastShownDate(today);
      localStorage.setItem('study-coach-last-shown', today);
    }
  }, [result]);

  const resetCoach = () => {
    setStep("batch");
    setBatch(null);
    setMonthsRemaining(12);
    setCompletion(30);
    setResult(null);
  };

  const getRiskConfig = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case "safe":
        return {
          icon: CheckCircle2,
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/40",
          glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
          label: "নিরাপদ অবস্থানে",
          description: "তুমি সঠিক পথে আছ। এই গতি বজায় রাখো।"
        };
      case "slightly_behind":
        return {
          icon: AlertCircle,
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/40",
          glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
          label: "সামান্য পিছিয়ে",
          description: "একটু বেশি গতিতে পড়লে ধরে ফেলতে পারবে।"
        };
      case "high_risk":
        return {
          icon: AlertTriangle,
          color: "text-rose-400",
          bgColor: "bg-rose-500/10",
          borderColor: "border-rose-500/40",
          glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.3)]",
          label: "ঝুঁকিপূর্ণ অবস্থানে",
          description: "এখনই গতি বাড়াতে হবে। প্রতিদিন বেশি সময় দেওয়া জরুরি।"
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Step 1: Batch Selection */}
      {step === "batch" && (
        <Card className="glass-card neon-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg neon-glow">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold gradient-text">তুমি কোন ব্যাচের?</h3>
              <p className="text-sm text-muted-foreground">তোমার HSC পরীক্ষার বছর বেছে নাও</p>
            </div>
          </div>
          
          <RadioGroup
            value={batch || ""}
            onValueChange={(v) => setBatch(v as "2026" | "2027")}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <RadioGroupItem value="2026" id="batch-2026" className="peer sr-only" />
              <Label
                htmlFor="batch-2026"
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all",
                  "border-border/50 bg-background/30 backdrop-blur-sm",
                  "hover:bg-primary/5 hover:border-primary/30",
                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10",
                  "peer-data-[state=checked]:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                )}
              >
                <span className="text-2xl font-bold gradient-text">HSC 2026</span>
                <span className="text-sm text-muted-foreground">দ্বিতীয় বর্ষ</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="2027" id="batch-2027" className="peer sr-only" />
              <Label
                htmlFor="batch-2027"
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all",
                  "border-border/50 bg-background/30 backdrop-blur-sm",
                  "hover:bg-primary/5 hover:border-primary/30",
                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10",
                  "peer-data-[state=checked]:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                )}
              >
                <span className="text-2xl font-bold gradient-text">HSC 2027</span>
                <span className="text-sm text-muted-foreground">প্রথম বর্ষ</span>
              </Label>
            </div>
          </RadioGroup>
          
          <Button 
            onClick={() => setStep("months")} 
            disabled={!batch}
            className="w-full glow-button"
          >
            পরবর্তী
          </Button>
        </Card>
      )}

      {/* Step 2: Months Remaining */}
      {step === "months" && (
        <Card className="glass-card neon-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg neon-glow">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold gradient-text">পরীক্ষায় কত মাস বাকি?</h3>
              <p className="text-sm text-muted-foreground">আনুমানিক হিসাব দাও</p>
            </div>
          </div>
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <span className="text-4xl font-bold gradient-text">{monthsRemaining}</span>
              <span className="text-xl text-muted-foreground ml-2">মাস</span>
            </div>
            
            <Slider
              value={[monthsRemaining]}
              onValueChange={([v]) => setMonthsRemaining(v)}
              min={1}
              max={batch === "2027" ? 24 : 12}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>১ মাস</span>
              <span>{batch === "2027" ? "২৪" : "১২"} মাস</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("batch")} className="flex-1">
              পেছনে
            </Button>
            <Button onClick={() => setStep("completion")} className="flex-1 glow-button">
              পরবর্তী
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Completion Percentage */}
      {step === "completion" && (
        <Card className="glass-card neon-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg neon-glow">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold gradient-text">সিলেবাস কতটুকু শেষ?</h3>
              <p className="text-sm text-muted-foreground">তোমার ট্র্যাকার থেকে স্বয়ংক্রিয়ভাবে নেওয়া হয়েছে</p>
            </div>
          </div>

          {/* Auto-populated notice */}
          {!progressSnapshot.loading && progressSnapshot.overallProgress > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-xs text-primary">
                তোমার ট্র্যাকার অনুযায়ী Overall Progress: <span className="font-bold">{progressSnapshot.overallProgress}%</span>
              </p>
            </div>
          )}
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <span className="text-4xl font-bold gradient-text">{completion}</span>
              <span className="text-xl text-muted-foreground">%</span>
            </div>
            
            <Slider
              value={[completion]}
              onValueChange={([v]) => setCompletion(v)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>০%</span>
              <span>১০০%</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("months")} className="flex-1">
              পেছনে
            </Button>
            <Button onClick={calculateResult} disabled={isCalculating} className="flex-1 glow-button">
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  বিশ্লেষণ হচ্ছে...
                </>
              ) : (
                "বিশ্লেষণ দেখো"
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Result */}
      {step === "result" && result && (
        <div className="space-y-4">
          {/* Risk Assessment Card */}
          {(() => {
            const config = getRiskConfig(result.riskLevel);
            const Icon = config.icon;
            return (
              <Card className={cn(
                "glass-card p-5 border-2 relative overflow-hidden",
                config.borderColor, 
                config.glowColor
              )}>
                {/* Background glow effect */}
                <div className={cn(
                  "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30",
                  result.riskLevel === "safe" ? "bg-emerald-500" : 
                  result.riskLevel === "slightly_behind" ? "bg-amber-500" : "bg-rose-500"
                )} />
                
                <div className="relative flex items-start gap-4">
                  <div className={cn("p-3 rounded-full", config.bgColor)}>
                    <Icon className={cn("h-6 w-6", config.color)} />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn("text-lg font-bold", config.color)}>{config.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                  </div>
                </div>
                
                <div className="relative mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-background/30 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground">তোমার অগ্রগতি</p>
                    <p className="text-2xl font-bold gradient-text">{completion}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/30 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground">এই সময়ে থাকা উচিত</p>
                    <p className="text-2xl font-bold text-muted-foreground">{result.safePercentage}%</p>
                  </div>
                </div>
                
                {result.riskLevel !== "safe" && (
                  <div className="relative mt-4 pt-4 border-t border-border/30">
                    <p className="text-sm">
                      <span className="font-medium">পার্থক্য: </span>
                      <span className={config.color}>
                        {result.safePercentage - completion}% পিছিয়ে
                      </span>
                    </p>
                  </div>
                )}
              </Card>
            );
          })()}

          {/* Today's Actions */}
          <Card className="glass-card neon-border p-5 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl" />
            
            <div className="relative flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Flame className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-cyan-300">আজকের জন্য পরামর্শ</h3>
              </div>
              {isLoadingAI && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>AI...</span>
                </div>
              )}
              {result.isAIGenerated && !isLoadingAI && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span className="text-[10px] text-cyan-300 font-medium">AI</span>
                </div>
              )}
            </div>
            <div className="relative space-y-3">
              {result.todayActions.map((action, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex gap-3 p-3 rounded-lg transition-all duration-300",
                    "bg-gradient-to-r from-cyan-500/10 to-transparent",
                    "border border-cyan-500/20 hover:border-cyan-500/40",
                    "hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="font-bold text-cyan-400 text-lg">{index + 1}.</span>
                  <p className="text-sm text-foreground/90">{action}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Motivational Messages */}
          <Card className="glass-card neon-border p-5 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-xl" />
            
            <div className="relative flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse">
                <Lightbulb className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-300">আজকের অনুপ্রেরণা</h3>
              </div>
              {result.isAIGenerated && !isLoadingAI && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span className="text-[10px] text-purple-300 font-medium">AI</span>
                </div>
              )}
            </div>
            <div className="relative space-y-2">
              {result.motivationalMessages.slice(0, 5).map((message, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "p-3 rounded-lg text-sm flex items-center gap-2 transition-all duration-300",
                    "bg-gradient-to-r from-purple-500/5 to-transparent",
                    "border border-purple-500/10 hover:border-purple-500/30",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-purple-400 text-lg">✦</span>
                  <span className="text-foreground/90">{message}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Notification Settings - Only show for logged in users */}
          {user && (
            <Card className="glass-card neon-border p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">দৈনিক রিমাইন্ডার</h3>
                  <p className="text-xs text-muted-foreground">প্রতিদিন নতুন মোটিভেশন মেসেজ দেখাও</p>
                </div>
                <Switch
                  checked={isNotificationEnabled}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>
              
              {isNotificationEnabled && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
                  ✓ প্রতিদিন অ্যাপ খুললে নতুন মোটিভেশন মেসেজ ও স্টাডি টিপস দেখতে পাবে।
                </p>
              )}
            </Card>
          )}

          {/* Reset Button */}
          <Button 
            variant="outline" 
            onClick={resetCoach}
            className="w-full gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5"
          >
            <RefreshCw className="h-4 w-4" />
            আবার শুরু করো
          </Button>
        </div>
      )}
    </div>
  );
}
