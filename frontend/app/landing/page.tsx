"use client";

import CoinLottie from "@/components/CoinDrop";
import Footer from "@/components/Footer";
import WhyItMatters from "@/components/WhyItMatters";
import HowItWorks from "@/components/HowItWorks";
import dynamic from "next/dynamic";
const StatsDisplay = dynamic(() => import("@/components/StatsDisplay"), {
  ssr: false,
});

import { motion } from "framer-motion";
import VisitCounterTrigger from "@/components/VisitCounterTrigger";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SignInDialog } from "@/components/sign-in-dialog";
import MintDisplay from "@/components/MintDisplay";
import CPTTicker from "@/components/CPTTicker";

export default function Home() {
  const pathname = usePathname();
  const key = pathname;
  const router = useRouter();
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const openSignIn = () => setIsSignInOpen(true);

  const handleSignInSuccess = async () => {
    setIsSignInOpen(false);
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-background text-foreground" key={key}>
      <VisitCounterTrigger />
      <section className="min-h-screen flex flex-col md:flex-row items-center justify-center px-6 md:px-20 py-24 ">
        <div className="md:w-1/2 text-center md:text-left space-y-6 ">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            <div className="md:hidden w-32 h-32 mx-auto mb-4">
              <CoinLottie />
            </div>
            Post, Compete, Earn, <br /> No Luck, Just Skill.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-md"
          >
            Welcome to Coinpetitive, the first challenge-based social platform
            where fun goes viral and rewards are real. Take on trending
            challenges, earn crypto, and rise through the ranks — all powered by
            Solana for savage speed and near-zero fees. Think you got what it
            takes to go viral and get paid? Join the movement, and let’s make
            skill the new currency.
          </motion.p>
      
          <MintDisplay />
          <CPTTicker />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="">
              <button
                onClick={() => router.push("/signup")}
                className="mt-4 px-6 py-3 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                Try Coinpetitive
              </button>
              <button
                onClick={openSignIn}
                className="mt-4 ml-3 px-6 py-3 rounded outline outline-primary text-primary font-bold hover:outline-primary/40 hover:text-primary/40 transition"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="md:w-1/2 mt-10 md:mt-0 flex justify-center flex-col items-center"
        >
          <div className="hidden md:block w-64 h-64 mx-auto mb-4">
            <CoinLottie />
          </div>

          <StatsDisplay />
        </motion.div>
      </section>

      <WhyItMatters />
      <HowItWorks />
      <Footer />

      {/* Sign in dialog */}
      <SignInDialog
        open={isSignInOpen}
        onOpenChange={setIsSignInOpen}
        onSuccess={handleSignInSuccess}
      />
    </main>
  );
}
