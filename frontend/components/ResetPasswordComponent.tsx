"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordComponent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const resetCode = searchParams.get("code"); // new Supabase flow

  useEffect(() => {
    if (!resetCode) {
      setError("Invalid reset link. Please request a new password reset.");
      setIsValidCode(false);
    } else {
      setIsValidCode(true);
    }
  }, [resetCode]);

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    return null;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode) return;

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Update user password using the one-time code
      const { data, error: updateError } = await createClient().auth.updateUser(
        { password },
        { token: resetCode } // <-- this is key
      );

      if (updateError) throw updateError;

      setIsSuccess(true);
      setMessage("Password updated successfully! Redirecting...");

      // Optionally store session tokens for immediate login
      if (data?.session) {
        const { access_token, refresh_token } = data.session;
        await createClient().auth.setSession({ access_token, refresh_token });
      }

      setTimeout(() => router.push("/"), 2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#b3731d] bg-opacity-10">
            <Lock className="h-6 w-6 text-[#b3731d]" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
            Reset Your Password
          </CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className={isSuccess ? "border-green-200 bg-green-50" : ""}>
                <CheckCircle className={`h-4 w-4 ${isSuccess ? "text-green-600" : ""}`} />
                <AlertDescription className={isSuccess ? "text-green-800" : ""}>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading || isSuccess} className="w-full bg-[#b3731d] hover:bg-[#b3731d]/90">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Password...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Password Updated!
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
