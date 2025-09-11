"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { SignInDialog } from "./sign-in-dialog";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { UserAvatarMenu } from "./user-avatar-menu";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, UserPlus, Menu, X } from "lucide-react";
import { WalletConnection } from "./wallet-connection";
import ReportBugFAB from "./ReportBugFAB";
import DocsModal from "./DocsModal";
import { createClient } from "@/utils/supabase/client";

// ToDo: Add button to report a bug

export function Nav() {
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showReportSuccessModal, setShowReportSuccessModal] = useState(false);
  const [bugDescription, setBugDescription] = useState("");

  const handleBugSubmit = async () => {
    setShowReportSuccessModal(true);
    try {
      const {
        data: { session },
      } = await createClient().auth.getSession();

      const token = session?.access_token;
      const response = await fetch("/api/report-bug", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          bug_content: bugDescription,
          username: user?.username,
          email: user?.email,
          pubkey: user?.pubkey,
        }),
      });

      if (!response.ok) {
        console.error("Bug submission failed:", await response.text());
      }
    } catch (err) {
      console.error("❌ Bug submission error:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center w-full">
      <nav className="w-full">
        <div className="flex h-16 sm:h-20 items-center px-4 sm:px-8 container mx-auto">
          <Link href="/" className="flex items-center gap-2 sm:gap-4">
            <Image
              src={logo}
              alt="Coinpetitive Logo"
              width={36}
              height={36}
              className="w-8 h-8 sm:w-12 sm:h-12"
            />
            <span className="font-bold text-xl sm:text-2xl uppercase text-[#b3731d]">
              Coinpetitive
            </span>
          </Link>
          {/* Report Bug Button */}
          <ReportBugFAB onClick={() => setShowReportDialog(true)} />

          {showReportDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50  backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
                <FadeIn>
                  <h2 className="text-xl font-bold mb-4">Report a Bug</h2>
                  <p className="mb-4">
                    Please describe the issue you encountered:
                  </p>
                  <textarea
                    className="w-full h-32 p-2 border border-gray-300 rounded-md mb-4"
                    placeholder="Describe the bug..."
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowReportDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        handleBugSubmit();
                        setShowReportDialog(false);
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                </FadeIn>
              </div>
            </div>
          )}
          {/* Show confirmation of bug report with fade in animation blur */}
          {showReportSuccessModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50  backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-11/12 max-w-md text-center">
                <FadeIn>
                  <h2 className="text-2xl font-bold mb-4 text-primary">
                    Thank You!
                  </h2>
                  <h2 className="text-lg">
                    Your bug report has been submitted successfully.
                  </h2>
                  <h2 className="text-lg">We appreciate your feedback!</h2>
                  <p className="mt-4 text-sm italic text-gray-600">
                    We&apos;ll reach out using your registered email if we need
                    more information or when we have sent a payout
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowReportSuccessModal(false)}
                  >
                    Close
                  </Button>
                </FadeIn>
              </div>
            </div>
          )}
          {/* Mobile menu button */}
          <div className="flex sm:hidden w-full justify-end mr-6">
            <DocsModal />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
          {/* Desktop navigation */}
          <div className="hidden sm:flex ml-auto items-center space-x-4">
            <WalletConnection />
            <DocsModal />
            {user ? (
              <UserAvatarMenu
                user={{
                  username: user.username,
                  email: user.email,
                  avatarUrl: user.avatar,
                }}
                onSignOut={signOut}
              />
            ) : (
              <>
                <Button
                  onClick={() => setIsSignInOpen(true)}
                  className="font-bold"
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="font-bold hover:bg-transparent "
                    style={{ border: "2px solid #b3731d", color: "#b3731d" }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="px-4 py-4 sm:hidden bg-white border-t border-gray-200 shadow-md">
            {user ? (
              <div className="space-y-3">
                <div className="flex">
                  <WalletConnection />
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 relative">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-full h-full p-2 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Nav Items for Mobile Signed in  */}
                <Link
                  href="/profile"
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>

                <Link
                  href="/create-challenge"
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Challenge
                </Link>

                <Button
                  variant="ghost"
                  className="w-full justify-start font-normal hover:bg-gray-100 hover:text-red-600"
                  onClick={async () => {
                    await signOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              // Nav Items for Mobile Signed out
              <div className="space-y-3">
                <WalletConnection />
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsSignInOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="font-bold w-full mt-2"
                    style={{ border: "2px solid #b3731d", color: "#b3731d" }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Line separator */}
      <div className="w-[80%] h-[1px] bg-black mt-1" />

      {/* Sign in dialog */}
      <SignInDialog open={isSignInOpen} onOpenChange={setIsSignInOpen} />
    </div>
  );
}

function FadeIn({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
  }, []);
  return (
    <div
      className={visible ? "opacity-100" : "opacity-0"}
      style={{ transition: "opacity .5s" }}
    >
      {children}
    </div>
  );
}
