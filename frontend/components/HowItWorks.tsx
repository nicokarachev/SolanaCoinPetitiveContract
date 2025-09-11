"use client";

import { motion } from "framer-motion";

const steps = [
  {
    id: "step1",
    emoji: "1️⃣",
    text: "Launch a challenge — any format, any skill, any style. You set the rules.",
  },
  {
    id: "step2",
    emoji: "2️⃣",
    text: "Players join and compete. The crowd watches, votes, and stakes their support.",
  },
  {
    id: "step3",
    emoji: "3️⃣",
    text: "Voters only win if they back the right competitor. Insight matters.",
  },
  {
    id: "step4",
    emoji: "4️⃣",
    text: "Winners get paid. Voters split rewards. Everyone earns when the hype is real.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="py-36 px-6 md:px-12 bg-gradient-to-b from-background to-muted"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          How It Works
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Coinpetitive brings real competition to the blockchain. Players launch
          challenges in any format — fitness, freestyle, food fights, or
          friendly bets. Once it’s live, the public watches, votes, and stakes
          their support.
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-2">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl p-6 text-left shadow-md hover:shadow-lg transition duration-300"
          >
            <div className="text-3xl mb-4">{step.emoji}</div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {step.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
