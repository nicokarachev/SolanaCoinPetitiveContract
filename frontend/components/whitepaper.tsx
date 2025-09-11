/**
 * Coinpetitive Whitepaper Render Component
 * Cleaned and converted from Google Docs export.
 *
 * @returns {JSX.Element} - Formatted whitepaper content
 */

export default function whitepaper() {
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
        <li>A 5% platform fee is deducted only from winning rewards.</li>
        <li>
          Remaining funds are distributed as: 75% to 1st place, 25% to 2nd (or
          50/50 in case of tie).
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
      <p>No minting beyond initial supply</p>

      <h3>Initial Distribution</h3>
      <ul>
        <li>Founder: 1,100,000 CPT (locked by commitment, not contract)</li>
        <li>
          Dev Team: 500,000 CPT (not to be sold until LP is 15x contractor
          holdings or 12 months after launch)
        </li>
        <li>Initial Liquidity Pool: 3,500,000 CPT + 1,500 SOL</li>
        <li>Treasury Wallet: 7,450,000 CPT</li>
        <li>Platform Wallet: 5,450,000 CPT</li>
        <li>Reserved for Future Listings: 3,000,000 CPT</li>
      </ul>

      <h3>Revised Fee Model</h3>
      <p>
        A 5% platform fee is deducted only from winning rewards. No fee is
        charged to creators or losing participants. This fee sustains
        Coinpetitive&apos;s development, infrastructure, and growth.
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
        a privately owned platform.
      </p>
      <p>
        The 5% fee continues to fund the platform’s operations and development
        (UI, marketing, support, backend). DAO governance applies to on-chain
        logic only.
      </p>

      <h2>Governance Plan</h2>
      <p>The smart contract remains upgradeable until DAO implementation.</p>
      <ul>
        <li>DAO transition triggered by: Platform stability, audit, growth</li>
      </ul>
      <p>Once DAO governance is handed over:</p>
      <ul>
        <li>Smart contract becomes immutable and community-controlled</li>
        <li>Treasury may migrate to DAO</li>
        <li>Community can vote on features like staking, airdrops, etc.</li>
        <li>Founders retain control of the off-chain platform</li>
        <li>5% platform fee remains for platform upkeep</li>
      </ul>

      <h2>Monetization</h2>
      <ul>
        <li>Platform earns 5% fee from winning rewards only</li>
        <li>Pre-DAO: Fee supports ops + salaries</li>
        <li>Post-DAO: Fee funds long-term operations</li>
        <li>CPT may also be used for merch + features</li>
      </ul>

      <h2>Risks &amp; Mitigation</h2>
      <h3>Technical Risks</h3>
      <ul>
        <li>Smart contract audited pre-DAO</li>
        <li>Solana network congestion: mitigated with batch processing</li>
      </ul>

      <h3>Market &amp; Adoption Risks</h3>
      <ul>
        <li>Retention: solved via unique format + creator partnerships</li>
        <li>Competition: focus on skill-based + no storage</li>
        <li>Volatility: CPT is a utility token, not investment</li>
      </ul>

      <h3>Regulatory &amp; Legal Risks</h3>
      <ul>
        <li>CPT is utility-only</li>
        <li>Moderation via community flagging, no video hosting</li>
      </ul>

      <h3>Operational &amp; Team Risks</h3>
      <ul>
        <li>Fee model + Treasury sustain platform</li>
        <li>DAO transition is milestone-based and gradual</li>
      </ul>

      <h2>Legal &amp; Transparency Commitments</h2>
      <ul>
        <li>No promises of investment return</li>
        <li>No guarantee of token value</li>
        <li>Utility-based token only</li>
        <li>Founder retains platform ownership (off-chain)</li>
        <li>5% fee funds upkeep</li>
        <li>Founder won&apos;t sell tokens until $1 or 12 months</li>
        <li>Treasury sales capped at 10% of 30-day LP/month</li>
        <li>All major wallets are public</li>
      </ul>

      <h2>Final Note</h2>
      <p>
        This whitepaper is a living document built on transparency. It’s a
        passion project by a real developer, not a VC firm. The whitepaper
        evolves with the platform — and we invite our community to help shape
        the journey.
      </p>
    </section>
  );
}
