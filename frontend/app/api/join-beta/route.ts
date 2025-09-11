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

  try {
    const body = await req.json();
    const { name, email, wallet } = body;

    // Insert new beta signup
    const { error: insertError } = await supabase
      .from("join_beta")
      .insert([{ name, email, wallet }]);

    if (insertError) {
      // Handle unique constraint violations
      const msg = insertError.message.toLowerCase();
      if (msg.includes("join_beta_email_key")) {
        return NextResponse.json(
          { error: "You've already signed up with this email." },
          { status: 409 },
        );
      } else if (msg.includes("join_beta_wallet_key")) {
        return NextResponse.json(
          { error: "This wallet is already registered." },
          { status: 409 },
        );
      }

      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }

    // Increment stat count
    const { error: statError } = await supabase.rpc("increment_stat", {
      stat_name: "beta_signups",
    });

    if (statError) {
      console.error("Stat increment error:", statError);
      return NextResponse.json(
        { error: "Signup saved, but failed to update stats." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
