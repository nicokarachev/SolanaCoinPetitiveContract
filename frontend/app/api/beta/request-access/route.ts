import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { userId } = await req.json();

  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, email, pubkey, role")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { success: false, error: "User not found." },
      { status: 404 },
    );
  }

  const { data: existing } = await supabase
    .from("beta_testers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { success: false, error: "Request already submitted." },
      { status: 400 },
    );
  }

  const { error: insertError } = await supabase.from("beta_testers").insert({
    user_id: user.id,
    username: user.username,
    email: user.email,
    pubkey: user.pubkey,
    role: user.role,
    is_approved: false,
    approve_date: new Date().toISOString(),
  });

  if (insertError) {
    return NextResponse.json(
      { success: false, error: insertError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
