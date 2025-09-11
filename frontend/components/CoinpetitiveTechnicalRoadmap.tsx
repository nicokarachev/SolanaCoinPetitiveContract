/**
 * Coinpetitive Technical Rollout Roadmap Component
 * Cleaned and converted from Google Docs export.
 *
 * @returns {JSX.Element} - Technical development phase breakdown
 */

export default function CoinpetitiveTechnicalRoadmap() {
  return (
    <section className="prose lg:prose-xl max-w-4xl mx-auto py-10">
      <h1>Development Roadmap</h1>
      <p>
        <strong>Post. Compete. Earn. Repeat.</strong>
      </p>

      <h2>Launch Phases</h2>

      <h3>Phase 1: Pre-Alpha (Internal Testing &amp; Infrastructure Setup)</h3>
      <ul>
        <li>Finalize smart contract core logic and initial CPT token deployment.</li>
        <li>Begin internal testing of submission, voting, and reward distribution mechanics.</li>
        <li>Launch minimal UI with basic functionality.</li>
        <li>No public users yet — closed environment with dev/test accounts only.</li>
      </ul>

      <h3>Phase 2: Closed Beta (Invite-Only)</h3>
      <ul>
        <li>Open to selected users (creators, crypto testers).</li>
        <li>Focus on collecting feedback and squashing bugs.</li>
        <li>Onboard first real users to post challenges, enter, and vote.</li>
        <li>Launch Phantom wallet integration and simple user dashboards.</li>
        <li>Start building initial creator relationships and community seeding.</li>
        <li>Begin releasing explanatory videos and tutorials.</li>
      </ul>

      <h3>Phase 3: Open Beta (Public Launch + Treasury Use)</h3>
      <ul>
        <li>The platform opens to the public — any wallet can join.</li>
        <li>Liquidity Testing / Bot baiting (partial liquidity deployment as a stress test).</li>
        <li>Deploy initial liquidity pool on Raydium (3.5M CPT + 1,500 SOL).</li>
        <li>First centerpiece challenge funded by the platform (ecosystem centerpiece).</li>
        <li>Platform wallet begins limited promotions: CPT grants, small creator partnerships.</li>
        <li>Begin organic and influencer-driven growth campaigns.</li>
        <li>
          Treasury funds used for:
          <ul>
            <li>Hosting</li>
            <li>Dev ops</li>
            <li>Bug bounties</li>
            <li>Basic salaries</li>
            <li>Feature expansion</li>
          </ul>
        </li>
        <li>Governance still retained by founder. Smart contract remains upgradeable.</li>
      </ul>

      <h3>Phase 4: DAO Transition &amp; Scaling</h3>
      <ul>
        <li>
          Triggered once:
          <ul>
            <li>Security audit is passed</li>
            <li>Smart contract is confirmed stable</li>
            <li>Platform has sufficient traction and wallet growth</li>
          </ul>
        </li>
        <li>
          DAO smart contract deployment:
          <ul>
            <li>On-chain governance launched</li>
            <li>Treasury management may transfer to DAO</li>
          </ul>
        </li>
        <li>Core logic (voting, rewards, parameters) becomes immutable.</li>
        <li>Platform continues scaling with creator bounties, community-led growth.</li>
        <li>DAO votes may unlock staking, airdrops, or feature upgrades.</li>
        <li>
          <strong>Platform remains privately owned</strong> — UI, moderation, and 5% fee structure stay intact.
        </li>
      </ul>

      <h2>Final Note</h2>
      <p>
        This roadmap is a living plan built on transparency. It reflects the rollout strategy behind the Coinpetitive platform. 
        As development progresses, this document may evolve to reflect new priorities and milestones.
      </p>
      <p>
        <em>Phases overlap intentionally — we test and build in public.</em>
      </p>
    </section>
  );
}
