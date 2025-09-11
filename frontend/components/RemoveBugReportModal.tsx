/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";

export default function RemoveBugModal({
  bugId,
  username,
  email,
  bugDescription,
  onClose,
  onRemoved,
}: {
  bugId: string;
  username: string;
  email: string;
  bugDescription: string;
  onClose: () => void;
  onRemoved: () => void;
}) {
  const [reason, setReason] = useState(
    "Admin chose not to reward this report.",
  );
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [confirmedModalShow, setConfirmedModalShow] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      const { data } = await createClient().auth.getSession();
      if (data?.session?.access_token) {
        setToken(data.session.access_token);
      }
    };
    getToken();
  }, []);

  const handleRemoveConfirmed = async () => {
    if (!token) {
      alert("You must be logged in.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/remove-bug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bugId,
          reason,
          username,
          email,
          bugDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`❌ Failed: ${data.error}`);
        return;
      }

      onRemoved();
      onClose();
    } catch (err: any) {
      alert("❌ Error removing bug: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {confirmedModalShow ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-red-700">
              Confirm Bug Removal
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to permanently remove this bug report? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-red-700"
                onClick={handleRemoveConfirmed}
                disabled={loading}
              >
                {loading ? "Removing..." : "Confirm Remove"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Remove Bug Report</h2>
            <p className="mb-2 text-sm text-gray-700">
              <strong>Bug ID:</strong> {bugId}
            </p>
            <p className="mb-2 text-sm text-gray-700">
              <strong>User:</strong> {username} – {email}
            </p>
            <textarea
              className="w-full border px-3 py-2 rounded mb-4"
              rows={3}
              placeholder="Reason for removal"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-red-700"
                onClick={() => setConfirmedModalShow(true)}
                disabled={loading}
              >
                Remove
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
