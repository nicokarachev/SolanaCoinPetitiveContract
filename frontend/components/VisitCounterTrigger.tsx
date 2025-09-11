"use client";
import { useEffect } from "react";
import { logError } from "@/lib/supabase/logError";

/**
 * Sends a single ping on mount; server decides whether to count.
 * @returns {null}
 */
const VisitCounterTrigger: React.FC = () => {
  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/stats/increment-visits", { method: "POST" });
      } catch (err) {
        await logError({
          level: "info",
          context: {},
          category: "API",
          message: `Visit ping failed: ${String(err)}`,
        });
      }
    })();
  }, []);

  return null;
};

export default VisitCounterTrigger;
