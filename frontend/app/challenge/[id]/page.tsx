"use client";

import { ChallengeDetails } from "@/components/challenge-details";
import { useEffect, useState, use } from "react";
import { getChallenge, Challenge as ChallengeModel } from "@/lib/supabase";

export default function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [challenge, setChallenge] = useState<ChallengeModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {

      const result = await getChallenge(resolvedParams.id);
      if (result.success && result.challenge) {
        console.log("Challenge data:", result.challenge);
        if (!challenge || result.challenge.participants.length > challenge.participants.length) {
          setIsLoading(true);
          setChallenge(result.challenge);
          setIsLoading(false);
        }
      }
    };

    fetchChallenge();

    // Set up polling with cleanup
    const intervalId = setInterval(fetchChallenge, 5000);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div>Loading challenge...</div>
      </main>
    );
  }

  if (!challenge) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div>Challenge not found</div>
      </main>
    );
  }
  return (
    <main className="container mx-auto px-4 py-8">
      <ChallengeDetails challenge={challenge} />
    </main>
  );
}
