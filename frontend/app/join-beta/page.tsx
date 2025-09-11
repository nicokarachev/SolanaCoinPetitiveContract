"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function SignupPage() {
  const [mode, setMode] = useState<"beta" | "notify">("beta");
  const [formData, setFormData] = useState({ name: "", email: "", wallet: "" });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [submittedMessage, setSubmittedMessage] = useState("");

  // ← pull out the literal comparison into a plain boolean
  const isLoading = status === "loading";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const endpoint = mode === "beta" ? "/api/join-beta" : "/api/notify-me";
    const payload =
      mode === "beta"
        ? {
            name: formData.name,
            wallet: formData.wallet,
            email: formData.email,
          }
        : { email: formData.email };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmittedMessage(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setSubmittedMessage("🎉 You're on the list!");
        setStatus("success");
      }
    } catch {
      setSubmittedMessage("Unexpected error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="py-36 px-6 md:px-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
        >
          {mode === "beta" ? "Join the Beta" : "Stay in the Loop."}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
        >
          {mode === "beta"
            ? "Enter your details to become a founding beta tester. Get rewarded with exclusive perks for helping us test before launch."
            : "Just want to be notified when we go live? Drop your email and we'll keep you updated."}
        </motion.p>

        {status !== "idle" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${
              status === "success" ? "text-green-600" : "text-red-600"
            } font-medium text-xl`}
          >
            {submittedMessage}
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto space-y-4 text-left"
          >
            {mode === "beta" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md border border-border bg-muted text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Wallet (Solana) Address
                  </label>
                  <input
                    type="text"
                    name="wallet"
                    required
                    value={formData.wallet}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md border border-border bg-muted text-foreground"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-border bg-muted text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={isLoading} // ← use boolean instead
                className="w-full px-6 py-3 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                {isLoading
                  ? mode === "beta"
                    ? "Joining…"
                    : "Submitting…"
                  : mode === "beta"
                    ? "Join the Beta"
                    : "Notify Me"}
              </button>

              <button
                type="button"
                onClick={() => setMode(mode === "beta" ? "notify" : "beta")}
                className="w-full px-6 py-3 rounded border border-border hover:bg-muted transition"
              >
                {mode === "beta" ? "Notify Me" : "Join the Beta"}
              </button>
            </div>
          </form>
        )}
      </section>
      <Footer />
    </main>
  );
}
