import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyCoachSettings } from "@/hooks/useStudyCoachSettings";
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
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "batch" | "months" | "completion" | "result";
type RiskLevel = "safe" | "slightly_behind" | "high_risk";

interface CoachResult {
  safePercentage: number;
  riskLevel: RiskLevel;
  motivationalMessages: string[];
  todayActions: string[];
}

// Daily rotation of message tones
const getTodayTone = (): string => {
  const tones = ["reality", "encouragement", "discipline", "progress", "urgency"];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return tones[dayOfYear % tones.length];
};

const getMotivationalMessages = (monthsRemaining: number, riskLevel: RiskLevel, tone: string): string[] => {
  const urgencyFactor = monthsRemaining <= 3 ? "high" : monthsRemaining <= 6 ? "medium" : "low";
  
  const messages: Record<string, string[]> = {
    reality: [
      "আজ ১ ঘণ্টা পড়লে কাল ১ ঘণ্টা এগিয়ে থাকবে।",
      "সিলেবাস নিজে নিজে শেষ হবে না—তোমাকেই করতে হবে।",
      "প্রতিদিন ছোট ছোট পদক্ষেপই বড় ফলাফল আনে।",
      "বাকি সময় কম—এখনই শুরু করো।",
      "অজুহাত না দিয়ে বই খোলো।"
    ],
    encouragement: [
      "তুমি যতটুকু পেরেছ, সেটাও একটা অর্জন।",
      "ধীরে হলেও এগিয়ে যাচ্ছ—থামবে না।",
      "প্রতিটা পৃষ্ঠা তোমাকে লক্ষ্যের কাছে নিয়ে যাচ্ছে।",
      "কঠিন লাগলেও চালিয়ে যাও—ফল পাবে।",
      "তোমার চেষ্টা বৃথা যাবে না।"
    ],
    discipline: [
      "রুটিন মানো—মন না চাইলেও পড়ো।",
      "মোবাইল দূরে রাখো, বই কাছে রাখো।",
      "প্রতিদিন নির্দিষ্ট সময় পড়ার অভ্যাস করো।",
      "ইচ্ছার উপর নির্ভর করো না—নিয়মের উপর করো।",
      "আজ ফাঁকি দিলে কাল আরও কঠিন হবে।"
    ],
    progress: [
      "গতকালের চেয়ে আজ একটু বেশি পড়ো।",
      "ছোট উন্নতিও উন্নতি—এগিয়ে যাও।",
      "প্রতিদিন ১% উন্নতি = মাসে ৩০% উন্নতি।",
      "যা পড়েছ তা রিভিশন দাও, নতুন কিছু যোগ করো।",
      "ধারাবাহিকতাই সাফল্যের চাবিকাঠি।"
    ],
    urgency: [
      urgencyFactor === "high" ? "সময় প্রায় শেষ—প্রতিটা মুহূর্ত গুরুত্বপূর্ণ!" : "সময় আছে, কিন্তু অপচয় করো না।",
      "আজ যা পড়বে না, পরীক্ষায় তা আসতে পারে।",
      "প্রতিদিন গুনে গুনে পড়ো—সময় চলে যাচ্ছে।",
      urgencyFactor === "high" ? "এখন পড়াই একমাত্র কাজ!" : "অগ্রাধিকার ঠিক রাখো।",
      "পরে পড়ব বললে পরে আর সময় থাকবে না।"
    ]
  };
  
  // Add risk-specific messages
  if (riskLevel === "high_risk") {
    messages[tone] = [
      ...messages[tone],
      "ঝুঁকিতে আছ—এখনই গতি বাড়াও।",
      "প্রতিদিন অন্তত ৩-৪ ঘণ্টা পড়া জরুরি।"
    ];
  }
  
  return messages[tone] || messages.encouragement;
};

const getTodayActions = (completion: number, monthsRemaining: number, batch: string): string[] => {
  const actions: string[] = [];
  
  if (completion < 30) {
    actions.push("আজ যেকোনো ১টি নতুন অধ্যায় শুরু করো এবং মূল ধারণাগুলো বুঝে নাও।");
    actions.push("প্রতিদিন কমপক্ষে ২-৩ ঘণ্টা পড়ার রুটিন তৈরি করো।");
  } else if (completion < 50) {
    actions.push("দুর্বল বিষয়ে ১ ঘণ্টা অতিরিক্ত সময় দাও।");
    actions.push("আজ অন্তত ১টি অধ্যায়ের সমস্যা সমাধান প্র্যাকটিস করো।");
  } else if (completion < 70) {
    actions.push("পুরোনো অধ্যায়গুলো রিভিশন দিতে শুরু করো।");
    actions.push("প্রতিদিন ১ ঘণ্টা MCQ প্র্যাকটিস করো।");
  } else {
    actions.push("মডেল টেস্ট দেওয়া শুরু করো।");
    actions.push("দুর্বল টপিকগুলো চিহ্নিত করে সেগুলোতে ফোকাস করো।");
  }
  
  if (monthsRemaining <= 3) {
    actions.push("বিগত বছরের প্রশ্ন সলভ করা শুরু করো—এটা অত্যন্ত জরুরি।");
  }
  
  return actions.slice(0, 2);
};

