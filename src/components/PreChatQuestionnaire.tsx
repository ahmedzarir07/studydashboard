import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface QuestionnaireAnswers {
  current_class: string;
  student_name: string;
  weak_subjects: string[];
  college_name: string;
  study_hours: string;
  main_goal: string;
  help_type: string[];
  preferred_language: string;
  biggest_problem: string;
  ai_expectation: string[];
  student_level: string;
  ai_behavior: string;
}

const INITIAL_ANSWERS: QuestionnaireAnswers = {
  current_class: "",
  student_name: "",
  weak_subjects: [],
  college_name: "",
  study_hours: "",
  main_goal: "",
  help_type: [],
  preferred_language: "",
  biggest_problem: "",
  ai_expectation: [],
  student_level: "",
  ai_behavior: "",
};

interface PreChatQuestionnaireProps {
  onComplete: () => void;
}

export function PreChatQuestionnaire({ onComplete }: PreChatQuestionnaireProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(INITIAL_ANSWERS);
  const [saving, setSaving] = useState(false);

  const toggleArrayItem = (field: keyof QuestionnaireAnswers, value: string) => {
    setAnswers((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const questions = [
    // Step 0
    <div key="q0" className="space-y-4">
      <h3 className="text-lg font-bold">1️⃣ বর্তমানে কোন ক্লাসে পড়ছো?</h3>
      <RadioGroup value={answers.current_class} onValueChange={(v) => setAnswers((p) => ({ ...p, current_class: v }))}>
        {["HSC 1st Year", "HSC 2nd Year", "Admission Candidate", "Other"].map((opt) => (
          <div key={opt} className="flex items-center space-x-2">
            <RadioGroupItem value={opt} id={`class-${opt}`} />
            <Label htmlFor={`class-${opt}`} className="cursor-pointer">{opt}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>,
    // Step 1
    <div key="q1" className="space-y-4">
      <h3 className="text-lg font-bold">2️⃣ তোমার নাম কী?</h3>
      <Input
        placeholder="যেমন: Alex, Monalisa"
        value={answers.student_name}
        onChange={(e) => setAnswers((p) => ({ ...p, student_name: e.target.value }))}
        maxLength={100}
      />
    </div>,
    // Step 2
    <div key="q2" className="space-y-4">
      <h3 className="text-lg font-bold">3️⃣ কোন সাবজেক্টগুলোতে তুমি বেশি দুর্বল?</h3>
      <div className="grid grid-cols-2 gap-2">
        {["Physics", "Chemistry", "Math", "Biology", "ICT", "English", "Bangla"].map((s) => (
          <div key={s} className="flex items-center space-x-2">
            <Checkbox
              id={`weak-${s}`}
              checked={answers.weak_subjects.includes(s)}
              onCheckedChange={() => toggleArrayItem("weak_subjects", s)}
            />
            <Label htmlFor={`weak-${s}`} className="cursor-pointer text-sm">{s}</Label>
          </div>
        ))}
      </div>
    </div>,
    // Step 3
    <div key="q3" className="space-y-4">
      <h3 className="text-lg font-bold">4️⃣ তোমার কলেজের নাম কী?</h3>
      <Input
        placeholder="College Name"
        value={answers.college_name}
        onChange={(e) => setAnswers((p) => ({ ...p, college_name: e.target.value }))}
        maxLength={200}
      />
    </div>,
    // Step 4
    <div key="q4" className="space-y-4">
      <h3 className="text-lg font-bold">5️⃣ প্রতিদিন গড়ে কত ঘণ্টা পড়াশোনা করো?</h3>
      <RadioGroup value={answers.study_hours} onValueChange={(v) => setAnswers((p) => ({ ...p, study_hours: v }))}>
        {["১-২ ঘণ্টা", "৩-৪ ঘণ্টা", "৫-৬ ঘণ্টা", "৭-৮ ঘণ্টা", "৯-১০ ঘণ্টা", "১০+ ঘণ্টা"].map((opt) => (
          <div key={opt} className="flex items-center space-x-2">
            <RadioGroupItem value={opt} id={`hours-${opt}`} />
            <Label htmlFor={`hours-${opt}`} className="cursor-pointer">{opt}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>,
    // Step 5
    <div key="q5" className="space-y-4">
      <h3 className="text-lg font-bold">6️⃣ তোমার প্রধান লক্ষ্য কী?</h3>
      <RadioGroup value={answers.main_goal} onValueChange={(v) => setAnswers((p) => ({ ...p, main_goal: v }))}>
        {["HSC GPA 5", "Board Top", "Medical", "Engineering", "Varsity", "Abroad", "Other"].map((opt) => (
          <div key={opt} className="flex items-center space-x-2">
            <RadioGroupItem value={opt} id={`goal-${opt}`} />
            <Label htmlFor={`goal-${opt}`} className="cursor-pointer">{opt}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>,
    // Step 6
    <div key="q6" className="space-y-4">
      <h3 className="text-lg font-bold">7️⃣ তুমি কোন ধরনের সাহায্য বেশি চাও?</h3>
      <div className="space-y-2">
        {["Concept explanation", "MCQ practice", "CQ writing", "Notes", "Revision"].map((s) => (
          <div key={s} className="flex items-center space-x-2">
            <Checkbox
              id={`help-${s}`}
              checked={answers.help_type.includes(s)}
              onCheckedChange={() => toggleArrayItem("help_type", s)}
            />
            <Label htmlFor={`help-${s}`} className="cursor-pointer text-sm">{s}</Label>
          </div>
        ))}
      </div>
    </div>,
    // Step 7
    <div key="q7" className="space-y-4">
      <h3 className="text-lg font-bold">8️⃣ কোন ভাষায় বুঝতে বেশি সুবিধা হয়?</h3>
      <RadioGroup value={answers.preferred_language} onValueChange={(v) => setAnswers((p) => ({ ...p, preferred_language: v }))}>
        {["Bangla", "English", "Mixed"].map((opt) => (
          <div key={opt} className="flex items-center space-x-2">
            <RadioGroupItem value={opt} id={`lang-${opt}`} />
            <Label htmlFor={`lang-${opt}`} className="cursor-pointer">{opt}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>,
    // Step 8
    <div key="q8" className="space-y-4">
      <h3 className="text-lg font-bold">9️⃣ পড়াশোনায় তোমার সবচেয়ে বড় সমস্যা কী?</h3>
      <RadioGroup value={answers.biggest_problem} onValueChange={(v) => setAnswers((p) => ({ ...p, biggest_problem: v }))}>
        {["Consistency", "Understanding", "Time management", "Motivation", "Distraction"].map((opt) => (
          <div key={opt} className="flex items-center space-x-2">
            <RadioGroupItem value={opt} id={`problem-${opt}`} />
            <Label htmlFor={`problem-${opt}`} className="cursor-pointer">{opt}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>,
    // Step 9
    <div key="q9" className="space-y-4">
      <h3 className="text-lg font-bold">🔟 AI থেকে তুমি কী আশা করছো?</h3>
      <div className="space-y-2">
        {["Study plan", "Daily routine", "Chapter-wise guide", "Doubt solving", "All"].map((s) => (
          <div key={s} className="flex items-center space-x-2">
            <Checkbox
              id={`expect-${s}`}
              checked={answers.ai_expectation.includes(s)}
              onCheckedChange={() => toggleArrayItem("ai_expectation", s)}
            />
            <Label htmlFor={`expect-${s}`} className="cursor-pointer text-sm">{s}</Label>
          </div>
        ))}
      </div>
    </div>,
    // Step 10
    <div key="q10" className="space-y-4">
      <h3 className="text-lg font-bold">1️⃣1️⃣ তুমি কি Topper নাকি Backbencher?</h3>
      <RadioGroup value={answers.student_level} onValueChange={(v) => setAnswers((p) => ({ ...p, student_level: v }))}>
        {["Topper", "Average", "Backbencher"].map((opt) => (
          <div key={opt} className="flex items-center space-x-2">
            <RadioGroupItem value={opt} id={`level-${opt}`} />
            <Label htmlFor={`level-${opt}`} className="cursor-pointer">{opt}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>,
    // Step 11
    <div key="q11" className="space-y-4">
      <h3 className="text-lg font-bold">🔹 AI তোমার সাথে কীভাবে কথা বলবে?</h3>
      <RadioGroup value={answers.ai_behavior} onValueChange={(v) => setAnswers((p) => ({ ...p, ai_behavior: v }))}>
        {[
          { value: "teacher", label: "🧑‍🏫 প্রিয় শিক্ষকের মতো", desc: "শান্তভাবে বুঝিয়ে বলবে, ধাপে ধাপে শেখাবে" },
          { value: "friend", label: "🤝 বন্ধুর মতো", desc: "ক্যাজুয়াল স্টাইল, মোটিভেশন দেবে" },
          { value: "coach", label: "🧠 কোচ / মেন্টরের মতো", desc: "ডাইরেক্ট কথা, reality check, strict guidance" },
          { value: "mixed", label: "⚖️ মিক্সড", desc: "শিক্ষক + বন্ধু + কোচ সব মিলিয়ে" },
        ].map((opt) => (
          <div key={opt.value} className="flex items-start space-x-2">
            <RadioGroupItem value={opt.value} id={`behavior-${opt.value}`} className="mt-1" />
            <Label htmlFor={`behavior-${opt.value}`} className="cursor-pointer">
              <span className="font-medium">{opt.label}</span>
              <span className="block text-xs text-muted-foreground">{opt.desc}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>,
  ];

  const isCurrentStepValid = () => {
    switch (step) {
      case 0: return !!answers.current_class;
      case 1: return answers.student_name.trim().length > 0;
      case 2: return answers.weak_subjects.length > 0;
      case 3: return answers.college_name.trim().length > 0;
      case 4: return !!answers.study_hours;
      case 5: return !!answers.main_goal;
      case 6: return answers.help_type.length > 0;
      case 7: return !!answers.preferred_language;
      case 8: return !!answers.biggest_problem;
      case 9: return answers.ai_expectation.length > 0;
      case 10: return !!answers.student_level;
      case 11: return !!answers.ai_behavior;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("ai_chat_preferences" as any).upsert({
        user_id: user.id,
        current_class: answers.current_class,
        student_name: answers.student_name.trim(),
        weak_subjects: answers.weak_subjects,
        college_name: answers.college_name.trim(),
        study_hours: answers.study_hours,
        main_goal: answers.main_goal,
        help_type: answers.help_type,
        preferred_language: answers.preferred_language,
        biggest_problem: answers.biggest_problem,
        ai_expectation: answers.ai_expectation,
        student_level: answers.student_level,
        ai_behavior: answers.ai_behavior,
        completed: true,
      } as any, { onConflict: "user_id" } as any);

      if (error) throw error;
      toast.success("তোমার তথ্য সংরক্ষিত হয়েছে! 🎉");
      onComplete();
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-card/50 rounded-xl overflow-hidden border border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-card/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Chat Setup</h3>
            <p className="text-xs text-muted-foreground">
              প্রশ্ন {step + 1}/{questions.length} — AI তোমাকে ভালোভাবে চিনুক
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {questions[step]}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> পূর্ববর্তী
        </Button>

        {step < questions.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setStep((s) => s + 1)}
            disabled={!isCurrentStepValid()}
          >
            পরবর্তী <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!isCurrentStepValid() || saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
            শুরু করো!
          </Button>
        )}
      </div>
    </div>
  );
}
