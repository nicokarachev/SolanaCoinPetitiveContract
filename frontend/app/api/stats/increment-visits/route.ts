import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";


export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient(); // if your util expects cookies(), call it accordingly

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return NextResponse.json(
      { success: false, error: sessionError.message },
      { status: 500 }
    );
  }

  if (session) {
    return NextResponse.json({ success: false, reason: "authenticated" });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  const path = new URL(req.url).searchParams.get("path") ?? "unknown";

  const { error: insertError } = await supabase.from("anon_visits").insert({
    ip,
    ua,
    path,
    occurred_at: new Date().toISOString(),
  });

  if (insertError) {
    return NextResponse.json(
      { success: false, error: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}