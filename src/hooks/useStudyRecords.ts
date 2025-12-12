import { useState, useEffect, useCallback } from "react";
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

export const useStudyRecords = (subjectId: string) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial records
  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const fetchRecords = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("study_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject", subjectId);

      if (error) {
        console.error("Error fetching records:", error);
      } else {
        setRecords(data as StudyRecord[]);
      }
      setLoading(false);
    };

    fetchRecords();
  }, [user, subjectId]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`study_records_${user.id}_${subjectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "study_records",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Real-time update:", payload);
          
          if (payload.eventType === "INSERT") {
            const newRecord = payload.new as StudyRecord;
            if (newRecord.subject === subjectId) {
              setRecords((prev) => [...prev, newRecord]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedRecord = payload.new as StudyRecord;
            if (updatedRecord.subject === subjectId) {
              setRecords((prev) =>
                prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
              );
            }
          } else if (payload.eventType === "DELETE") {
            const deletedRecord = payload.old as StudyRecord;
            setRecords((prev) => prev.filter((r) => r.id !== deletedRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, subjectId]);

  // Save or update a status record
  const saveStatus = useCallback(
    async (chapter: string, activity: string, status: Status) => {
      if (!user) return;

      const existingRecord = records.find(
        (r) => r.chapter === chapter && r.activity === activity && r.type === "status"
      );

      if (existingRecord) {
        const { error } = await supabase
          .from("study_records")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", existingRecord.id);

        if (error) console.error("Error updating status:", error);
      } else {
        const { error } = await supabase.from("study_records").insert({
          user_id: user.id,
          subject: subjectId,
          chapter,
          activity,
          type: "status",
          status,
        });

        if (error) console.error("Error inserting status:", error);
      }
    },
    [user, subjectId, records]
  );

  // Save or update a class number record
  const saveClassNumber = useCallback(
    async (chapter: string, classNumber: number | null) => {
      if (!user) return;

      const existingRecord = records.find(
        (r) => r.chapter === chapter && r.activity === "Total Lec" && r.type === "class_number"
      );

      if (existingRecord) {
        const { error } = await supabase
          .from("study_records")
          .update({ class_number: classNumber, updated_at: new Date().toISOString() })
          .eq("id", existingRecord.id);

        if (error) console.error("Error updating class number:", error);
      } else {
        const { error } = await supabase.from("study_records").insert({
          user_id: user.id,
          subject: subjectId,
          chapter,
          activity: "Total Lec",
          type: "class_number",
          class_number: classNumber,
        });

        if (error) console.error("Error inserting class number:", error);
      }
    },
    [user, subjectId, records]
  );

  // Get status for a specific activity
  const getStatus = useCallback(
    (chapter: string, activity: string): Status => {
      const record = records.find(
        (r) => r.chapter === chapter && r.activity === activity && r.type === "status"
      );
      return (record?.status as Status) || "";
    },
    [records]
  );

  // Get class number for a chapter
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
    loading,
    saveStatus,
    saveClassNumber,
    getStatus,
    getClassNumber,
  };
};
