import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, Sparkles, BookOpen, Brain, Target, HelpCircle, Trash2, Paperclip, X, Image, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProgressSnapshot } from "@/hooks/useProgressSnapshot";

type Attachment = {
  url: string;
  type: "image" | "document";
  name: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
};

interface UserContext {
  overallProgress: number;
  subjects: Array<{ name: string; progress: number }>;
  profile?: { displayName?: string; email?: string; lastActive?: string };
  coachSettings?: {
    batch?: string;
    monthsRemaining?: number;
    riskLevel?: string;
  };
  // Comprehensive data
  monthlyPlans?: Array<{ subject: string; chapter: string; activities: string[]; goals?: string }>;
  completedChapters?: Array<{ subject: string; chapter: string; completedAt?: string }>;
  recentActivities?: Array<{ subject: string; chapter: string; activity: string; status: string; updatedAt?: string }>;
  totalCompletedChapters?: number;
  totalPlannedThisMonth?: number;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_DOC_TYPES = ["application/pdf"];
// No file size limit

async function streamChat({
  messages,
  userContext,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  userContext?: UserContext;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, userContext }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        onError("Rate limit exceeded. Please wait a moment.");
        return;
      }
      if (resp.status === 402) {
        onError("AI quota exceeded. Please try again later.");
        return;
      }
      onError(errorData.error || "Failed to connect to AI");
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
    onError("Connection error. Please try again.");
  }
}

const SUGGESTED_PROMPTS = [
  { icon: BookOpen, text: "বর্তমানে কোন ক্লাসে পড়ছো?", color: "text-blue-500" },
  { icon: Brain, text: "কোন সাবজেক্ট সবচেয়ে দুর্বল মনে হয়?", color: "text-green-500" },
  { icon: Target, text: "প্রতিদিন গড়ে কত ঘণ্টা পড়ো?", color: "text-orange-500" },
  { icon: HelpCircle, text: "তোমার প্রধান লক্ষ্য কী? (GPA-5, Engineering, Medical, University, Study Abroad)", color: "text-purple-500" },
];

