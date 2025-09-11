import { createClient } from "../supabase/client";
import type { Session } from "@supabase/supabase-js";

export async function getBrowserSession(): Promise<Session | null> {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
}

export async function hasBrowserSession(): Promise<boolean> {
    return (await getBrowserSession()) !== null;
}