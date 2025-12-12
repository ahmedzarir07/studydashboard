import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChapterResource {
  id: string;
  user_id: string;
  subject: string;
  chapter: string;
  title: string;
  url: string;
  updated_at: string;
}

export const useChapterResources = (subjectId?: string) => {
  const { user } = useAuth();
  const [resources, setResources] = useState<ChapterResource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = useCallback(async () => {
    if (!user) {
      setResources([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("chapter_resources")
      .select("*")
      .eq("user_id", user.id);

    if (subjectId) {
      query = query.eq("subject", subjectId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setResources(data);
    }
    setLoading(false);
  }, [user, subjectId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`resources_${user.id}_${subjectId || "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chapter_resources",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchResources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, subjectId, fetchResources]);

  const saveResource = async (
    subject: string,
    chapter: string,
    title: string,
    url: string
  ) => {
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from("chapter_resources").upsert(
      {
        user_id: user.id,
        subject,
        chapter,
        title,
        url,
      },
      { onConflict: "user_id,subject,chapter" }
    );

    if (!error) {
      fetchResources();
    }

    return { error: error?.message };
  };

  const deleteResource = async (subject: string, chapter: string) => {
    if (!user) return;

    await supabase
      .from("chapter_resources")
      .delete()
      .eq("user_id", user.id)
      .eq("subject", subject)
      .eq("chapter", chapter);

    fetchResources();
  };

  const getResource = useCallback(
    (subject: string, chapter: string) => {
      return resources.find((r) => r.subject === subject && r.chapter === chapter);
    },
    [resources]
  );

  return {
    resources,
    loading,
    saveResource,
    deleteResource,
    getResource,
    refetch: fetchResources,
  };
};
