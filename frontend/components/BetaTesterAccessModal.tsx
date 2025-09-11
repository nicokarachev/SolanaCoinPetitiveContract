"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { RadixAlertDialog } from "./AlertDialog";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function BetaTesterAccessModal({
  username,
  email,
  userId,
  onClose,
  onApproved,
}: {
  username: string;
  email: string;
  userId: string;
  onClose: () => void;
  onApproved?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await createClient().auth.getSession();

      const token = session?.access_token;

      const res = await fetch("/api/grant-beta-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to grant beta access.");
      }

      toast.success(`${username} is now a Beta Tester!`);

      if (onApproved) onApproved();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">
            Approve New Beta Tester Access
          </h2>
          <p className="mb-2">
            <strong>Username:</strong> {username}
          </p>
          <p className="mb-2">
            <strong>Email:</strong> {email}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-lime-700"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Approving..." : "Approve Access"}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Dialog */}
      {showError && (
        <RadixAlertDialog
          open={showError}
          onOpenChange={setShowError}
          title="Error Approving Beta Tester"
          description={errorMsg}
          onConfirm={() => setShowError(false)}
          onCancel={() => setShowError(false)}
        />
      )}
    </>
  );
}
