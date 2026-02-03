import { supabase } from "@/integrations/supabase/client";

export type StudyStatusRecord = {
  subject: string;
  chapter: string;
  activity: string;
  status: string | null;
  updated_at: string;
};

type FetchOptions = {
  pageSize?: number;
  /** Safety cap to avoid accidental infinite/huge loops in case of bad/duplicated data */
  maxRows?: number;
};

/**
 * Fetches *all* status records for a user using pagination.
 * We order by updated_at DESC so we can dedupe later by taking the first occurrence per key.
 */
export async function fetchAllStudyStatusRecordsForUser(
  userId: string,
  options: FetchOptions = {}
): Promise<StudyStatusRecord[]> {
  const pageSize = options.pageSize ?? 1000;
  const maxRows = options.maxRows ?? 25000;

  const all: StudyStatusRecord[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("study_records")
      .select("subject, chapter, activity, status, updated_at")
      .eq("user_id", userId)
      .eq("type", "status")
      .order("updated_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;

    const page = (data as StudyStatusRecord[]) ?? [];
    all.push(...page);

    if (all.length >= maxRows) {
      // Hard stop to protect the client.
      return all.slice(0, maxRows);
    }

    if (page.length < pageSize) break;
    from += pageSize;
  }

  return all;
}
