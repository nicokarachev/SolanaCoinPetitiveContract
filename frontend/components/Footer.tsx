// components/Footer.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [year, setYear] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const atBottom = scrollTop + windowHeight >= docHeight - 10;
      setIsVisible(atBottom);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setYear(new Date().getFullYear());
    setMounted(true);
  }, []);

  const filterClass =
    mounted && resolvedTheme === "dark"
      ? "filter brightness-0 invert"
      : "filter";

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="bg-muted text-center text-sm py-6 text-muted-foreground"
    >
      <div className="flex justify-center space-x-6 mb-2">
        <a
          href="https://x.com/Coinpetitive"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
        >
          <Image
            src="/icons/x.svg"
            alt="X"
            width={24}
            height={24}
            style={{ width: "24px", height: "auto" }}
            className={`transition hover:opacity-80 ${filterClass}`}
            priority
          />
        </a>
        <a
          href="https://tiktok.com/@coinpetitive"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
        >
          <Image
            src="/icons/tiktok.svg"
            alt="TikTok"
            width={24}
            height={24}
            style={{ width: "24px", height: "auto" }}
            className={`transition hover:opacity-80 ${filterClass}`}
            priority
          />
        </a>
      </div>
      {year && <p>&copy; {year} Coinpetitive. All rights reserved.</p>}
    </motion.footer>
  );
}
