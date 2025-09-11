import { createClient } from "@/utils/supabase/client";
const supabase = await createClient();
/**
 * Fetches all flagged submissions with video, challenge, and user info.
 */
export async function fetchFlaggedSubmissions() {
  const { data, error } = await supabase
    .from("admin_flagged_submissions")
    .select("*");

  if (error) {
    console.error("Error fetching flagged submissions:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Fetches all beta tester bug reports with reporter info.
 */
export const fetchBugReports = async () => {
  const { data, error } = await supabase.from("admin_bug_reports").select("*");

  if (error) {
    console.error("Error fetching bug reports:", error.message);
    return [];
  }

  console.log("Bug reports data:", data);
  return data || [];
};

export async function fetchBetaTesterRequests() {
  const { data, error } = await supabase
    .from("beta_testers")
    .select("*")
    .eq("is_approved", false)
    .order("approve_date", { ascending: false });

  if (error) {
    console.error("Error fetching beta tester requests:", error.message);
    return [];
  }

  return data;
}
