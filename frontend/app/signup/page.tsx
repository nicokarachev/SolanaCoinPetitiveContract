"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { signUp } from "@/lib/supabase";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import confetti from "canvas-confetti";

// ⬇️ Import your T&C content component
import CoinpetitiveTermsAndConditions from "@/components/CoinpetitiveTermsAndConditions";

export default function SignUp() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    xProfile: "",
    telegram: "",
    pubkey: "",
    secretCode: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // signup success modal

  // ⬇️ New: Terms & Conditions state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTosModal, setShowTosModal] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      setFormData((prev) => ({
        ...prev,
        pubkey: publicKey.toString(),
      }));
    }
  }, [connected, publicKey]);

  useEffect(() => {
    if (showModal) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
      confetti({ particleCount: 100, spread: 110, origin: { y: 0.6 } });
    }
  }, [showModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleWalletConnect = () => {
    setError("");
    setVisible(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (!formData.pubkey) {
      setError("Please connect your wallet to continue");
      setIsLoading(false);
      return;
    }
    if (!/^\d{4}$/.test(formData.secretCode)) {
      setError("Please enter a 4-digit secret recovery code");
      setIsLoading(false);
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the Terms & Conditions to continue");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp({ ...formData });
      if (result.success) {
        setShowModal(true);
      } else {
        const msg = result.error || "An unexpected error occurred";
        if (msg.includes("User already registered")) {
          setError("This email is already registered. Please sign in.");
        } else if (msg.includes("Invalid email")) {
          setError("Please enter a valid email address.");
        } else if (msg.includes("Password should be at least")) {
          setError("Password is too weak. Please choose a stronger one.");
        } else {
          setError(msg);
        }
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err.message as string)
          : "An unexpected error occurred";
      if (msg.includes("User already registered")) {
        setError("This email is already registered. Please sign in.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Signup success modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 text-center max-w-sm mx-auto">
            <p className="mb-4 text-lg font-semibold">
              Thanks for signing up. Check your email to confirm your account.
            </p>
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </div>
      )}

      {showTosModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tos-title"
        >
          {/* Modal container */}
          <div className="bg-white rounded-xl shadow-xl w-[95vw] max-w-3xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
              <h2 id="tos-title" className="text-lg font-semibold">
                Terms & Conditions
              </h2>
              <button
                onClick={() => setShowTosModal(false)}
                aria-label="Close terms modal"
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="px-4 py-4 flex-1 overflow-y-auto overscroll-contain [--tw-pan-y:y] [-webkit-overflow-scrolling:touch]">
              <CoinpetitiveTermsAndConditions />
            </div>

            {/* Footer */}
            <div className="border-t px-4 py-3 flex items-center justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={() => setShowTosModal(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTosModal(false);
                }}
              >
                Accept & Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`min-h-screen ${showModal || showTosModal ? "blur-sm" : ""}`}
      >
        <main className="flex justify-center px-4 py-6 sm:py-12">
          <div className="w-full max-w-[500px]">
            <div className="w-full bg-white rounded-[20px] sm:rounded-[30px] shadow-lg border-2 border-[#b3731d] p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-center mb-4">
                Create Account
              </h1>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-4"
              >
                {/* Avatar Upload */}
                <div className="col-span-1 sm:col-span-2 flex flex-col items-center mb-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#b3731d] overflow-hidden bg-gray-100 flex items-center justify-center">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleAvatarChange}
                      disabled
                    />
                  </div>
                  <span className="mt-2 text-xs sm:text-sm text-gray-500 text-center">
                    Please update avatar after sign up.
                  </span>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-sm">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    className="rounded-[50px] border-[#8a8a8a] h-10 text-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="rounded-[50px] border-[#8a8a8a] h-10 text-sm"
                    required
                  />
                </div>

                {/* X Profile */}
                <div className="space-y-1">
                  <Label htmlFor="xProfile" className="text-sm">
                    X Profile
                  </Label>
                  <Input
                    id="xProfile"
                    value={formData.xProfile}
                    onChange={handleInputChange}
                    placeholder="Enter your X profile"
                    className="rounded-[50px] border-[#8a8a8a] h-10 text-sm"
                  />
                </div>

                {/* Telegram */}
                <div className="space-y-1">
                  <Label htmlFor="telegram" className="text-sm">
                    Telegram
                  </Label>
                  <Input
                    id="telegram"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    placeholder="Enter your Telegram"
                    className="rounded-[50px] border-[#8a8a8a] h-10 text-sm"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="rounded-[50px] border-[#8a8a8a] h-10 text-sm"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <Label htmlFor="passwordConfirm" className="text-sm">
                    Confirm Password
                  </Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="rounded-[50px] border-[#8a8a8a] h-10 text-sm"
                    required
                  />
                </div>

                {/* Secret Recovery Code */}
                <div className="space-y-1">
                  <Label htmlFor="secretCode" className="text-sm">
                    Secret Recovery Code (4 digits)
                  </Label>
                  <Input
                    id="secretCode"
                    value={formData.secretCode}
                    onChange={handleInputChange}
                    placeholder="Enter a 4-digit code"
                    className="rounded-[50px] border-[#8a8a8a] h-10 text-sm"
                    maxLength={4}
                    pattern="\d{4}"
                    title="Please enter a 4-digit number"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Remember this code. You’ll need it to recover your account.
                  </p>
                </div>

                {/* Wallet Address */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <Label htmlFor="pubkey" className="text-sm">
                    Wallet Address
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="pubkey"
                      value={formData.pubkey}
                      placeholder="Connect your wallet"
                      className="rounded-[50px] border-[#8a8a8a] h-10 text-sm flex-grow"
                      disabled={connected}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pubkey: e.target.value,
                        }))
                      }
                      required
                    />
                    {!connected ? (
                      <Button
                        type="button"
                        className="bg-[#b3731d] hover:bg-[#b3731d]/90 h-10 text-sm"
                        onClick={handleWalletConnect}
                      >
                        Connect Wallet
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 text-sm"
                        onClick={disconnect}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                  {connected && publicKey && (
                    <p className="text-xs sm:text-sm text-green-600">
                      Wallet connected: {publicKey.toString().slice(0, 4)}...
                      {publicKey.toString().slice(-4)}
                    </p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="col-span-1 sm:col-span-2 text-red-500 text-center mt-1">
                    {error}
                  </div>
                )}

                <div className="col-span-1 sm:col-span-2 mt-1">
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      id="acceptTerms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-400"
                      required
                    />
                    <span className="text-gray-700">
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTosModal(true)}
                        className="text-[#b3731d] underline underline-offset-2 hover:opacity-90"
                      >
                        Terms &amp; Conditions
                      </button>
                      .{" "}
                      <span className="text-xs text-gray-500">
                        (Opens a preview —{" "}
                        <Link
                          href="/terms-and-conditions"
                          className="text-[#b3731d] underline"
                        >
                          view full page
                        </Link>
                        )
                      </span>
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <div className="col-span-1 sm:col-span-2 mt-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#b3731d] hover:bg-[#b3731d]/90 h-10 text-base"
                    disabled={isLoading || !termsAccepted}
                    aria-disabled={isLoading || !termsAccepted}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>

                {/* Sign in link */}
                <div className="col-span-1 sm:col-span-2 text-center mt-2">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                      href="/signin"
                      className="text-[#b3731d] hover:underline"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
