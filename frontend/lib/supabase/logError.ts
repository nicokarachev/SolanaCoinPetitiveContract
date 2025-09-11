import { createClient } from "@/utils/supabase/client";

type LogLevel = "error" | "warn" | "info";

export async function logError({
  message,
  context = {},
  level = "error",
  category = "general",
}: {
  message: string;
  context?: Record<string, unknown>;
  level?: LogLevel;
  category?: string;
}) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("logs").insert([
      {
        level,
        category,
        message,
        context,
      },
    ]);

    if (error) {
      console.error("❌ Supabase logging failed:", error.message);
    }
  } catch (logErr) {
    console.error("❌ logError threw an exception:", logErr);
  }
}
