"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type {
  User as SupabaseAuthUser,
  RealtimeChannel,
} from "@supabase/supabase-js";

export interface Profile extends SupabaseAuthUser {
  role?: string;
  username?: string;
  avatar?: string;
  x_profile?: string; // match your DB column name
  telegram?: string;
  pubkey?: string;
}

export function useUser() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (!isMounted) return;

      if (profileError || !profile) {
        // fall back to auth user only
        setUser(authData.user as Profile);
      } else {
        setUser({ ...(authData.user as SupabaseAuthUser), ...profile });
      }
      setLoading(false);
    };

    fetchUser();

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      fetchUser();
    });

    const profileChannel: RealtimeChannel | null = null;

    return () => {
      isMounted = false;
      authSub?.unsubscribe();
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }
    };
  }, []);

  return { user, loading };
}
