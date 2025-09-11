import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("beta_signups")
    .select("*", { count: "exact", head: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count });
}
