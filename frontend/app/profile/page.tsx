"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { User, Settings, Grid } from "lucide-react";
import Link from "next/link";
import ChallengeCard from "@/components/challenge-card";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { useAuth } from "@/lib/use-auth";
import { getUserChallenges, Challenge as ChallengeModel } from "@/lib/supabase";
import { getImageUrl } from "@/components/challenge-details";
import RequestBetaAccess from "@/components/RequestBetaAccess";

interface UserChallenge {
  id: string;
  title: string;
  description: string;
  creator: string;
  reward: number;
  participants: number;
  image?: string;
}

export default function ProfilePage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [createdChallenges, setCreatedChallenges] = useState<UserChallenge[]>(
    [],
  );
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const fetchUserChallenges = async () => {
      if (!user) return;
      const result = await getUserChallenges(user.id);

      if (isMounted && result.success && result.challenges) {
        // Filter challenges where the logged-in user is the creator
        const userCreatedChallenges = await Promise.all(
          result.challenges.map(async (challenge) => ({
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            creator: user.name || user.username,
            reward: challenge.reward,
            participants: challenge.participants?.length || 0,
            image: challenge.image
              ? await getImageUrl(challenge.image)
              : undefined,
          })),
        );

        if (isMounted) {
          setCreatedChallenges(userCreatedChallenges);
        }
      }
    };

    fetchUserChallenges();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to view your profile
          </h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header */}
      <header className="bg-white border-b border-[#8a8a8a]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex gap-8 items-start">
            {/* Profile Picture */}
            <div className="w-40 h-40 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#b3731d]">
              {user.avatar ? (
                <Image
                  src={`${user.avatar}`}
                  alt={`${user.username}'s avatar`}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <User className="w-20 h-20 text-gray-400" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-semibold">{user.username}</h1>
              </div>

              <div className="flex gap-8 mb-4">
                <div>
                  <span className="font-semibold">
                    {createdChallenges.length}
                  </span>{" "}
                  <span className="text-gray-500">challenges</span>
                </div>
              </div>
              <Button
                variant="default"
                className="flex items-center gap-2"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </Button>
              <RequestBetaAccess />
              {/* Social Links */}
              <div className="flex gap-4">
                {user.x_profile && (
                  <Link
                    href={`https://x.com/${user.x_profile}`}
                    target="_blank"
                    className="text-sm text-[#b3731d] hover:underline"
                  >
                    @{user.x_profile}
                  </Link>
                )}
                {user.telegram && (
                  <Link
                    href={`https://t.me/${user.telegram}`}
                    target="_blank"
                    className="text-sm text-[#b3731d] hover:underline"
                  >
                    @{user.telegram}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto py-1">
        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b border-[#8a8a8a]">
          <button className="flex items-center gap-2 px-8 py-4 text-sm font-medium border-b-2 border-[#b3731d] text-[#b3731d]">
            <Grid className="w-4 h-4" />
            My Challenges
          </button>
        </div>

        {/* Challenge Grid with reduced spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 px-4">
          {createdChallenges.length > 0 ? (
            createdChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={
                  {
                    id: challenge.id.toString(),
                    title: challenge.title,
                    description: challenge.description,
                    category: "",
                    status: "active",
                    creator_id: challenge.creator,

                    reward: challenge.reward,

                    image: challenge.image,

                    min_participants: 0,
                    max_participants: 0,
                    // Add other required properties with default values
                    created_at: "",
                    updated_at: "",
                  } as ChallengeModel
                }
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              <p>You haven&apos;t created any challenges yet.</p>
              <Link href="/create-challenge" className="mt-4 inline-block">
                <Button>Create Your First Challenge</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={user}
      />
    </div>
  );
}
