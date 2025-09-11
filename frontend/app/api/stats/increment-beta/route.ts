import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_stat", {
    stat_name: "beta_signups",
  });

  if (error) {
    console.error("[INCREMENT] Failed:", error);
    return NextResponse.json({ error: "Failed to increment" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
