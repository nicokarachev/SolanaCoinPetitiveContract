"use client";

import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { Player } from "@lottiefiles/react-lottie-player";

const StatCard = ({
  icon,
  label,
  value,
  color = "lime",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}) => {
  return (
    <div className="  text-black dark:text-white w-30 sm:w-36 md:w-40 flex flex-col items-center justify-center ">
      <div className="mb-2 flex items-center justify-center">{icon}</div>
      <div className={`text-${color}-500 font-mono text-2xl md:text-3xl`}>
        <CountUp end={value} duration={1.2} separator="" />
      </div>
      <div className=" md:text-sm font-semibold mt-1 text-center">{label}</div>
    </div>
  );
};

const StatsDisplay = () => {
  const [visits, setVisits] = useState(0);
  const [betaSignups, setBetaSignups] = useState(0);
  const [notifySignups, setNotifySignups] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats/get");
        const data = await res.json();
        setVisits(data.visits || 0);
        setBetaSignups(data.betaSignups || 0);
        setNotifySignups(data.notifySignups || 0);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-wrap gap-8 sm:gap-1 justify-center items-start mt-4">
      <StatCard
        icon={
          <Player
            autoplay
            loop
            src="/animations/bubblingFlask.json"
            style={{ height: 60, width: 60 }}
          />
        }
        label="Join Beta"
        value={betaSignups}
      />
      <StatCard
        icon={
          <Player
            autoplay
            loop
            src="/animations/bell.json"
            style={{ height: 60, width: 60 }}
          />
        }
        label="Notify Me"
        value={notifySignups}
      />
      <StatCard
        icon={
          <Player
            autoplay
            loop
            src="/animations/eye.json"
            style={{ height: 60, width: 60 }}
          />
        }
        label="Visitors"
        value={visits}
      />
    </div>
  );
};

export default StatsDisplay;