export function AIChatBox() {
  const { user } = useAuth();
  const { overallProgress, subjects } = useProgressSnapshot();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [userContext, setUserContext] = useState<UserContext | undefined>();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load comprehensive user context on mount
  useEffect(() => {
    const loadUserContext = async () => {
      if (!user) return;

      try {
        // Get current month for monthly plans
        const now = new Date();
        const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        // Fetch all data in parallel
        const [profileRes, coachRes, plansRes, completionsRes, activitiesRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("display_name, email, last_active_at")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("study_coach_settings")
            .select("batch, months_remaining, risk_level")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("monthly_study_plans")
            .select("subject, chapter, planned_activities, goals")
            .eq("user_id", user.id)
            .eq("month_year", currentMonthYear),
          supabase
            .from("chapter_completions")
            .select("subject, chapter, completed_at")
            .eq("user_id", user.id)
            .eq("completed", true)
            .order("completed_at", { ascending: false })
            .limit(30),
          supabase
            .from("study_records")
            .select("subject, chapter, activity, status, updated_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(50),
        ]);

        // Transform monthly plans
        const monthlyPlans = plansRes.data?.map((p) => ({
          subject: p.subject,
          chapter: p.chapter,
          activities: p.planned_activities || [],
          goals: p.goals ?? undefined,
        })) || [];

        // Transform completed chapters
        const completedChapters = completionsRes.data?.map((c) => ({
          subject: c.subject,
          chapter: c.chapter,
          completedAt: c.completed_at ?? undefined,
        })) || [];

        // Transform recent activities (only those with a status)
        const recentActivities = activitiesRes.data
          ?.filter((a) => a.status)
          .map((a) => ({
            subject: a.subject,
            chapter: a.chapter,
            activity: a.activity,
            status: a.status!,
            updatedAt: a.updated_at ?? undefined,
          })) || [];

        setUserContext({
          overallProgress,
          subjects: subjects.map((s) => ({ name: s.name, progress: s.progress })),
          profile: profileRes.data
            ? {
                displayName: profileRes.data.display_name ?? undefined,
                email: profileRes.data.email ?? undefined,
                lastActive: profileRes.data.last_active_at ?? undefined,
              }
            : undefined,
          coachSettings: coachRes.data
            ? {
                batch: coachRes.data.batch,
                monthsRemaining: coachRes.data.months_remaining,
                riskLevel: coachRes.data.risk_level,
              }
            : undefined,
          monthlyPlans,
          completedChapters,
          recentActivities,
          totalCompletedChapters: completedChapters.length,
          totalPlannedThisMonth: monthlyPlans.length,
        });
      } catch (error) {
        console.error("Failed to load user context:", error);
      }
    };

    loadUserContext();
  }, [user, overallProgress, subjects]);


  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("ai_chat_messages")
          .select("role, content")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setMessages(data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [user]);

  // Save message to database
  const saveMessage = useCallback(async (msg: Message) => {
    if (!user) return;

    try {
      await supabase.from("ai_chat_messages").insert({
        user_id: user.id,
        role: msg.role,
        content: msg.content,
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  }, [user]);

  // Clear chat history
  const clearHistory = async () => {
    if (!user) return;

    try {
      await supabase.from("ai_chat_messages").delete().eq("user_id", user.id);
      setMessages([]);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast.error("Failed to clear history");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setIsUploading(true);
    const newAttachments: Attachment[] = [];

    for (const file of Array.from(files)) {
      // Validate file type
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isDoc = ALLOWED_DOC_TYPES.includes(file.type);
      
      if (!isImage && !isDoc) {
        toast.error(`${file.name}: Only images (JPG, PNG, GIF, WebP) and PDFs are allowed`);
        continue;
      }

      // No file size limit - allow any size

      try {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("chat-attachments")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("chat-attachments")
          .getPublicUrl(fileName);

        newAttachments.push({
          url: urlData.publicUrl,
          type: isImage ? "image" : "document",
          name: file.name,
        });
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    setIsUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    setInput(prompt);
    // Auto-send after a brief moment
    setTimeout(() => {
      const userMsg: Message = { role: "user", content: prompt };
      setMessages((prev) => [...prev, userMsg]);
      saveMessage(userMsg);
      setIsLoading(true);

      let assistantContent = "";

      const updateAssistant = (chunk: string) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      };

      streamChat({
        messages: [userMsg],
        userContext,
        onDelta: updateAssistant,
        onDone: () => {
          setIsLoading(false);
          setInput("");
          inputRef.current?.focus();
          // Save assistant message after streaming completes
          if (assistantContent) {
            saveMessage({ role: "assistant", content: assistantContent });
          }
        },
        onError: (error) => {
          toast.error(error);
          setIsLoading(false);
          setMessages((prev) => prev.slice(0, -1));
        },
      });
    }, 100);
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if ((!trimmedInput && attachments.length === 0) || isLoading) return;

    // Build message content with attachments info
    let messageContent = trimmedInput;
    if (attachments.length > 0 && !trimmedInput) {
      messageContent = attachments.map(a => 
        a.type === "image" ? "[Sent an image]" : `[Sent a file: ${a.name}]`
      ).join(" ");
    }

    const userMsg: Message = { 
      role: "user", 
      content: messageContent,
      attachments: attachments.length > 0 ? [...attachments] : undefined 
    };
    setMessages((prev) => [...prev, userMsg]);
    saveMessage(userMsg);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    // Prepare messages for API - include attachment URLs for vision
    const apiMessages = [...messages, userMsg].map((m) => {
      if (m.attachments && m.attachments.length > 0) {
        // For messages with images, format for vision model
        const imageUrls = m.attachments
          .filter((a) => a.type === "image")
          .map((a) => a.url);
        const docUrls = m.attachments
          .filter((a) => a.type === "document")
          .map((a) => `[PDF attached: ${a.name} - ${a.url}]`);
        
        return {
          role: m.role,
          content: m.content,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          documentInfo: docUrls.length > 0 ? docUrls.join("\n") : undefined,
        };
      }
      return { role: m.role, content: m.content };
    });

    await streamChat({
      messages: apiMessages,
      userContext,
      onDelta: updateAssistant,
      onDone: () => {
        setIsLoading(false);
        inputRef.current?.focus();
        if (assistantContent) {
          saveMessage({ role: "assistant", content: assistantContent });
        }
      },
      onError: (error) => {
        toast.error(error);
        setIsLoading(false);
        setMessages((prev) => prev.slice(0, -1));
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="flex flex-col h-[500px] bg-card/50 rounded-xl overflow-hidden border border-border/50">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-card/50 rounded-xl overflow-hidden border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Study Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask anything about your studies</p>
          </div>
        </div>
        {messages.length > 0 && user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearHistory}
            className="text-muted-foreground hover:text-destructive"
            title="Clear chat history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-4">
            <Sparkles className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm mb-1">Start a conversation!</p>
            <p className="text-xs mb-4">Ask about study tips, subjects, or exam preparation</p>
            
            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md px-2">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt.text)}
                  disabled={isLoading}
                  className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <prompt.icon className={`h-4 w-4 flex-shrink-0 ${prompt.color}`} />
                  <span className="text-xs text-foreground/80 group-hover:text-foreground line-clamp-2">
                    {prompt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {/* Show attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {msg.attachments.map((att, idx) => (
                        <div key={idx}>
                          {att.type === "image" ? (
                            <img 
                              src={att.url} 
                              alt={att.name}
                              className="max-w-full max-h-48 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex items-center gap-2 bg-background/20 rounded-lg px-3 py-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-xs truncate">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-card/80 space-y-2">
        {/* Attachment preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, idx) => (
              <div 
                key={idx} 
                className="relative group bg-muted rounded-lg overflow-hidden"
              >
                {att.type === "image" ? (
                  <img 
                    src={att.url} 
                    alt={att.name}
                    className="h-16 w-16 object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 flex flex-col items-center justify-center p-2">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {att.name.slice(0, 10)}...
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {/* Attach button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading || !user}
            title="Attach image or PDF"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
          
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={attachments.length > 0 ? "Add a message..." : "Type your message..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
