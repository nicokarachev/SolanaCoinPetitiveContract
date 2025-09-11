/**
 * Coinpetitive Terms of Service Component
 * Cleanly formatted for on-site display (Tailwind + prose)
 *
 * @returns {JSX.Element}
 */

export default function CoinpetitiveTermsOfService() {
  return (
    <section className="prose lg:prose-xl max-w-4xl mx-auto py-10">
      <h1>Coinpetitive Terms of Service</h1>
      <p>
        <strong>Effective Date:</strong>{" "}
        <time dateTime="2025-08-01">8/1/2025</time>
        {" · "}
        <strong>Last Updated:</strong>{" "}
        <time dateTime="2025-08-01">8/1/2025</time>
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using Coinpetitive (“the Platform”), you agree to these
        Terms of Service (“Terms”), our Privacy Policy, and any additional
        guidelines posted within the Platform. If you do not agree, do not use
        the Platform.
      </p>

      <h2>2. Platform Overview</h2>
      <p>
        Coinpetitive is a skill-based competition platform where users create
        and participate in video challenges. Votes and participation are
        recorded on the Solana blockchain using the CPT token (“Token”). The
        Platform does not custody tokens, exchange tokens for fiat, or provide
        investment services.
      </p>

      <h2>3. Eligibility</h2>
      <ul>
        <li>
          You must be at least 18 years old (or the age of majority in your
          jurisdiction) to use the Platform.
        </li>
        <li>
          By using Coinpetitive, you represent that participation in skill-based
          competitions is legal in your jurisdiction.
        </li>
        <li>
          We reserve the right to block or restrict access where use of the
          Platform would violate local law.
        </li>
      </ul>

      <h2>4. User Responsibilities</h2>
      <ul>
        <li>
          <strong>Content:</strong> You are solely responsible for content you
          upload, submit, or link. Content may not include illegal, harmful, or
          infringing material.
        </li>
        <li>
          <strong>Conduct:</strong> You may not attempt to hack, exploit, or
          manipulate Platform mechanics.
        </li>
        <li>
          <strong>Compliance:</strong> You are responsible for your own tax,
          reporting, and regulatory obligations related to use of CPT tokens.
        </li>
      </ul>

      <h2>5. Token Mechanics</h2>
      <ul>
        <li>
          <strong>Utility Only:</strong> CPT tokens are used for entry fees,
          voting, and rewards. They have no guarantee of value and are not an
          investment.
        </li>
        <li>
          <strong>No Custody:</strong> The Platform never holds your tokens. All
          token transfers occur directly on-chain via smart contracts.
        </li>
        <li>
          <strong>Transaction Costs:</strong> Users are responsible for any gas
          fees required for participation.
        </li>
      </ul>

      <h2>6. Rewards &amp; Voting</h2>
      <ul>
        <li>
          Challenge creators set reward pools and participation parameters.
        </li>
        <li>
          Distribution of rewards is handled automatically by smart contracts
          based on published rules.
        </li>
        <li>
          Voting is limited to one vote per user per challenge. Manipulation of
          the system may result in loss of funds.
        </li>
      </ul>

      <h2>7. Fees</h2>
      <ul>
        <li>
          A 5% Platform fee is deducted from winnings and used to sustain the
          ecosystem.
        </li>
        <li>
          Small SOL fees are required for reward distribution — these are
          generally paid by the challenge creator.
        </li>
      </ul>

      <h2>8. Content Moderation</h2>
      <ul>
        <li>
          Users may flag content that is unsafe, abusive, or violates laws.
        </li>
        <li>
          The Platform reserves the right to remove or restrict access to
          flagged content.
        </li>
        <li>
          The Platform may suspend or ban accounts that repeatedly violate these
          Terms.
        </li>
      </ul>

      <h2>9. Disclaimers</h2>
      <ul>
        <li>
          <strong>No Guarantee of Earnings:</strong> Participation may result in
          loss of tokens. There is no guarantee of profit or reward.
        </li>
        <li>
          <strong>Not Gambling:</strong> Challenges are designed as skill-based
          competitions.
        </li>
        <li>
          <strong>As-Is Service:</strong> The Platform is provided “as-is” and
          “as available.” We disclaim all warranties, express or implied,
          including merchantability or fitness for a particular purpose.
        </li>
        <li>
          <strong>Blockchain Risks:</strong> Transactions are irreversible. You
          bear all risk of transaction errors, hacks, volatility, or wallet
          mismanagement.
        </li>
      </ul>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Coinpetitive, its founder(s),
        developers, and affiliates are not liable for:
      </p>
      <ul>
        <li>Any lost, stolen, or inaccessible funds;</li>
        <li>
          Errors, bugs, or exploits in first or third-party services (including
          wallets, DEXs, or Solana itself);
        </li>
        <li>Regulatory or legal consequences of your use;</li>
        <li>Indirect, incidental, or consequential damages.</li>
      </ul>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Coinpetitive, its founder(s),
        developers, and affiliates from any claims, damages, or expenses arising
        out of your use of the Platform or violation of these Terms.
      </p>

      <h2>12. Termination</h2>
      <p>
        We may suspend or terminate your access to the Platform at our sole
        discretion, with or without notice, if you violate these Terms.
      </p>

      <h2>13. Changes to Terms</h2>
      <p>
        We may modify these Terms at any time. Updated versions will be posted
        on the Platform. Continued use constitutes acceptance of revised Terms.
      </p>

      <h2>14. Governing Law</h2>
      <p>
        These Terms are governed by the laws of Kansas, USA. You agree that any
        disputes shall be resolved through mediation.
      </p>

      <h2>15. Contact</h2>
      <p>
        For questions or concerns, contact:{" "}
        <a href="mailto:info@coinpetitive.io">info@coinpetitive.io</a>
      </p>
    </section>
  );
}
