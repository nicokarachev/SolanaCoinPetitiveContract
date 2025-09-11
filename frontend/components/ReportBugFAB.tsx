"use client";
import { useEffect, useState } from "react";
import { Bug } from "lucide-react";
import { getCurrentUserRole } from "@/utils/auth/getCurrentUserRole";

export default function ReportBugFAB({ onClick }: { onClick: () => void }) {
  const [showFAB, setShowFAB] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const role = await getCurrentUserRole();
      if (role === "admin" || role === "beta-tester") {
        setShowFAB(true);
      }
    };
    checkRole();
  }, []);

  if (!showFAB) return null;

  return (
    <button
      onClick={onClick}
      aria-label="Report Bug"
      className="
        group
        fixed bottom-4 right-4 z-50
        items-center justify-center
        w-12 h-12
        bg-blue-500 text-white rounded-full shadow-lg
        transition-all duration-300
        hover:w-auto hover:px-4 hover:rounded-lg hover:bg-blue-600
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        hidden sm:flex
      "
    >
      <Bug className="w-5 h-5 flex-shrink-0" />
      <span className="hidden ml-2 whitespace-nowrap group-hover:block">
        Report&nbsp;Bug
      </span>
    </button>
  );
}
