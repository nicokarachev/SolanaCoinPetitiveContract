"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import logo from "../public/logo.png";

const CPT_MINT = process.env.NEXT_PUBLIC_CPT_TOKEN_MINT;

export default function CPTTicker() {
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotice, setShowNotice] = useState(false);

  const fetchPrice = async () => {
    try {
      const res = await fetch(`https://lite-api.jup.ag/price/v3?ids=${CPT_MINT}`, { cache: "no-store" });
      const json = await res.json();
      const p = json?.data?.[CPT_MINT]?.price ?? null;
      const ch = json?.data?.[CPT_MINT]?.priceChange24h ?? null;

      if (p != null) {
        setPrice(p);
        setChange24h(ch);
        setLoading(false);
        return;
      }

      const ds = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CPT_MINT}`).then(r => r.json());
      const pair = ds?.pairs?.[0];
      if (pair?.priceUsd) {
        setPrice(parseFloat(pair.priceUsd));
        setChange24h(pair.priceChange?.h24 != null ? Number(pair.priceChange.h24) : null);
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (e) {
      console.error("Error fetching CPT price:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const id = setInterval(fetchPrice, 30_000);
    return () => clearInterval(id);
  }, []);

  const changeBadge = useMemo(() => {
    if (change24h == null) return null;
    const up = change24h >= 0;
    return (
      <span
        className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
          up ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"
        }`}
      >
        {up ? "▲" : "▼"} {change24h.toFixed(2)}%
      </span>
    );
  }, [change24h]);

  const handleInfoClick = () => {
    setShowNotice(true);
    setTimeout(() => setShowNotice(false), 4000);
  };

  return (
    <div className="inline-flex flex-col items-start">

      <div
        className={[
          "px-3 py-2 rounded-lg text-xs md:text-md font-bold inline-flex items-center gap-2 transition-all duration-200",
          showNotice
            ? "bg-transparent text-white outline outline-1 outline-[#B3731D] italic"
            : "bg-black text-white italic shadow-lg shadow-lime-600/30",
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        {showNotice ? (
          <span className="text-sm font-normal text-black/70 italic">
            Prices are fetched from public APIs and may not reflect the most up-to-date price.
          </span>
        ) : (
          <>

            <Image
              src={logo}
              alt="CPT Logo"
              width={30}
              height={30}
              className="rounded-full"
              priority
            />

            <span>
              {loading
                ? "CPT: Loading..."
                : price
                ? `CPT: $${price.toFixed(price < 1 ? 6 : 4)}`
                : "CPT: No data"}
            </span>

            {changeBadge}

            <button
              onClick={handleInfoClick}
              className="ml-2 flex  items-center justify-center w-5 h-5 rounded-full border border-white text-md text-white hover:bg-[#B3731D] hover:border-transparent transition"
              aria-label="Show price disclaimer"
              type="button"
            >
              ?
            </button>
          </>
        )}
      </div>
    </div>
  );
}
