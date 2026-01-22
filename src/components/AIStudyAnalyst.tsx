import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { 
  Send, 
  Loader2, 
  Bot, 
  User, 
  RotateCcw, 
  ClipboardList,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  allowMultiple?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: "group",
    question: "তুমি কোন গ্রুপের ছাত্র/ছাত্রী?",
    options: [
      { label: "Science", value: "science" },
      { label: "Business", value: "business" },
      { label: "Arts", value: "arts" },
    ],
  },
  {
    id: "class",
    question: "বর্তমানে কোন ক্লাসে পড়ছো?",
    options: [
      { label: "HSC 1st Year", value: "hsc1" },
      { label: "HSC 2nd Year", value: "hsc2" },
    ],
  },
  {
    id: "hardestSubject",
    question: "কোন সাবজেক্টটা সবচেয়ে শক্ত?",
    options: [
      { label: "Physics", value: "physics" },
      { label: "Chemistry", value: "chemistry" },
      { label: "Math", value: "math" },
      { label: "Biology", value: "biology" },
      { label: "ICT", value: "ict" },
    ],
  },
  {
    id: "weakestSubject",
    question: "কোন সাবজেক্টটা সবচেয়ে দুর্বল মনে হয়?",
    options: [
      { label: "Physics", value: "physics" },
      { label: "Chemistry", value: "chemistry" },
      { label: "Math", value: "math" },
      { label: "Biology", value: "biology" },
      { label: "ICT", value: "ict" },
      { label: "English", value: "english" },
      { label: "Bangla", value: "bangla" },
    ],
  },
  {
    id: "studyHours",
    question: "প্রতিদিন গড়ে কত ঘণ্টা পড়ো?",
    options: [
      { label: "১ ঘণ্টার কম", value: "<1h" },
      { label: "১-৩ ঘণ্টা", value: "1-3h" },
      { label: "৩-৫ ঘণ্টা", value: "3-5h" },
      { label: "৫+ ঘণ্টা", value: "5h+" },
    ],
  },
  {
    id: "studyTime",
    question: "পড়াশোনা সাধারণত কখন করো?",
    options: [
      { label: "সকাল", value: "morning" },
      { label: "রাত", value: "night" },
      { label: "মিক্সড", value: "mixed" },
    ],
  },
  {
    id: "goal",
    question: "তোমার প্রধান লক্ষ্য কী?",
    options: [
      { label: "GPA 5", value: "gpa5" },
      { label: "Engineering/Medical", value: "eng-med" },
      { label: "Public University", value: "public-uni" },
      { label: "Abroad", value: "abroad" },
      { label: "Not sure", value: "not-sure" },
    ],
  },
  {
    id: "problem",
    question: "এই মুহূর্তে সবচেয়ে বড় সমস্যা কোনটা?",
    options: [
      { label: "Backlog", value: "backlog" },
      { label: "Concept clear না", value: "concept" },
      { label: "Time management", value: "time" },
      { label: "Motivation কম", value: "motivation" },
    ],
  },
  {
    id: "helpNeeded",
    question: "তুমি AI থেকে কী ধরনের সাহায্য চাও?",
    options: [
      { label: "Daily study plan", value: "daily-plan" },
      { label: "Topic explanation", value: "topic" },
      { label: "MCQ practice", value: "mcq" },
      { label: "Weakness analysis", value: "weakness" },
    ],
    allowMultiple: true,
  },
];

