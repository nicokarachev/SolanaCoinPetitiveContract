"use client";

import { useState } from "react";

/**
 * Modal that shows 3 navigation options when triggered.
 */
export default function DocsModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-primary text-primary-foreground px-2 sm:px-4 py-1 sm:py-2 rounded hover:opacity-90"
      >
        Docs
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)} // Close on background click
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-4 mx-4"
            onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing
          >
            <h2 className="text-xl font-semibold">Docs & Roadmaps</h2>

            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  window.open(
                    "https://docs.google.com/document/d/1U_Wct0HpPr26XhUqGgvGBqEZwH757m91ck9ZYvIvKks/edit?usp=sharing",
                    "_blank"
                  )
                }
                className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition"
              >
                📄 Whitepaper
              </button>
              <button
                onClick={() =>
                  window.open(
                    "https://docs.google.com/document/d/1xci4WLJkAcY5m00CLcXWs9wL-cYNM6ZkbsZNIdLq5EA/edit?usp=sharing",
                    "_blank"
                  )
                }
                className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition"
              >
                🛠 Technical Roadmap
              </button>
              <button
               onClick={() =>
                  window.open(
                    "https://docs.google.com/document/d/1vRLM1_ZKHx9E-kiIQVVCqLFcVGEv8b0kwsZ2uBbOiVo/edit?usp=sharing",
                    "_blank"
                  )
                }
                className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition"
              >
                👥 User Roadmap
              </button>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-sm text-gray-500 hover:underline mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
