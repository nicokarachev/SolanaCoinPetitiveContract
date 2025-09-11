/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";

export default function BetaTesterPayoutModal({
  pubkey,
  bugId,
  onClose,
}: {
  pubkey: string;
  bugId: string;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const supabase = await createClient();
      const { data } = await supabase.auth.getClaims();
      if (data?.session?.access_token) {
        setToken(data.session.access_token);
      } else {
        console.warn("No session found or user not signed in");
      }
    };
    getToken();
  }, []);

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount))) {
      alert("Please enter a valid CPT amount.");
      return;
    }

    if (!token) {
      alert("Not authenticated. Please sign in first.");
      return;
    }

    setLoading(true);
    try {
      console.log("🐞 Bug ID received by modal:", bugId);

      const res = await fetch("/api/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Send the token
        },
        body: JSON.stringify({
          walletAddress: pubkey,
          cptAmount: amount,
          bugId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error:", data.error);
        alert(`❌ Error: ${data.error}`);
        return;
      }

      console.log("✅ CPT Sent! TX:", data.tx);
      alert(`✅ CPT Sent! TX: ${data.tx}`);
      onClose();
    } catch (err: any) {
      console.error("❌ Transfer failed", err);
      alert("❌ Transfer failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Issue Reward</h2>
        <p className="mb-2">
          <strong>Wallet:</strong> {pubkey}
        </p>
        <input
          type="number"
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="Enter CPT amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-lime-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Sending..." : "Issue Reward"}
          </Button>
        </div>
      </div>
    </div>
  );
}
