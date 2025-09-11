import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Count rows in `visits` table
  const { count: visitCount, error: visitError } = await supabase
    .from("stats")
    .select("*", { count: "exact", head: true });

  if (visitError) {
    console.error("[GET /api/visits] Count error:", visitError);
    return NextResponse.json(
      { error: "Failed to count visits" },
      { status: 500 },
    );
  }

  // Fetch the beta and notify signups from `stats`
  const { data, error: statsError } = await supabase
    .from("stats")
    .select("beta_signups, notify_signups")
    .limit(1)
    .single();

  if (statsError) {
    console.error("[GET /api/visits] Stats error:", statsError);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    visits: visitCount ?? 0,
    betaSignups: data.beta_signups ?? 0,
    notifySignups: data.notify_signups ?? 0,
  });
}
