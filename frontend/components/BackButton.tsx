"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      className="mt-4 px-6 py-3 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}
