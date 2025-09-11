"use client";

import { motion } from "framer-motion";

export default function WhyItMatters() {
  return (
    <section id="why" className="bg-muted py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-semibold mb-2">🔥 Real Challenges</h3>
          <p className="text-muted-foreground">
            Launch or join skill-based showdowns with crypto on the line — from
            dance-offs to debates.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-semibold mb-2">🗳 Back the Best</h3>
          <p className="text-muted-foreground">
            Voters help decide winners — and earn when they choose wisely. It’s
            social, but with stakes.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-semibold mb-2">💰 Earn With Purpose</h3>
          <p className="text-muted-foreground">
            We’re building a world where creativity, talent, and hype are what
            win — not your wallet size. This is crypto built for the people who
            bring the action, not just those who bankroll it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
