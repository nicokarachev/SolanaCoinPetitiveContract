"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamic import (no SSR)
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false },
);

export default function CoinLottie() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Delay hydration to avoid race conditions
    const timer = setTimeout(() => setShouldRender(true), 100); // 👈 adjust if needed
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;

  return (
    <Player
      autoplay
      loop
      src="/animations/lottiCoin.json"
      style={{ height: "100%", width: "100%" }}
      onEvent={(event) => {
        console.log("🎬 Lottie event:", event);
        if (event === "error") {
          console.error(
            "❌ Lottie encountered an error. Is the JSON path correct?",
          );
        }
      }}
    />
  );
}
