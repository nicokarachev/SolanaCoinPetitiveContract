/**
 * Coinpetitive Whitepaper Render Component
 * Cleaned and converted from Google Docs export.
 *
 * @returns {JSX.Element} - Formatted whitepaper content
 */

export default function CoinpetitiveWhitepaper() {
  return (
    <section className="prose lg:prose-xl max-w-4xl mx-auto py-10">
      <h1>Coinpetitive Whitepaper</h1>
      <p>
        <strong>Post. Compete. Earn. Repeat.</strong>
      </p>

      <h2>Overview</h2>
      <p>
        Coinpetitive is a blockchain-powered video competition platform where
        creativity meets competition. Users create challenges, submit video
        entries, and vote using crypto. The platform operates on Solana for high
        speed and low fees and is governed by a capped-supply token: CPT
        (Coinpetitive Token).
      </p>
      <p>
        Our mission is to build a sustainable and transparent creator economy by
        aligning incentives between creators, competitors, and viewers — where
        everyone earns based on engagement and results.
      </p>

      <h2>Core Components</h2>
      <h3>Challenge Creation</h3>
      <p>
        Anyone can create a challenge by setting the topic, prize, minimum
        number of participants, and submission/voting deadlines. Creators pay a
        small SOL fee to fund the reward distribution mechanism as well as
        fronting the reward amount for the prize.
      </p>

      <h3>Entry Submission</h3>
      <p>
        Participants submit videos (TikTok, YouTube Shorts, etc.) to compete.
        They pay the challenge&apos;s entry fee in CPT plus a standard Solana
        gas fee.
      </p>

      <h3>Voting System</h3>
      <p>
        Voters pay CPT to cast a vote and also cover their own Solana gas fees.
        Winning voters (those who vote for the most-voted entry) split the
        losing voters&apos; CPT fees.
      </p>

      <h3>Reward Distribution</h3>
      <ul>
        <li>The total entry fees are pooled.</li>
        <li>A platform fee of 5% is deducted only from winning rewards.</li>
        <li>
          Remaining funds are distributed as: 95% to 1st place (or 50/50 in case
          of two-way tie). If three or more entries tie, entry fees are refunded
          (minus Solana costs).
        </li>
        <li>Winning voters split the losing vote fees.</li>
        <li>
          The challenge creator earns the entry fees that exceed the reward
          amount.
        </li>
      </ul>

      <h2>Tokenomics</h2>
      <h3>Supply</h3>
      <p>Hard cap: 21,000,000 CPT</p>
      <p>No minting beyond initial supply.</p>

      <h3>Initial Distribution</h3>
      <ul>
        <li>
          Founder: 1,100,000 CPT (locked 12 months or until $1 price, voluntary
          lock, not contract-enforced).
        </li>
        <li>
          Dev Team: 500,000 CPT (not to be sold until LP ≥ 15x holdings or 12
          months after launch).
        </li>
        <li>
          Initial Beta Liquidity Pool: 6,000,000 CPT + $3,000 USD (SOL
          equivalent) deployed in 2 phases:
          <ul>
            <li>1.5M CPT + $500 SOL (bot bait/stress test)</li>
            <li>Remaining LP deposited after leveling</li>
          </ul>
        </li>
        <li>
          Treasury Wallet: 7,450,000 CPT (ops, salaries, LP expansion,
          infrastructure, pre-DAO needs).
        </li>
        <li>
          Beta Tester Airdrop: ~100,000 CPT (distributed among early testers and
          QA wallets). Small seeded wallets (95–100 CPT each) spent real SOL
          before CPT had market value, helping validate mechanics.
        </li>
        <li>
          Platform Wallet (Community / Partnerships / Marketing): 5,450,000 CPT.
        </li>
        <li>
          Reserved for Future Listings (CEXs / Integrations): 3,000,000 CPT.
        </li>
      </ul>

      <h3>⚡ Key Note on Allocations</h3>
      <p>
        As of the Genesis Ledger (Aug 23, 2025), undeployed categories remain in
        the Treasury Wallet until milestone-based distribution. The full Genesis
        Ledger (wallet addresses and balances) was published as a public
        snapshot on Aug 23, 2025 prior to listing. Tokens are traceable on-chain
        via Solscan and can be verified directly at:{" "}
        <a
          href="https://x.com/coinpetitive/status/1959304643567030295?s=46"
          target="_blank"
        >
          https://x.com/coinpetitive/status/1959304643567030295?s=46
        </a>
      </p>

      <h2>Revised Fee Model</h2>
      <p>
        A 5% platform fee is deducted only from winning rewards. No fee is
        charged to creators or losing participants. This fee sustains
        Coinpetitive’s development, infrastructure, and growth.
      </p>

      <h3>Pre-DAO</h3>
      <ul>
        <li>Web hosting, dev ops, moderation, storage, and infrastructure</li>
        <li>Salaries for the founding team and contractors</li>
        <li>Marketing, creator support, bug bounties, and audits</li>
      </ul>

      <h3>Post-DAO</h3>
      <p>
        The smart contract becomes community-governed, but Coinpetitive remains
        privately owned. DAO governance applies to on-chain logic only.
      </p>
      <p>
        The 5% fee continues funding operations and development (UI, marketing,
        support, backend). This is compensation for ongoing responsibilities and
        ensures long-term sustainability.
      </p>

      <h2>Governance Plan</h2>
      <p>The smart contract remains upgradeable until DAO implementation.</p>
      <ul>
        <li>DAO triggered by: platform stability, audit, user milestones</li>
      </ul>
      <p>Once DAO governance is handed over:</p>
      <ul>
        <li>Smart contract becomes immutable and community-governed</li>
        <li>Treasury may migrate to DAO</li>
        <li>Community may vote on staking, airdrops, revenue-sharing</li>
        <li>Founder retains ownership of UI, infrastructure, marketing</li>
        <li>5% fee remains to fund platform upkeep</li>
      </ul>

      <h2>Monetization</h2>
      <ul>
        <li>Platform earns from 5% of winning rewards only</li>
        <li>Pre-DAO: Fee supports ops + salaries via Treasury</li>
        <li>Post-DAO: Fee funds ongoing platform costs</li>
        <li>CPT may also be used for merch + future features</li>
      </ul>

      <h2>Risks &amp; Mitigation</h2>
      <h3>Technical Risks</h3>
      <ul>
        <li>Smart contract audit before DAO transition</li>
        <li>Solana congestion mitigated with batch processing</li>
      </ul>

      <h3>Market &amp; Adoption Risks</h3>
      <ul>
        <li>User retention solved by unique competitions + creator partners</li>
        <li>Competition: focus on skill-based + no video storage</li>
        <li>Token volatility: CPT utility-focused, not investment</li>
      </ul>

      <h3>Regulatory &amp; Legal Risks</h3>
      <ul>
        <li>CPT is a utility token only</li>
        <li>Content moderation via flagging, no hosting</li>
      </ul>

      <h3>Operational &amp; Team Risks</h3>
      <ul>
        <li>Fee model + Treasury sustain platform</li>
        <li>DAO transition gradual, milestone-based</li>
      </ul>

      <h2>Legal &amp; Transparency Commitments</h2>
      <ul>
        <li>No promises of investment returns</li>
        <li>No guarantee of token value</li>
        <li>Utility-based token only</li>
        <li>Founder retains off-chain ownership</li>
        <li>5% platform fee funds upkeep</li>
        <li>Founder won&apos;t sell until $1 or 12 months post-launch</li>
        <li>
          Treasury-controlled sales capped at 10% of 30-day average LP/month
        </li>
        <li>All major wallets are public</li>
      </ul>

      <h2>Final Note</h2>
      <p>
        This platform was built in public — from dumb test challenges on TikTok
        to open ledger snapshots on X. This project began in Nov 2024 and has
        been steadily built and tested ever since. It’s a passion project built
        on transparency, not a VC-funded product.
      </p>
      <p>
        This whitepaper is not a promise — it’s a living document that evolves
        with the platform. Our commitment is to keep learning, keep building,
        and create a fair, creative, and rewarding space for competition. We
        invite our community to grow with us and help shape the journey.
      </p>
    </section>
  );
}
