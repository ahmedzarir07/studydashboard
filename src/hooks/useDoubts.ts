import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Doubt {
  id: string;
  user_id: string;
  subject: string;
  chapter: string | null;
  question: string;
  image_url: string | null;
  is_resolved: boolean;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
  answer_count: number;
  like_count: number;
  user_liked: boolean;
}

export interface DoubtAnswer {
  id: string;
  doubt_id: string;
  user_id: string;
  answer_text: string;
  image_url: string | null;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
  vote_count: number;
  user_voted: boolean;
}

export function useDoubts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "most_answers">("newest");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch doubts
      const { data: doubtsData, error } = await supabase
        .from("doubts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch answer counts
      const { data: answersData } = await supabase
        .from("doubt_answers")
        .select("doubt_id");

      // Fetch likes
      const { data: likesData } = await supabase
        .from("doubt_likes")
        .select("doubt_id, user_id");

      // Fetch profiles for display names
      const userIds = [...new Set((doubtsData || []).map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds.length > 0 ? userIds : ["none"]);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url }])
      );

      const answerCountMap = new Map<string, number>();
      (answersData || []).forEach(a => {
        answerCountMap.set(a.doubt_id, (answerCountMap.get(a.doubt_id) || 0) + 1);
      });

      const likeCountMap = new Map<string, number>();
      const userLikeSet = new Set<string>();
      (likesData || []).forEach(l => {
        likeCountMap.set(l.doubt_id, (likeCountMap.get(l.doubt_id) || 0) + 1);
        if (user && l.user_id === user.id) userLikeSet.add(l.doubt_id);
      });

      const enriched: Doubt[] = (doubtsData || []).map(d => ({
        ...d,
        profile: profileMap.get(d.user_id) || { display_name: null, avatar_url: null },
        answer_count: answerCountMap.get(d.id) || 0,
        like_count: likeCountMap.get(d.id) || 0,
        user_liked: userLikeSet.has(d.id),
      }));

      setDoubts(enriched);
    } catch (err: any) {
      toast({ title: "Error loading doubts", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    fetchDoubts();

    const channel = supabase
      .channel("doubts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "doubts" }, () => fetchDoubts())
      .on("postgres_changes", { event: "*", schema: "public", table: "doubt_answers" }, () => fetchDoubts())
      .on("postgres_changes", { event: "*", schema: "public", table: "doubt_likes" }, () => fetchDoubts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDoubts]);

  const createDoubt = async (subject: string, question: string, chapter?: string, imageUrl?: string) => {
    if (!user) return;
    const { error } = await supabase.from("doubts").insert({
      user_id: user.id,
      subject,
      question,
      chapter: chapter || null,
      image_url: imageUrl || null,
    });
    if (error) {
      toast({ title: "Error posting doubt", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Doubt posted!" });
    }
  };

  const deleteDoubt = async (doubtId: string) => {
    const { error } = await supabase.from("doubts").delete().eq("id", doubtId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const reportDoubt = async (doubtId: string) => {
    if (!user) return;
    const { error } = await supabase.from("doubt_reports").insert({
      user_id: user.id,
      doubt_id: doubtId,
      reason: "inappropriate",
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Reported", description: "Thank you for reporting." });
  };

  const toggleDoubtLike = async (doubtId: string, currentlyLiked: boolean) => {
    if (!user) return;
    if (currentlyLiked) {
      await supabase.from("doubt_likes").delete().eq("doubt_id", doubtId).eq("user_id", user.id);
    } else {
      await supabase.from("doubt_likes").insert({ doubt_id: doubtId, user_id: user.id });
    }
    fetchDoubts();
  };

  // Filtered & sorted
  const filteredDoubts = doubts
    .filter(d => filterSubject === "all" || d.subject === filterSubject)
    .sort((a, b) => {
      if (sortBy === "most_answers") return b.answer_count - a.answer_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return {
    doubts: filteredDoubts,
    loading,
    createDoubt,
    deleteDoubt,
    reportDoubt,
    toggleDoubtLike,
    sortBy,
    setSortBy,
    filterSubject,
    setFilterSubject,
    refetch: fetchDoubts,
  };
}

export function useDoubtAnswers(doubtId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<DoubtAnswer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnswers = useCallback(async () => {
    if (!doubtId) return;
    setLoading(true);
    try {
      const { data: answersData, error } = await supabase
        .from("doubt_answers")
        .select("*")
        .eq("doubt_id", doubtId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles
      const userIds = [...new Set((answersData || []).map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds.length > 0 ? userIds : ["none"]);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url }])
      );

      // Fetch votes
      const answerIds = (answersData || []).map(a => a.id);
      const { data: votesData } = await supabase
        .from("doubt_votes")
        .select("answer_id, user_id")
        .in("answer_id", answerIds.length > 0 ? answerIds : ["none"]);

      const voteCountMap = new Map<string, number>();
      const userVoteSet = new Set<string>();
      (votesData || []).forEach(v => {
        voteCountMap.set(v.answer_id, (voteCountMap.get(v.answer_id) || 0) + 1);
        if (user && v.user_id === user.id) userVoteSet.add(v.answer_id);
      });

      const enriched: DoubtAnswer[] = (answersData || []).map(a => ({
        ...a,
        profile: profileMap.get(a.user_id) || { display_name: null, avatar_url: null },
        vote_count: voteCountMap.get(a.id) || 0,
        user_voted: userVoteSet.has(a.id),
      }));

      setAnswers(enriched);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [doubtId, user, toast]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  const postAnswer = async (answerText: string, imageUrl?: string) => {
    if (!user || !doubtId) return;
    const { error } = await supabase.from("doubt_answers").insert({
      doubt_id: doubtId,
      user_id: user.id,
      answer_text: answerText,
      image_url: imageUrl || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Answer posted!" });
      fetchAnswers();
    }
  };

  const toggleVote = async (answerId: string, currentlyVoted: boolean) => {
    if (!user) return;
    if (currentlyVoted) {
      await supabase.from("doubt_votes").delete().eq("answer_id", answerId).eq("user_id", user.id);
    } else {
      await supabase.from("doubt_votes").insert({ answer_id: answerId, user_id: user.id });
    }
    fetchAnswers();
  };

  const deleteAnswer = async (answerId: string) => {
    await supabase.from("doubt_answers").delete().eq("id", answerId);
    fetchAnswers();
  };

  const reportAnswer = async (answerId: string) => {
    if (!user) return;
    await supabase.from("doubt_reports").insert({
      user_id: user.id,
      answer_id: answerId,
      reason: "inappropriate",
    });
    toast({ title: "Reported" });
  };

  return { answers, loading, postAnswer, toggleVote, deleteAnswer, reportAnswer, refetch: fetchAnswers };
}
