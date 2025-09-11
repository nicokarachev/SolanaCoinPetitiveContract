/**
 * Coinpetitive User Roadmap
 * Displays rollout phases focused on user-facing milestones.
 * Intended for use in pages like `/roadmap-users`.
 *
 * @returns {JSX.Element} - The user rollout roadmap content
 */

export default function CoinpetitiveUserRoadmap() {
  return (
    <section className="prose lg:prose-xl max-w-4xl mx-auto py-10">
      <h1>User Roadmap</h1>

      <h3>🧪 Phase 1: MVP Launch (Beta Testnet)</h3>
      <ul>
        <li>✅ Devnet live, core mechanics functioning (challenge creation, voting, reward payouts).</li>
        <li>✅ CPT token integrated and operational via Solana testnet.</li>
        <li>✅ Basic frontend + wallet connection.</li>
        <li>✅ Smart contract moderation tools (flag, freeze, remove).</li>
        <li>✅ Manual rewards distribution logic tested.</li>
        <li>🎯 Goal: Get real user feedback, identify bugs, iterate fast.</li>
      </ul>

      <h3>🚀 Phase 2: Tokenized Mainnet Launch</h3>
      <ul>
        <li>🔁 Launch CPT token on <strong>Raydium</strong> (DEX) with limited initial liquidity (includes bot baiting to stress-test liquidity dynamics).</li>
        <li>🟢 Open access to create and enter real CPT challenges.</li>
        <li>🗳 On-chain voting with real tokens, live earning begins.</li>
        <li>🔒 Platform-controlled upgradeable smart contracts (pre-DAO).</li>
        <li>📣 Community-building: influencer outreach, TikTok push, telegram growth.</li>
        <li>⚠️ Caps enforced: max daily sell %, reward size limits, etc.</li>
      </ul>

      <h3>🌍 Phase 3: Ecosystem Expansion</h3>
      <ul>
        <li>🧰 Add features: Profile dashboards, challenge search filters, challenge categories (e.g., &quot;skills&quot;, &quot;comedy&quot;, &quot;debate&quot;).</li>
        <li>🤝 Creator-specific tools: clone template, invite-only, scheduled launches.</li>
        <li>🔁 Cross-promotion partnerships and sponsored challenge tools.</li>
        <li>📱 Mobile-first UI updates + performance scaling.</li>
        <li>🪙 Treasury wallet transparency dashboard.</li>
        <li>⚡️ Integrate <strong>Jupiter Aggregator</strong> to simplify CPT token acquisition.</li>
      </ul>

      <h3>🗳️ Phase 4: Decentralization &amp; DAO Governance</h3>
      <ul>
        <li>🧠 DAO milestones: when treasury or market cap reaches threshold (e.g., $250K).</li>
        <li>📝 Community voting begins: smart contract upgrades, token burns, new features.</li>
        <li>🧷 Transition smart contract control to DAO.</li>
        <li>🔥 Ongoing token burns from LP transactions.</li>
        <li>💸 Treasury and grant fund opens for proposals (marketing, dev, rewards).</li>
      </ul>
    </section>
  );
}
