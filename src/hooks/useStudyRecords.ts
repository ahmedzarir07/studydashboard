import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Status } from "@/types/tracker";

interface StudyRecord {
  id: string;
  user_id: string;
  subject: string;
  chapter: string;
  activity: string;
  type: "status" | "class_number";
  status: Status | null;
  class_number: number | null;
  created_at: string;
  updated_at: string;
}

type SaveStatusInput = {
  chapter: string;
  activity: string;
  status: Status;
};

type SaveClassNumberInput = {
  chapter: string;
  classNumber: number | null;
};

const getNaturalKey = (r: Pick<StudyRecord, "subject" | "chapter" | "activity" | "type">) => {
  return `${r.subject}__${r.chapter}__${r.activity}__${r.type}`;
};

export const useStudyRecords = (subjectId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["study_records", user?.id ?? null, subjectId] as const, [
    user?.id,
    subjectId,
  ]);

  const {
    data: records = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    enabled: !!user && !!subjectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_records")
        .select("*")
        .eq("user_id", user!.id)
        .eq("subject", subjectId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data as StudyRecord[]) ?? [];
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const saveStatusMutation = useMutation({
    mutationFn: async ({ chapter, activity, status }: SaveStatusInput) => {
      if (!user) throw new Error("Not authenticated");

      const nowIso = new Date().toISOString();

      const { data: updatedRows, error: updateError } = await supabase
        .from("study_records")
        .update({ status, updated_at: nowIso })
        .match({
          user_id: user.id,
          subject: subjectId,
          chapter,
          activity,
          type: "status",
        })
        .select("*");

      if (updateError) throw updateError;

      if (updatedRows && updatedRows.length > 0) {
        return updatedRows[0] as StudyRecord;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("study_records")
        .insert({
          user_id: user.id,
          subject: subjectId,
          chapter,
          activity,
          type: "status",
          status,
        })
        .select("*")
        .single();

      if (insertError) throw insertError;
      return inserted as StudyRecord;
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = (queryClient.getQueryData(queryKey) as StudyRecord[]) ?? [];

      const optimistic: StudyRecord = {
        id: `temp_${Date.now()}`,
        user_id: user?.id ?? "",
        subject: subjectId,
        chapter: vars.chapter,
        activity: vars.activity,
        type: "status",
        status: vars.status,
        class_number: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const key = getNaturalKey(optimistic);
      const next = previous.some((r) => getNaturalKey(r) === key)
        ? previous.map((r) => (getNaturalKey(r) === key ? { ...r, status: vars.status } : r))
        : [...previous, optimistic];

      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },
    onSuccess: (serverRow) => {
      const current = (queryClient.getQueryData(queryKey) as StudyRecord[]) ?? [];
      const serverKey = getNaturalKey(serverRow);

      const merged = current
        .filter((r) => !(r.id.startsWith("temp_") && getNaturalKey(r) === serverKey))
        .map((r) => (getNaturalKey(r) === serverKey ? serverRow : r));

      // If it didn't exist at all, add it.
      if (!merged.some((r) => getNaturalKey(r) === serverKey)) {
        merged.push(serverRow);
      }

      queryClient.setQueryData(queryKey, merged);
    },
  });

  const saveClassNumberMutation = useMutation({
    mutationFn: async ({ chapter, classNumber }: SaveClassNumberInput) => {
      if (!user) throw new Error("Not authenticated");

      const nowIso = new Date().toISOString();

      const { data: updatedRows, error: updateError } = await supabase
        .from("study_records")
        .update({ class_number: classNumber, updated_at: nowIso })
        .match({
          user_id: user.id,
          subject: subjectId,
          chapter,
          activity: "Total Lec",
          type: "class_number",
        })
        .select("*");

      if (updateError) throw updateError;

      if (updatedRows && updatedRows.length > 0) {
        return updatedRows[0] as StudyRecord;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("study_records")
        .insert({
          user_id: user.id,
          subject: subjectId,
          chapter,
          activity: "Total Lec",
          type: "class_number",
          class_number: classNumber,
        })
        .select("*")
        .single();

      if (insertError) throw insertError;
      return inserted as StudyRecord;
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = (queryClient.getQueryData(queryKey) as StudyRecord[]) ?? [];

      const optimistic: StudyRecord = {
        id: `temp_${Date.now()}`,
        user_id: user?.id ?? "",
        subject: subjectId,
        chapter: vars.chapter,
        activity: "Total Lec",
        type: "class_number",
        status: null,
        class_number: vars.classNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const key = getNaturalKey(optimistic);
      const next = previous.some((r) => getNaturalKey(r) === key)
        ? previous.map((r) => (getNaturalKey(r) === key ? { ...r, class_number: vars.classNumber } : r))
        : [...previous, optimistic];

      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },
    onSuccess: (serverRow) => {
      const current = (queryClient.getQueryData(queryKey) as StudyRecord[]) ?? [];
      const serverKey = getNaturalKey(serverRow);

      const merged = current
        .filter((r) => !(r.id.startsWith("temp_") && getNaturalKey(r) === serverKey))
        .map((r) => (getNaturalKey(r) === serverKey ? serverRow : r));

      if (!merged.some((r) => getNaturalKey(r) === serverKey)) {
        merged.push(serverRow);
      }

      queryClient.setQueryData(queryKey, merged);
    },
  });

  const saveStatus = useCallback(
    async (chapter: string, activity: string, status: Status) => {
      if (!user) return;
      await saveStatusMutation.mutateAsync({ chapter, activity, status });
    },
    [user, saveStatusMutation]
  );

  const saveClassNumber = useCallback(
    async (chapter: string, classNumber: number | null) => {
      if (!user) return;
      await saveClassNumberMutation.mutateAsync({ chapter, classNumber });
    },
    [user, saveClassNumberMutation]
  );

  // Mark all activities in a chapter as Done
  const markAllChapterActivitiesDone = useCallback(
    async (chapterName: string, activities: string[]) => {
      if (!user) return;
      
      const nowIso = new Date().toISOString();
      const activitiesToUpdate = activities.filter(a => a !== "Total Lec");
      
      // Batch upsert all activities as Done
      const upsertData = activitiesToUpdate.map(activity => ({
        user_id: user.id,
        subject: subjectId,
        chapter: chapterName,
        activity,
        type: "status" as const,
        status: "Done" as Status,
        updated_at: nowIso,
      }));
      
      const { error } = await supabase
        .from("study_records")
        .upsert(upsertData, { 
          onConflict: "user_id,subject,chapter,activity,type",
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error("Failed to mark all activities done:", error);
        return;
      }
      
      // Refetch to update local state
      await refetch();
    },
    [user, subjectId, refetch]
  );

  // Reset all activities in a chapter to Not Started (0%)
  const resetAllChapterActivities = useCallback(
    async (chapterName: string, activities: string[]) => {
      if (!user) return;
      
      const activitiesToReset = activities.filter(a => a !== "Total Lec");
      
      // Delete all status records for this chapter to reset to 0%
      const { error } = await supabase
        .from("study_records")
        .delete()
        .eq("user_id", user.id)
        .eq("subject", subjectId)
        .eq("chapter", chapterName)
        .eq("type", "status")
        .in("activity", activitiesToReset);
      
      if (error) {
        console.error("Failed to reset activities:", error);
        return;
      }
      
      // Refetch to update local state
      await refetch();
    },
    [user, subjectId, refetch]
  );

  const getStatus = useCallback(
    (chapter: string, activity: string): Status => {
      const record = records.find(
        (r) => r.chapter === chapter && r.activity === activity && r.type === "status"
      );
      return (record?.status as Status) || "";
    },
    [records]
  );

  const getClassNumber = useCallback(
    (chapter: string): string => {
      const record = records.find(
        (r) => r.chapter === chapter && r.activity === "Total Lec" && r.type === "class_number"
      );
      return record?.class_number?.toString() || "";
    },
    [records]
  );

  return {
    records,
    loading: isLoading || isFetching,
    saveStatus,
    saveClassNumber,
    markAllChapterActivitiesDone,
    resetAllChapterActivities,
    getStatus,
    getClassNumber,
    refetch,
  };
};

