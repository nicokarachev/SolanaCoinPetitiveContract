import { createClient } from "@/utils/supabase/server";
import { logError } from "@/lib/supabase/logError";

export async function archiveBugAfterPayout({
  bugId,
  adminUsername,
}: {
  bugId: string;
  adminUsername: string;
}) {
  const supabase = await createClient();
  const { data: bug, error: bugFetchError } = await supabase
    .from("bug_report_reward")
    .select("*")
    .eq("uuid_id", bugId)
    .single();

  if (bugFetchError || !bug) {
    await logError({
      message: "Failed to fetch bug for archive",
      category: "payout",
      context: { bugId, error: bugFetchError?.message },
    });
    return;
  }

  // 2. Insert into paid_out_bugs
  const { error: insertError } = await supabase.from("paid_out_bugs").insert({
    original_bug_id: bug.uuid_id,
    bug_details: bug.bug_content,
    submitted_by: bug.username,
    paid_out_by: adminUsername,
    reported_at: bug.created_at,
    payout_at: new Date().toISOString(),
    reward_amount: bug.reward_amount,
  });

  if (insertError) {
    await logError({
      message: "Failed to archive bug into paid_out_bugs",
      category: "payout",
      context: { bugId, error: insertError.message },
    });
    return;
  }

  // 3. Delete from original table
  const { error: deleteError } = await supabase
    .from("bug_report_reward")
    .delete()
    .eq("uuid_id", bugId);

  if (deleteError) {
    await logError({
      message: "Failed to delete bug after payout archive",
      category: "payout",
      context: { bugId, error: deleteError.message },
    });
  }
}
