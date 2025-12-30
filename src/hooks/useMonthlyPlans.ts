import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export interface MonthlyPlan {
  id: string;
  user_id: string;
  month_year: string;
  subject: string;
  chapter: string;
  planned_activities: string[];
  goals: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useMonthlyPlans = (monthYear?: string) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const currentMonth = monthYear || format(new Date(), "yyyy-MM");

  const fetchPlans = useCallback(async () => {
    if (!user) {
      setPlans([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("monthly_study_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("month_year", currentMonth);

    if (!error && data) {
      setPlans(data as MonthlyPlan[]);
    }
    setLoading(false);
  }, [user, currentMonth]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const savePlan = async (
    subject: string,
    chapter: string,
    plannedActivities: string[],
    goals?: string,
    notes?: string
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from("monthly_study_plans")
      .upsert(
        {
          user_id: user.id,
          month_year: currentMonth,
          subject,
          chapter,
          planned_activities: plannedActivities,
          goals: goals || null,
          notes: notes || null,
        },
        { onConflict: "user_id,month_year,subject,chapter" }
      );

    if (!error) {
      fetchPlans();
    }
    return error;
  };

  const deletePlan = async (subject: string, chapter: string) => {
    if (!user) return;

    await supabase
      .from("monthly_study_plans")
      .delete()
      .eq("user_id", user.id)
      .eq("month_year", currentMonth)
      .eq("subject", subject)
      .eq("chapter", chapter);

    fetchPlans();
  };

  const getPlan = useCallback(
    (subject: string, chapter: string) => {
      return plans.find((p) => p.subject === subject && p.chapter === chapter);
    },
    [plans]
  );

  const getSubjectPlans = useCallback(
    (subject: string) => {
      return plans.filter((p) => p.subject === subject);
    },
    [plans]
  );

  return {
    plans,
    loading,
    savePlan,
    deletePlan,
    getPlan,
    getSubjectPlans,
    refetch: fetchPlans,
    currentMonth,
  };
};
