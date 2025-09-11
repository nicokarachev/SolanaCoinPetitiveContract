import { createClient } from "@/utils/supabase/client";

/**
 * Fetches the current user's role from the public.users table.
 * @returns The user's role (e.g., "admin", "user", "beta tester"), or null if not found.
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error(
      "User not authenticated or error retrieving user:",
      authError,
    );
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    return null;
  }

  return profile?.role ?? null;
}
