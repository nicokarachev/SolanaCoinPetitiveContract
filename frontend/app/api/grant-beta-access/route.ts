import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: { user: validUser }, error: validError } = await supabase.auth.getUser(token);
  if (validError || !validUser) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  console.log("Hello, ", validUser.email);

  const body = await req.json();
  const { userId } = body;

  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("id, username, email, pubkey, role")
    .eq("id", userId)
    .single();

  if (fetchError || !user) {
    return NextResponse.json(
      { success: false, error: "User not found or error fetching user" },
      { status: 404 },
    );
  }

  const { error: roleUpdateError } = await supabase
    .from("users")
    .update({ role: "beta-tester" })
    .eq("id", userId);

  if (roleUpdateError) {
    return NextResponse.json(
      { success: false, error: roleUpdateError.message },
      { status: 400 },
    );
  }

  const { error: insertError } = await supabase.from("beta_testers").upsert(
    {
      user_id: user.id,
      username: user.username,
      email: user.email,
      pubkey: user.pubkey,
      role: "beta-tester",
      is_approved: true,
      approve_date: new Date().toISOString(),
      revoke_date: null,
    },
    { onConflict: "user_id" },
  );

  if (insertError) {
    return NextResponse.json(
      { success: false, error: insertError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
