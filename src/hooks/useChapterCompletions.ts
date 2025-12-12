import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChapterCompletion {
  id: string;
  user_id: string;
  subject: string;
  chapter: string;
  completed: boolean;
  completed_at: string | null;
}

export const useChapterCompletions = () => {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<ChapterCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompletions = useCallback(async () => {
    if (!user) {
      setCompletions([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("chapter_completions")
      .select("*")
      .eq("user_id", user.id);

    if (!error && data) {
      setCompletions(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`completions_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chapter_completions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCompletions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCompletions]);

  const markChapterCompleted = async (subject: string, chapter: string, completed: boolean) => {
    if (!user) return;

    const completedAt = completed ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("chapter_completions")
      .upsert(
        {
          user_id: user.id,
          subject,
          chapter,
          completed,
          completed_at: completedAt,
        },
        { onConflict: "user_id,subject,chapter" }
      );

    if (!error) {
      fetchCompletions();
    }
  };

  const getMonthlyCompletions = useCallback(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return completions.filter((c) => {
      if (!c.completed || !c.completed_at) return false;
      const completedDate = new Date(c.completed_at);
      return completedDate >= startOfMonth && completedDate <= endOfMonth;
    });
  }, [completions]);

  const isChapterCompleted = useCallback(
    (subject: string, chapter: string) => {
      return completions.some(
        (c) => c.subject === subject && c.chapter === chapter && c.completed
      );
    },
    [completions]
  );

  return {
    completions,
    loading,
    markChapterCompleted,
    getMonthlyCompletions,
    isChapterCompleted,
    refetch: fetchCompletions,
  };
};
