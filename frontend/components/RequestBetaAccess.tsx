"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser"; // Replaces getUserFromStorage
import { logError } from "@/lib/supabase/logError";
import { RadixAlertDialog } from "./AlertDialog";

export default function RequestBetaAccess() {
  const { user, loading } = useUser();
  const [requested, setRequested] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (
    loading ||
    !user ||
    user.role === "beta-tester" ||
    user.role === "admin"
  ) {
    return null;
  }

  const handleRequest = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/beta/request-access", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const result: { success: boolean; error?: string } = await res.json();
      if (res.ok && result.success) {
        toast.success("Request submitted!");
        setRequested(true);
      } else {
        toast.error(result.error || "Something went wrong.");
        await logError({
          message: "Beta access request failed",
          context: { userId: user.id, error: result.error },
          category: "beta-access",
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(errorMessage);
      await logError({
        message: "Exception in handleRequest",
        context: { userId: user.id, error: errorMessage },
        category: "beta-access",
      });
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  if (requested) {
    return <p className="text-green-600">✅ Beta access request submitted!</p>;
  }

  return (
    <div className="my-4">
      <Button
        className="bg-blue-600"
        disabled={isSubmitting}
        onClick={() => setIsDialogOpen(true)}
      >
        {isSubmitting ? "Submitting..." : "Request Beta Tester Access"}
      </Button>

      <RadixAlertDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Confirm Beta Access Request"
        description="Do you want to request beta tester access for your account?"
        onConfirm={handleRequest}
        onCancel={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
