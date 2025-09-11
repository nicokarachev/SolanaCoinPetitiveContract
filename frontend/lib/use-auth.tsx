"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  getCurrentUser,
  signIn as supabaseSignIn,
  signOut as supabaseSignOut,
  getAvatarImageUrl,
} from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";

type SignInResult =
  | { success: true; user: User }
  | { success: false; error: string };

type SignOutResult =
  | { success: true; warning?: string } // if you sometimes return a timeout warning
  | { success: false; error: string };
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<SignOutResult>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
AuthContext.displayName = "AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const {
          data: { user },
        } = await createClient().auth.getUser();

        if (!mounted) return;

        if (user) {
          const profile = await getCurrentUser();
          const enrichedUser =
            profile?.avatar !== null && profile?.avatar !== ""
              ? { ...profile, avatar: await getAvatarImageUrl(profile.avatar) }
              : profile;

          setUser(enrichedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Error restoring session:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<SignInResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await supabaseSignIn(email, password);

      if (result.success && result.user) {
        const avatarUrl =
          result.user.avatar !== null && result.user.avatar !== ""
            ? await getAvatarImageUrl(result.user.avatar)
            : null;
        const enrichedUser = avatarUrl
          ? { ...result.user, avatar: avatarUrl }
          : result.user;

        setUser(enrichedUser);
        return { success: true, user: enrichedUser };
      } else {
        setError(result.error || "Login failed");
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<SignOutResult> => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Logout timeout")), 5000),
      );

      await Promise.race([supabaseSignOut(), timeoutPromise]);

      setUser(null);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";

      setUser(null);
      if (errorMessage.includes("timeout")) {
        return {
          success: true,
          warning: "Logout completed (timeout fallback)",
        };
      }
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
