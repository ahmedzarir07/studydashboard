import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { AlertCircle, GraduationCap, MessageCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { StudyCoach } from "@/components/StudyCoach";
import { AIChatBox } from "@/components/AIChatBox";
import { PreChatQuestionnaire } from "@/components/PreChatQuestionnaire";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function AIAnalysis() {
  const { user } = useAuth();
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from("ai_chat_preferences" as any)
        .select("completed")
        .eq("user_id", user.id)
        .single();
      setQuestionnaireCompleted(!!(data as any)?.completed);
    };
    check();
  }, [user]);

  if (!user) {
    return (
      <AppLayout title="AI বিশ্লেষণ">
        <main className="px-4 py-6 max-w-2xl mx-auto">
          <div className="bg-card/50 rounded-xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">লগইন প্রয়োজন</h2>
            <p className="text-muted-foreground mb-4">
              AI বিশ্লেষণ ব্যবহার করতে অনুগ্রহ করে লগইন করুন
            </p>
            <Link to="/auth">
              <Button>লগইন করুন</Button>
            </Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  if (questionnaireCompleted === null) {
    return (
      <AppLayout title="AI বিশ্লেষণ">
        <main className="px-4 py-6 max-w-2xl mx-auto flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="AI বিশ্লেষণ">
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chat" className="gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span> Chat
            </TabsTrigger>
            <TabsTrigger value="coach" className="gap-1 text-xs sm:text-sm px-1 sm:px-3">
              <GraduationCap className="h-4 w-4" />
              Coach
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            {questionnaireCompleted ? (
              <AIChatBox />
            ) : (
              <PreChatQuestionnaire onComplete={() => setQuestionnaireCompleted(true)} />
            )}
          </TabsContent>
          
          <TabsContent value="coach" className="space-y-4">
            <StudyCoach />
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  );
}
