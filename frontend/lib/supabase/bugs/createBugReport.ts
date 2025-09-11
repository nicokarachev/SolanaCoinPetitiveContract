/**
 * Creates a new bug report in the admin_bug_reports table.
 * @param bug_content - The detailed description of the bug.
 * @param created_at - The timestamp when the bug report was created.
 * @param username - The username of the user reporting the bug.
 * @param pubkey - The public key of the user reporting the bug.
 * @param email - The email of the user reporting the bug.
 * @returns The created bug report data or null if there was an error.
 */
import { createClient } from "@/utils/supabase/server";

export async function createBugReport({
  bug_content,
  username,
  email,
  pubkey,
}: {
  bug_content: string;
  username: string;
  email: string;
  pubkey: string;
}) {
  const time = () => new Date().toISOString();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bug_report_reward")
    .insert([{ bug_content, created_at: time(), username, email, pubkey }])
    .select()
    .single();

  if (error) {
    console.error("❌ Supabase insert failed:", error);
    return null;
  }
  return data;
}
