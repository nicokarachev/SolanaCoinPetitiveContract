export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createBugReport } from "@/lib/supabase/bugs/createBugReport";
import { sendBugReportReceivedEmail } from "@/utils/email/bugNotifications";
import { logError } from "@/lib/supabase/logError";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

    console.log("🐞 Incoming bug report body:", body);
    const { bug_content, username, email, pubkey } = body;

    console.log("📨 Sending bug email with:", {
      email,
      username,
      bugDescription: bug_content,
    });

    const bugData = await createBugReport({
      bug_content,
      username,
      email,
      pubkey,
    });

    if (!bugData) {
      console.error("❌ Failed to create bug report in DB.");
      return NextResponse.json(
        { error: "Failed to create bug report" },
        { status: 500 },
      );
    }

    try {
      await sendBugReportReceivedEmail({
        email,
        username,
        bugDescription: bug_content,
      });
    } catch (emailErr) {
      console.error("❌ Failed to send bug report email:", emailErr);
    }

    return NextResponse.json({ message: "Bug report submitted successfully" });
  } catch {
    await logError({
      message: "Invalid JSON body in payout request",
      context: { body: await req.text() },
      level: "error",
      category: "Bug Report",
    });

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
