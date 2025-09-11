import {
  CheckCircle2,
  AlertTriangle,
  Rocket,
  Video,
  Trophy,
} from "lucide-react";

export default function UsagePage() {
  return (
    <main className="max-w-[1000px] mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Rocket className="h-8 w-8 text-primary" />
          How Coinpetitive.io Works
          <Rocket className="h-8 w-8 text-primary" />
        </h1>
        <p className="text-lg text-gray-600">
          A Step-by-Step Guide to Using the Platform
        </p>
      </div>

      <div className="space-y-12">
        {/* Section 1: Sign Up & Connect Wallet */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            1️⃣ How to Sign Up & Connect Your Wallet
          </h2>
          <ul className="space-y-3">
            {[
              "Download Phantom Wallet – Available on iOS or Android app stores.",
              "Create Your Wallet – Follow the in-app steps and securely store your recovery phrase.",
              "Open Coinpetitive.io in Phantom – Tap the search icon and type in coinpetitive.io.",
              "Sign In & Sign Up – Tap 'Sign In', then 'Sign Up' to link your wallet.",
            ].map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                {step}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 2: Create a Challenge */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            2️⃣ How to Create a Challenge
          </h2>
          <p className="mb-4">Anyone can create a challenge. Here’s how:</p>
          <ul className="space-y-3">
            {[
              "Go to 'Create Challenge' page and fill in challenge name, description, entry fee (CPT), entry deadline, submission deadline, and voting deadline.",
              "Launch the challenge – the reward pool is funded by both the entry fees from participants and the reward amount contributed by the challenge creator.",
              "5% platform fee is retained.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-start gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <p>
              Once launched, a challenge cannot be edited or refunded.
              Double-check your settings.
            </p>
          </div>
        </section>

        {/* Section 3: Payouts */}
        <section>
          <h2 className="text-2xl font-bold mb-6">3️⃣ How Payouts Work</h2>
          <ul className="space-y-3">
            {[
              "Reward pool is formed by total entry fees in CPT.",
              "95% of reward goes to 1st place (or 50/50 split in a tie).",
              "Winning voters split the losing votes' fees.",
              "5% platform fee deducted.",
              "Challenge creator keeps any leftover CPT after payouts.",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4: Submit Entry */}
        <section>
          <h2 className="text-2xl font-bold mb-6">4️⃣ How to Submit an Entry</h2>
          <ul className="space-y-3">
            {[
              "Record a clear, rule-following video.",
              "Upload to TikTok, YouTube, X/Twitter, or Facebook.",
              "Include hashtag #Coinpetitive.com in the caption.",
              "Ensure the post is public so voters can see it.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Video className="h-5 w-5 text-green-500 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 5: Winning & Rewards */}
        <section>
          <h2 className="text-2xl font-bold mb-6">5️⃣ Winning & Rewards</h2>
          <ul className="space-y-3">
            {[
              "Winners are chosen by public vote — not objective metrics or staff.",
              "One vote per participant; all votes recorded on-chain.",
              "Rewards are distributed automatically based on vote results.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            🧠 Coinpetitive.io is a decentralized platform for publicly judged,
            skill-based contests. No random elements or gambling involved.
          </p>
        </section>

        {/* Section 6: Reward Distribution */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            6️⃣ Reward Distribution Process
          </h2>
          <ul className="space-y-3">
            {[
              "Once voting ends, the 'Distribute Rewards' button activates.",
              "Anyone involved can press it — only needs to be clicked once.",
              "Smart contract handles automatic payouts to winners and voters.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Legal Notice */}
        <section className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">⚖️ Legal Notice</h2>
          <p className="text-sm text-gray-700">
            Coinpetitive is a decentralized challenge platform governed by
            public voting. There are no raffles, games of chance, or custody of
            user funds. All activities and transactions are handled by
            transparent, on-chain smart contracts. Participation is voluntary
            and users must ensure compliance with their local laws.
          </p>
        </section>

        {/* TL;DR */}
        <section className="bg-primary/5 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">⚡ TL;DR – Quick Summary</h2>
          <ul className="space-y-3">
            {[
              "1️⃣ Get Started – Download Phantom, connect wallet, sign up.",
              "2️⃣ Create or Join a Challenge – Set rules and pay CPT entry fee.",
              "3️⃣ Submit a Video – Post publicly with #Coinpetitive.com.",
              "4️⃣ Vote & Win – Community votes determine winner.",
              "5️⃣ Distribute Rewards – One click triggers automatic payouts.",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