const ANALYST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-analyst`;

async function streamAnalysis({
  answers,
  onDelta,
  onDone,
  onError,
}: {
  answers: Record<string, string | string[]>;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const resp = await fetch(ANALYST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ answers }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        onError("Rate limit exceeded. অনুগ্রহ করে একটু অপেক্ষা করো।");
        return;
      }
      if (resp.status === 402) {
        onError("AI quota exceeded. পরে আবার চেষ্টা করো।");
        return;
      }
      onError(errorData.error || "AI এর সাথে সংযোগ করতে ব্যর্থ");
      return;
    }

    if (!resp.body) {
      onError("No response body");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          /* ignore */
        }
      }
    }

    onDone();
  } catch (error) {
    console.error("Stream error:", error);
    onError("সংযোগ সমস্যা। আবার চেষ্টা করো।");
  }
}

export function AIStudyAnalyst() {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [phase, setPhase] = useState<"questions" | "analyzing" | "result">("questions");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentQuestionIndex, analysisResult]);

  const handleOptionSelect = (value: string) => {
    if (currentQuestion.allowMultiple) {
      setMultiSelectAnswers((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    } else {
      // Single select - move to next question
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
      
      if (isLastQuestion) {
        startAnalysis({ ...answers, [currentQuestion.id]: value });
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }
  };

  const handleMultiSelectSubmit = () => {
    if (multiSelectAnswers.length === 0) {
      toast.error("অন্তত একটি অপশন সিলেক্ট করো");
      return;
    }

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: multiSelectAnswers }));

    if (isLastQuestion) {
      startAnalysis({ ...answers, [currentQuestion.id]: multiSelectAnswers });
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setMultiSelectAnswers([]);
    }
  };

  const startAnalysis = async (finalAnswers: Record<string, string | string[]>) => {
    setPhase("analyzing");
    setIsAnalyzing(true);

    let result = "";

    await streamAnalysis({
      answers: finalAnswers,
      onDelta: (chunk) => {
        result += chunk;
        setAnalysisResult(result);
      },
      onDone: () => {
        setIsAnalyzing(false);
        setPhase("result");
        
        // Save analysis to database if user is logged in
        if (user) {
          saveAnalysis(finalAnswers, result);
        }
      },
      onError: (error) => {
        toast.error(error);
        setIsAnalyzing(false);
        setPhase("questions");
      },
    });
  };

  const saveAnalysis = async (
    answers: Record<string, string | string[]>,
    result: string
  ) => {
    if (!user) return;

    try {
      // Save as a chat message for history
      await supabase.from("ai_chat_messages").insert([
        {
          user_id: user.id,
          role: "user",
          content: `[Study Analysis Request]\n${JSON.stringify(answers, null, 2)}`,
        },
        {
          user_id: user.id,
          role: "assistant",
          content: result,
        },
      ]);
    } catch (error) {
      console.error("Failed to save analysis:", error);
    }
  };

  const resetAnalyst = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setMultiSelectAnswers([]);
    setAnalysisResult("");
    setPhase("questions");
  };

  const getAnsweredQuestions = () => {
    return QUESTIONS.slice(0, currentQuestionIndex).map((q) => ({
      question: q.question,
      answer: Array.isArray(answers[q.id])
        ? (answers[q.id] as string[])
            .map((v) => q.options.find((o) => o.value === v)?.label || v)
            .join(", ")
        : q.options.find((o) => o.value === answers[q.id])?.label || answers[q.id],
    }));
  };

  return (
    <div className="flex flex-col h-[600px] bg-card/50 rounded-xl overflow-hidden border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Study Analyst</h3>
            <p className="text-xs text-muted-foreground">
              {phase === "questions"
                ? `প্রশ্ন ${currentQuestionIndex + 1}/${QUESTIONS.length}`
                : phase === "analyzing"
                ? "বিশ্লেষণ চলছে..."
                : "বিশ্লেষণ সম্পন্ন"}
            </p>
          </div>
        </div>
        {(phase === "result" || currentQuestionIndex > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAnalyst}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            আবার শুরু করো
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {phase === "questions" && (
        <div className="px-4 py-2 bg-muted/30">
          <div className="flex items-center gap-2">
            {QUESTIONS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  index < currentQuestionIndex
                    ? "bg-primary"
                    : index === currentQuestionIndex
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {phase === "questions" && (
          <div className="space-y-4">
            {/* Previous Q&A */}
            {getAnsweredQuestions().map((qa, index) => (
              <div key={index} className="space-y-2">
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm max-w-[80%]">
                    {qa.question}
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2.5 text-sm max-w-[80%]">
                    {qa.answer}
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}

            {/* Current Question */}
            <div className="space-y-4">
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm max-w-[80%]">
                  {currentQuestion.question}
                </div>
              </div>

              {/* Options */}
              <div className="pl-11 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentQuestion.allowMultiple
                      ? multiSelectAnswers.includes(option.value)
                      : false;

                    return (
                      <Button
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleOptionSelect(option.value)}
                        className={`justify-start h-auto py-3 px-4 ${
                          isSelected ? "" : "hover:bg-primary/5 hover:border-primary/50"
                        }`}
                      >
                        {currentQuestion.allowMultiple && (
                          <div
                            className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                              isSelected
                                ? "bg-primary-foreground border-primary-foreground"
                                : "border-muted-foreground"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                            )}
                          </div>
                        )}
                        {option.label}
                      </Button>
                    );
                  })}
                </div>

                {currentQuestion.allowMultiple && (
                  <Button
                    onClick={handleMultiSelectSubmit}
                    disabled={multiSelectAnswers.length === 0}
                    className="w-full mt-4"
                  >
                    পরবর্তী
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {(phase === "analyzing" || phase === "result") && (
          <div className="space-y-4">
            {/* Show analysis result */}
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3 text-sm max-w-[90%]">
                {analysisResult ? (
                  <div className="whitespace-pre-wrap">{analysisResult}</div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>তোমার উত্তর বিশ্লেষণ করছি...</span>
                  </div>
                )}
              </div>
            </div>

            {phase === "result" && (
              <div className="flex justify-center pt-4">
                <Button onClick={resetAnalyst} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  নতুন বিশ্লেষণ শুরু করো
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