export function StudyCoach() {
  const { user } = useAuth();
  const { settings, saveSettings, updateNotificationSettings } = useStudyCoachSettings();
  
  const [step, setStep] = useState<Step>("batch");
  const [batch, setBatch] = useState<"2026" | "2027" | null>(null);
  const [monthsRemaining, setMonthsRemaining] = useState<number>(12);
  const [completion, setCompletion] = useState<number>(30);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [lastShownDate, setLastShownDate] = useState<string | null>(null);

  // Load saved settings when available
  useEffect(() => {
    if (settings) {
      setBatch(settings.batch as "2026" | "2027");
      setMonthsRemaining(settings.months_remaining);
      setCompletion(settings.completion_percentage);
      setIsNotificationEnabled(settings.notifications_enabled);
      
      // If we have saved settings, show the result
      if (settings.risk_level) {
        const tone = getTodayTone();
        const motivationalMessages = getMotivationalMessages(settings.months_remaining, settings.risk_level as RiskLevel, tone);
        const todayActions = getTodayActions(settings.completion_percentage, settings.months_remaining, settings.batch);
        
        let safePercentage: number;
        if (settings.batch === "2027") {
          safePercentage = Math.min(80, Math.round((24 - settings.months_remaining) * 3));
        } else {
          safePercentage = Math.min(90, Math.round((12 - settings.months_remaining) * 7));
        }
        safePercentage = Math.max(0, safePercentage);
        
        setResult({
          safePercentage,
          riskLevel: settings.risk_level as RiskLevel,
          motivationalMessages,
          todayActions
        });
        setStep("result");
      }
    }
  }, [settings, user?.email]);

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
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          label: "নিরাপদ অবস্থানে",
          description: "তুমি সঠিক পথে আছ। এই গতি বজায় রাখো।"
        };
      case "slightly_behind":
        return {
          icon: AlertCircle,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          label: "সামান্য পিছিয়ে",
          description: "একটু বেশি গতিতে পড়লে ধরে ফেলতে পারবে।"
        };
      case "high_risk":
        return {
          icon: AlertTriangle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          label: "ঝুঁকিপূর্ণ অবস্থানে",
          description: "এখনই গতি বাড়াতে হবে। প্রতিদিন বেশি সময় দেওয়া জরুরি।"
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Step 1: Batch Selection */}
      {step === "batch" && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">তুমি কোন ব্যাচের?</h3>
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
                  "flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 cursor-pointer transition-all",
                  "hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                )}
              >
                <span className="text-2xl font-bold">HSC 2026</span>
                <span className="text-sm text-muted-foreground">দ্বিতীয় বর্ষ</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="2027" id="batch-2027" className="peer sr-only" />
              <Label
                htmlFor="batch-2027"
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 cursor-pointer transition-all",
                  "hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                )}
              >
                <span className="text-2xl font-bold">HSC 2027</span>
                <span className="text-sm text-muted-foreground">প্রথম বর্ষ</span>
              </Label>
            </div>
          </RadioGroup>
          
          <Button 
            onClick={() => setStep("months")} 
            disabled={!batch}
            className="w-full"
          >
            পরবর্তী
          </Button>
        </Card>
      )}

      {/* Step 2: Months Remaining */}
      {step === "months" && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">পরীক্ষায় কত মাস বাকি?</h3>
              <p className="text-sm text-muted-foreground">আনুমানিক হিসাব দাও</p>
            </div>
          </div>
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">{monthsRemaining}</span>
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
            <Button onClick={() => setStep("completion")} className="flex-1">
              পরবর্তী
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Completion Percentage */}
      {step === "completion" && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">সিলেবাস কতটুকু শেষ?</h3>
              <p className="text-sm text-muted-foreground">আনুমানিক শতাংশ দাও</p>
            </div>
          </div>
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">{completion}</span>
              <span className="text-xl text-muted-foreground">%</span>
            </div>
            
            <Slider
              value={[completion]}
              onValueChange={([v]) => setCompletion(v)}
              min={0}
              max={100}
              step={5}
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
            <Button onClick={calculateResult} disabled={isCalculating} className="flex-1">
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
              <Card className={cn("p-5 border-2", config.borderColor, config.bgColor)}>
                <div className="flex items-start gap-4">
                  <div className={cn("p-3 rounded-full", config.bgColor)}>
                    <Icon className={cn("h-6 w-6", config.color)} />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn("text-lg font-bold", config.color)}>{config.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">তোমার অগ্রগতি</p>
                    <p className="text-2xl font-bold">{completion}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">এই সময়ে থাকা উচিত</p>
                    <p className="text-2xl font-bold">{result.safePercentage}%</p>
                  </div>
                </div>
                
                {result.riskLevel !== "safe" && (
                  <div className="mt-4 pt-4 border-t border-border/50">
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
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">আজকের জন্য পরামর্শ</h3>
            </div>
            <div className="space-y-3">
              {result.todayActions.map((action, index) => (
                <div key={index} className="flex gap-3 p-3 bg-accent/50 rounded-lg">
                  <span className="font-bold text-primary">{index + 1}.</span>
                  <p className="text-sm">{action}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Motivational Messages */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">আজকের অনুপ্রেরণা</h3>
            </div>
            <div className="space-y-2">
              {result.motivationalMessages.slice(0, 5).map((message, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-muted/50 rounded-lg text-sm flex items-center gap-2"
                >
                  <span className="text-primary">•</span>
                  {message}
                </div>
              ))}
            </div>
          </Card>

          {/* Notification Settings - Only show for logged in users */}
          {user && (
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
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
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                  ✓ প্রতিদিন অ্যাপ খুললে নতুন মোটিভেশন মেসেজ ও স্টাডি টিপস দেখতে পাবে।
                </p>
              )}
            </Card>
          )}

          {/* Reset Button */}
          <Button 
            variant="outline" 
            onClick={resetCoach}
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            আবার শুরু করো
          </Button>
        </div>
      )}
    </div>
  );
}
