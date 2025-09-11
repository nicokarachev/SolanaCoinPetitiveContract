import { createClient } from "@/utils/supabase/server";

/**
 * Updates a bug report with reward payout info.
 * @param reward_amount - The actual CPT reward value (e.g. 2.5).
 * @param payout_datetime - The timestamp when the payout was made.
 * @param bugId - The UUID of the bug report.
 * @returns The updated bug report data or null if there was an error.
 */
export async function payoutBugReport({
  reward_amount,
  payout_datetime,
  bugId,
}: {
  reward_amount: number;
  payout_datetime: string;
  bugId: string;
}) {
  const supabase = await createClient();

  const { error: updateError, data } = await supabase
    .from("bug_report_reward")
    .update({
      reward_amount,
      payout_datetime,
    })
    .eq("uuid_id", bugId);

  if (updateError) {
    console.warn("❌ Bug reward update failed:", updateError.message);
    return null;
  }

  return data;
}
