import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/server";

export function useSupabaseToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const supabase = await createClient();
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        setToken(data.session.access_token);
      } else {
        console.warn("No session found or user not signed in");
      }
    };
    getToken();
  }, []);

  return token;
}
