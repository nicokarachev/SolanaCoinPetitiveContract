import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendBugClosedEmail } from "@/utils/email/bugNotifications";
import { logError } from "@/lib/supabase/logError"; // ✅ custom logger

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      await logError({
        message: "Missing token in bug removal request",
        category: "auth",
      });
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      await logError({
        message: "Unauthorized user attempt on bug removal",
        category: "auth",
        context: { userError },
      });
      return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      await logError({
        message: "Non-admin attempted to remove bug report",
        category: "auth",
        context: { userId: user.id, role: profile?.role },
      });
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    // Get request body
    const { bugId, reason, email, username, bugDescription } = await req.json();

    if (!bugId || !reason || !email || !username || !bugDescription) {
      await logError({
        message: "Missing fields in bug removal request",
        category: "bug-report",
        context: { bugId, reason, email, username, bugDescription },
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Log removal to audit table
    const { error: insertError } = await supabase
      .from("bug_removal_logs")
      .insert({
        bug_id: bugId,
        removed_by: user.id,
        reason,
        email,
        username,
      });

    if (insertError) {
      await logError({
        message: "Failed to log bug removal",
        category: "bug-report",
        context: { insertError, bugId, userId: user.id },
      });
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    // Delete from main bug table
    const { error: deleteError } = await supabase
      .from("bug_report_reward")
      .delete()
      .eq("uuid_id", bugId);

    if (deleteError) {
      await logError({
        message: "Failed to delete bug report",
        category: "bug-report",
        context: { deleteError, bugId },
      });
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    // Send notification email
    await sendBugClosedEmail({ email, username, bugDescription });

    // Log success (optional)
    await logError({
      message: "Bug successfully removed and user notified",
      level: "info",
      category: "bug-report",
      context: { bugId, removedBy: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    await logError({
      message: "Unexpected server error during bug removal",
      category: "system",
      context: {
        error: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : null,
      },
    });

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
