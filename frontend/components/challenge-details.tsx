"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EyeClosed, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Video,
  Users,
  Trophy,
  User,
  Coins,
  Ticket,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Vote,
  LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SubmitVideoDialog } from "@/components/submit-video-dialog";
import {
  getChatMessages,
  sendMessage,
  joinChallenge,
  getVideoSubmissions,
  likeVideoSubmission,
  dislikeVideoSubmission,
  voteForSubmission,
  VideoSubmission as VideoSubmissionModel,
  Challenge as ChallengeModel,
  getAvatarImageUrl,
} from "@/lib/supabase";
import { useAuth } from "@/lib/use-auth";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAnchor } from "@/lib/anchor-context";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner"; // Use Sonner toast instead
import { createClient } from "@/utils/supabase/client";
import RenderContent from "./RenderContent";
import ReCAPTCHA from "react-google-recaptcha";
import CPTTicker from "./CPTTicker";

// import { TikTokEmbed } from "./TikTokEmbed";

// import { useMediaQuery } from "../hooks/use-media-query"; // You'll need to create this hook

// MessageModel interface for compatibility
interface MessageModel {
  id: string;
  text: string;
  sender: string;
  chat: string;
  created: string;
  updated: string;
  username?: string;
  avatar_url?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expand?: any;
}

// First, add this utility function to format dates and time remaining
const formatDeadline = (date: string | Date) => {
  const now = new Date();
  const deadline = new Date(date);
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) {
    return { timeLeft: "Ended", hasEnded: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { timeLeft: `${days}d ${hours}h`, hasEnded: false };
  } else if (hours > 0) {
    return { timeLeft: `${hours}h ${minutes}m`, hasEnded: false };
  } else {
    return { timeLeft: `${minutes}m`, hasEnded: false };
  }
};

// Add this component to challenge-details.tsx
const DeadlineTimer = ({
  label,
  date,
  icon: Icon,
  noParticipate,
}: {
  label: string;
  date: string | Date;
  icon: LucideIcon;
  noParticipate: boolean;
}) => {
  const [timeInfo, setTimeInfo] = useState(() => formatDeadline(date));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(formatDeadline(date));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [date]);

  return (
    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
      <Icon
        className={`h-5 w-5 ${
          timeInfo.hasEnded || noParticipate ? "text-red-500" : "text-[#B3731D]"
        }`}
      />
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p
          className={`text-sm font-medium ${
            timeInfo.hasEnded || noParticipate
              ? "text-red-500"
              : "text-[#B3731D]"
          }`}
        >
          {timeInfo.hasEnded || noParticipate ? "Ended" : timeInfo.timeLeft}
        </p>
      </div>
    </div>
  );
};

const MintAddress = process.env.NEXT_PUBLIC_CPT_TOKEN_MINT;

export const getImageUrl = async (path: string): Promise<string | null> => {
  const { data, error } = await createClient()
    .storage.from("challenge-images")
    .createSignedUrl(path, 3600); // valid for 1 hour

  return error ? null : data.signedUrl;
};

export interface ChallengeDetailsProps {
  challenge: ChallengeModel;
}

export function ChallengeDetails({ challenge }: ChallengeDetailsProps) {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [videoSubmissions, setVideoSubmissions] = useState<
    VideoSubmissionModel[]
  >([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("/images/logo.png");
  const router = useRouter();
  const [dataVersion, setDataVersion] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const isCreator = user?.id === challenge.creator_id;
  const { participateInChallenge, voteForSubmissionOnChain } = useAnchor();
  const [onChainStatus, setOnChainStatus] = useState<string | null>(null);
  const [onChainError, setOnChainError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalizeSuccess, setFinalizeSuccess] = useState<string | null>(null);

  // Add these state variables to your component
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [challengeState, setChallengeState] = useState<string>("active");
  const [canFinalize, setCanFinalize] = useState(false);
  type ActivePeriod =
    | "JoinActive"
    | "SubmitActive"
    | "VoteActive"
    | "CanFinalize"
    | null;

  const [activePeriod, setActivePeriod] = useState<ActivePeriod>(null);
  const [isFailed, setIsFailed] = useState(false);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    async function setImage() {
      setImageUrl(await getImageUrl(challenge.image));
    }
    setImage();
  }, [challenge.image]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchMessages = async () => {
      try {
        const result = await getChatMessages(challenge.id);

        // Check if component is still mounted
        if (!isMounted) return;

        if (result.success && Array.isArray(result.messages)) {
          const sortedMessages = await Promise.all(
            result.messages.map(async (record) => {
              let avatarUrl: string | null = null;

              if (record.sender?.avatar) {
                avatarUrl = await getAvatarImageUrl(record.sender.avatar);
              }

              return {
                id: record.id,
                text: record.message || "",
                sender: record.user_id || "",
                chat: record.challenge_id || "",
                created: record.created_at || new Date().toISOString(),
                updated: record.created_at || new Date().toISOString(),
                expand: {
                  id: record.sender?.id || "",
                  username: record.sender?.username || "",
                  avatar: avatarUrl,
                },
              };
            })
          ).then((messages) =>
            messages.sort(
              (a, b) =>
                new Date(a.created).getTime() - new Date(b.created).getTime()
            )
          );
          // console.log(sortedMessages);
          setMessages(sortedMessages);
        }
      } catch (error) {
        // Only log errors if component is still mounted and error isn't cancellation
        if (isMounted) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    // Initial fetch
    fetchMessages();

    // Set up polling with cleanup
    const intervalId = setInterval(fetchMessages, 5000);

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(intervalId);
    };
  }, [challenge.id]);

  // Fetch video submissions
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchVideoSubmissions = async () => {
      if (!isMounted) return;

      try {
        // console.log("Fetching video submissions for challenge:", challenge.id);

        if (!isMounted) return;

        const result = await getVideoSubmissions(challenge.id);
        console.log(videoSubmissions.length, result.submissions.length);
        if (videoSubmissions.length == result.submissions.length) {
          // console.log("Don't need to refresh this time.");
          return;
        }

        setIsLoadingSubmissions(true);

        if (result.success && Array.isArray(result.submissions)) {
          // console.log("Video submissions from API:", result.submissions);
          const typedSubmissions = (await Promise.all(
            result.submissions.map(async (record) => {
              let avatarUrl: string | null = null;

              if (record.participant?.avatar) {
                avatarUrl = await getAvatarImageUrl(record.participant?.avatar);
              }
              // Ensure voters array is properly extracted and processed
              let voters = [];

              // Handle different possible formats of voters data from API
              if (Array.isArray(record.voters)) {
                voters = record.voters;
              } else if (typeof record.voters === "string") {
                try {
                  // Try to parse if it's a JSON string
                  voters = JSON.parse(record.voters);
                } catch (e) {
                  // console.log(e);
                  voters = [];
                }
              }

              return {
                id: record.id,
                description: record.description || "",
                video_url: record.video_url || "",
                challenge: record.challenge_id || "",
                sender: record.participant_id || "",
                likes: record.likes || [],
                dislikes: record.dislikes || [],
                created_at: record.created_at || new Date().toISOString(),
                updated_at: record.updated_at || new Date().toISOString(),
                collectionId: "video_submitted",
                voters: voters, // Ensure voters array is properly set
                vote_count: record.votes || voters.length || 0,
                participant: { ...record.participant, avatar: avatarUrl },
              };
            })
          )) as VideoSubmissionModel[];
          // console.log("Typed submissions:", typedSubmissions);
          setVideoSubmissions(typedSubmissions);
        }
      } catch (error) {
        if (isMounted)
          console.error(`Error fetching video submissions: ${error}`);
      } finally {
        if (isMounted) setIsLoadingSubmissions(false);
      }
    };

    fetchVideoSubmissions();
    // Set up interval for subsequent fetches every 5 seconds
    const intervalId = setInterval(fetchVideoSubmissions, 5000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(intervalId);
    };
  }, [challenge.id, dataVersion, videoSubmissions]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user) return;

    try {
      const result = await sendMessage(challenge.id, messageInput.trim());
      if (result.success) {
        setMessageInput("");
        // Fetch updated messages after sending
        const messagesResult = await getChatMessages(challenge.id);
        if (messagesResult.success && Array.isArray(messagesResult.messages)) {
          const sortedMessages = await Promise.all(
            messagesResult.messages.map(async (record) => {
              let avatarUrl: string | null = null;

              if (record.sender?.avatar) {
                avatarUrl = await getAvatarImageUrl(record.sender.avatar);
              }

              return {
                id: record.id,
                text: record.message || "",
                sender: record.user_id || "",
                chat: record.challenge_id || "",
                created: record.created_at || new Date().toISOString(),
                updated: record.created_at || new Date().toISOString(),
                expand: {
                  id: record.sender?.id || "",
                  username: record.sender?.username || "",
                  avatar: avatarUrl,
                },
              };
            })
          ).then((messages) =>
            messages.sort(
              (a, b) =>
                new Date(a.created).getTime() - new Date(b.created).getTime()
            )
          );
          setMessages(sortedMessages);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleJoinChallenge = async () => {
    if (!user) {
      router.push("/signup");
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      // First check if the challenge is full in Supabase
      const participantCount = challenge.participants
        ? challenge.participants.length
        : 0;
      const maxParticipants = challenge.max_participants || 0;

      // console.log("Supabase challenge limits:", {
      //   current: participantCount,
      //   max: maxParticipants,
      // });

      if (maxParticipants > 0 && participantCount >= maxParticipants) {
        setJoinError("This challenge is already at max capacity.");
        setIsJoining(false);
        return;
      }

      // Continue with on-chain join if available
      if (challenge.onchain_id) {
        // Your existing on-chain join code...
        // console.log("Challenge on-chain ID:", challenge.onchain_id);

        try {
          const challengePublicKey = new PublicKey(challenge.onchain_id);
          console.log(
            "Converting to PublicKey:",
            challengePublicKey.toString()
          );

          // Call the on-chain function
          const onChainResult = await participateInChallenge(
            challenge.onchain_id
          );

          if (onChainResult.success) {
            console.log("On-chain join successful!");
            console.log("Transaction signature:", onChainResult.signature);
            setOnChainStatus(
              `Success! Tx: ${
                onChainResult.signature
                  ? onChainResult.signature.slice(0, 8)
                  : "unknown"
              }...`
            );
            toast.success("Successfully joined on-chain");
          } else {
            console.error("On-chain join error:", onChainResult.error);
            setOnChainError(onChainResult.error || "Unknown error");
            toast.error(`On-chain error: ${onChainResult.error}`);
            return; // Stop if on-chain fails
          }
        } catch (error) {
          console.error("On-chain join error:", error);
          setOnChainError(
            error instanceof Error ? error.message : "Unknown error"
          );
          toast.error(
            `On-chain error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          return; // Stop if on-chain fails
        }
      } else {
        console.warn("No on-chain ID available for this challenge");
        setOnChainError("No on-chain ID available");
      }

      // 2. Then - Join off-chain in SupaBase
      const result = await joinChallenge(challenge.id, user.id);
      if (!result.success) {
        setJoinError(result.error || "Failed to join challenge");
      } else {
        // Refresh the page to show the updated challenge
        window.location.reload();
      }
    } catch (error) {
      setJoinError("Failed to join challenge");
      console.error("Join error:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLikeVideo = async (submissionId: string) => {
    if (!user) return;

    try {
      const result = await likeVideoSubmission(submissionId);
      if (result.success && "submission" in result && result.submission) {
        setVideoSubmissions((prevSubmissions) =>
          prevSubmissions.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  likedBy: [],
                  dislikedBy: [],
                  likes: result.submission?.likes || 0,
                  dislikes: result.submission?.dislikes || 0,
                }
              : sub
          )
        );
      }
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleDislikeVideo = async (submissionId: string) => {
    if (!user) return;

    try {
      const result = await dislikeVideoSubmission(submissionId);
      if (result.success && "submission" in result && result.submission) {
        setVideoSubmissions((prevSubmissions) =>
          prevSubmissions.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  likedBy: [],
                  dislikedBy: [],
                  likes: result.submission?.likes || 0,
                  dislikes: result.submission?.dislikes || 0,
                }
              : sub
          )
        );
      }
    } catch (error) {
      console.error("Error disliking video:", error);
    }
  };

  const handleFinalizeChallenge = async () => {
    if (!user || !challenge.onchain_id || isFinalizing) {
      return;
    }

    setIsFinalizing(true);
    setFinalizeError(null);
    setFinalizeSuccess(null);

    try {
      const {
        data: { session },
      } = await createClient().auth.getSession();

      const token = session?.access_token;
      const res = await fetch("/api/finalize-challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengePublicKey: challenge.onchain_id,
        }),
      });

      const result = await res.json();

      if (result.success === true) {
        const successMsg = "Challenge finalized successfully!";

        setFinalizeSuccess(successMsg);
        toast.success("Challenge finalized successfully!");
        setDataVersion((v) => v + 1);
        window.location.reload();
      } else {
        setFinalizeError(result.error || "Failed to finalize challenge");
        toast.error(result.error || "Failed to finalize challenge");
      }
    } catch (error) {
      console.error("Error in finalizeChallenge:", error);
      setFinalizeError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleRefundCPT = async () => {
    if (!user || !challenge.onchain_id || isFinalizing) {
      return;
    }

    setIsRefunding(true);

    try {
      const {
        data: { session },
      } = await createClient().auth.getSession();

      const token = session?.access_token;
      const res = await fetch("/api/refund-cpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengePublicKey: challenge.onchain_id,
        }),
      });

      const result = await res.json();

      if (result.success === true) {
        toast.success("Refunded CPT successfully!");
        setDataVersion((v) => v + 1);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to refund CPT");
      }
    } catch (error) {
      console.error("Error in refunding CPT:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsRefunding(false);
    }
  };

  const handleVote = async (submissionId: string) => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    const token = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();

    const res = await fetch("/api/verify-captcha", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if (!data.success) {
      toast.error("Need to verify captcha first");
      return;
    }
    // console.log("handleVote ---> ");

    // console.log("🔍 Vote button clicked for submission:", submissionId);

    try {
      setIsVoting(true);

      const submission = videoSubmissions.find(
        (sub) => sub.id === submissionId
      );
      if (!submission) {
        toast.error("Submission not found");
        setIsVoting(false);
        return;
      }

      console.log("🔍 Submission found:", {
        id: submission.id,
        description: submission.description?.substring(0, 20),
      });

      // Check if challenge has onchain_id
      if (!challenge.onchain_id) {
        toast.error("Challenge is not registered on-chain");
        setIsVoting(false);
        return;
      }

      // Use challenge onchain_id for the transaction and create a deterministic submission ID
      // Instead of generating a complex key, we'll use the submission ID hashed with the challenge ID
      const submissionReference = new PublicKey(challenge.onchain_id);

      console.log("🔍 Preparing to vote on-chain:", {
        challengeId: challenge.onchain_id,
        submissionId: submissionReference.toString(),
        fee: challenge.voting_fee,
      });

      // Show a pre-transaction notification to the user
      toast.info(
        `Please approve the transaction in your wallet (fee: ${challenge.voting_fee} CPT)...`
      );

      // Call the voteForSubmissionOnChain function with challenge and submission IDs
      console.log("🔍 About to call voteForSubmissionOnChain");
      const onChainResult = await voteForSubmissionOnChain(
        challenge.onchain_id,
        submissionReference.toString()
      );

      console.log("🔍 voteForSubmissionOnChain result:", onChainResult);
      setIsVoting(false);
      if (!onChainResult.success) {
        toast.error(onChainResult.error || "On-chain voting failed");
        return;
      }

      toast.success(
        `Vote recorded! Transaction: ${onChainResult.signature?.substring(
          0,
          8
        )}...`
      );

      // After successful on-chain vote, update the database
      const result = await voteForSubmission(submissionId, user.id);
      if (!result.success) {
        console.error("🔍 Error voting:", result);
        toast.warning("On-chain vote succeeded but couldn't update database");
      } else {
        // Update local state with new vote count
        setVideoSubmissions((prevSubmissions) =>
          prevSubmissions.map((sub) => {
            if (sub.id === submissionId) {
              return {
                ...sub,
                voters: [...(sub.voters || []), user!.id],
                votes: (sub.votes || 0) + 1,
              };
            }
            return sub;
          })
        );
      }
    } catch (error) {
      console.error("🔍 Error voting:", error);
      toast.error("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const isParticipant =
    user && challenge.participants && challenge.participants.includes(user.id);

  // First, add a helper function at the component level
  const hasUserVotedInChallenge = useCallback(
    (userId?: string) => {
      if (!userId) return false;

      // Check all submissions for this user's vote
      return videoSubmissions.some(
        (submission) =>
          Array.isArray(submission.voters) && submission.voters.includes(userId)
      );
    },
    [videoSubmissions]
  );
  const isFull =
    challenge.max_participants > 0 &&
    challenge.participants.length >= challenge.max_participants;

  // Add this helper function near your other helper functions
  const hasUserSubmittedVideo = (userId: string | undefined) => {
    if (!userId) return false;
    return videoSubmissions.some(
      (submission) =>
        typeof submission.participant.id === "string" &&
        submission.participant.id === userId
    );
  };

  // Add this state to manage voter addresses
  const [voterAddresses, setVoterAddresses] = useState<{
    [submission_id: string]: {
      [key: string]: {
        pubkey: string;
        username: string;
        avatar?: string;
      };
    };
  }>({});

  // Add this new useEffect to calculate time remaining and check if challenge can be finalized
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();

      // Parse voting end date - check if it's a string or Date object
      const votingEnd =
        typeof challenge.voting_end === "string"
          ? new Date(challenge.voting_end)
          : challenge.voting_end;
      const registrationEnd =
        typeof challenge.registration_end === "string"
          ? new Date(challenge.registration_end)
          : challenge.registration_end;
      const submissionEnd =
        typeof challenge.submission_end === "string"
          ? new Date(challenge.submission_end)
          : challenge.submission_end;
      if (!votingEnd || !registrationEnd || !submissionEnd) return "Unknown";

      // Calculate time difference
      const diff = votingEnd.getTime() - now.getTime();
      // Calculate remaining time
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let res = "";
      if (days > 0) {
        res = `${days}d ${hours}h remaining`;
      } else if (hours > 0) {
        res = `${hours}h ${minutes}m remaining`;
      } else if (minutes > 0) {
        res = `${minutes}m ${seconds}s remaining`;
      } else {
        res = `${seconds}s remaining`;
      }

      const totalVoters = Object.values(voterAddresses).reduce(
        (sum, votersForSubmission) =>
          sum + Object.entries(votersForSubmission).length,
        0
      );
      // console.log("Total Voters:", totalVoters);
      // console.log(videoSubmissions);
      // console.log("isFailed: ", isFailed);

      if (
        registrationEnd < now &&
        challenge.participants.length < challenge.min_participants
      ) {
        console.log("Not enough participants");
        setIsFailed(true);
      } else if (votingEnd < now && totalVoters < challenge.min_voters) {
        console.log("Not enough voters");
        setIsFailed(true);
      } else {
        setIsFailed(false);
      }

      if (
        isParticipant &&
        !hasUserSubmittedVideo(user?.id) &&
        now <= submissionEnd
      ) {
        setActivePeriod("SubmitActive");
        return res;
      } else if (now <= registrationEnd && !isCreator && !isParticipant) {
        setActivePeriod("JoinActive");
        return res;
      } else if (
        now <= votingEnd &&
        challenge.participants.length > 0 &&
        now > submissionEnd &&
        !hasUserVotedInChallenge(user?.id)
      ) {
        setActivePeriod("VoteActive");
        return res;
      } else if (now > votingEnd) {
        setActivePeriod("CanFinalize");
        setCanFinalize(true);
        setChallengeState("votingEnded");
        return "Challenge has ended"; // Improved message
      } else {
        setActivePeriod(null);
      }
    };

    // Update time remaining initially
    setTimeRemaining(calculateTimeRemaining());

    // Update time remaining every second
    const intervalId = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [
    challenge.voting_end,
    challenge.registration_end,
    challenge.submission_end,
    challenge.participants.length,
    isCreator,
    isFinalizing,
    canFinalize,
    challengeState,
    finalizeSuccess,
    isParticipant,
    videoSubmissions,
    voterAddresses,
  ]);

  // In your render method
  // const status = getChallengeStatus();

  // Add this to your state declarations in ChallengeDetails component
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(
    new Set()
  );

  // Add this helper function
  const toggleSubmissionExpand = (submissionId: string) => {
    setExpandedSubmissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  // First, update your useEffect that fetches voter data:

  useEffect(() => {
    const fetchVoterData = async () => {
      const voterDatas: {
        [submission_id: string]: {
          [key: string]: {
            pubkey: string;
            username: string;
            avatar?: string;
          };
        };
      } = {};

      // console.log("videoSubmissions: ", JSON.stringify(videoSubmissions));

      // console.log("isFailed: ", isFailed);

      // Use Promise.all to wait for all async tasks
      await Promise.all(
        videoSubmissions.map(async (submission) => {
          const { data: voters, error: VotesError } = await createClient()
            .from("votes")
            .select("voter_id")
            .eq("submission_id", submission.id);

          if (VotesError) throw VotesError;

          const voterData: {
            [key: string]: {
              pubkey: string;
              username: string;
              avatar?: string;
            };
          } = {};
          // console.log("voters: ", JSON.stringify(voters));

          await Promise.all(
            voters?.map(async (voter) => {
              if (voter?.voter_id) {
                const { data } = await createClient()
                  .from("users")
                  .select("pubkey, username, avatar")
                  .eq("id", voter.voter_id)
                  .single();

                const avatarUrl = await getAvatarImageUrl(
                  data.avatar as string
                );

                if (data) {
                  voterData[voter.voter_id as unknown as string] = {
                    pubkey: data.pubkey as string,
                    username: data.username as string,
                    avatar: avatarUrl,
                  };
                }
              }
            })
          );

          voterDatas[submission.id] = voterData;
        })
      );

      if (
        Object.values(voterAddresses).reduce(
          (sum, votersForSubmission) =>
            sum + Object.entries(votersForSubmission).length,
          0
        ) !==
        Object.values(voterDatas).reduce(
          (sum, votersForSubmission) =>
            sum + Object.entries(votersForSubmission).length,
          0
        )
      ) {
        setVoterAddresses(voterDatas);
      }
    };

    fetchVoterData();

    // Set up interval for subsequent fetches every 5 seconds
    const intervalId = setInterval(fetchVoterData, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [videoSubmissions]);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 max-w-[1200px] mx-auto">
      <div className="w-full ">
        <div className="mb-6 md:mb-3">
          <CPTTicker />
        </div>
        <div>
          <RenderContent
            videoUrl={challenge.challenge_video}
            imageUrl={imageUrl}
          />
        </div>
        <div className="p-2 md:p-3 mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-xl md:text-2xl font-bold text-[#4A4A4A]">
              {challenge.title}
            </h1>
            <div className="flex gap-2">
              <Button
                className={`flex items-center ${
                  isCreator ||
                  isParticipant ||
                  isJoining ||
                  isFull ||
                  activePeriod !== "JoinActive"
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : "bg-[#b3731d] hover:bg-[#b3731d]/90"
                }`}
                onClick={handleJoinChallenge}
                disabled={
                  isCreator ||
                  isParticipant ||
                  isJoining ||
                  isFull ||
                  activePeriod !== "JoinActive"
                }
                title={
                  !user
                    ? "Sign up to join this challenge"
                    : isCreator
                      ? "You cannot join your own challenge"
                      : isParticipant
                        ? "You are already a participant"
                        : isJoining
                          ? "Joining..."
                          : isFull
                            ? "Challenge is full"
                            : activePeriod !== "JoinActive"
                              ? "Registration period has ended"
                              : "Join this challenge"
                }
              >
                {isJoining
                  ? "Joining..."
                  : !user
                    ? "Sign up to Join"
                    : isCreator
                      ? "Creator can't participate"
                      : isParticipant
                        ? "Already Joined"
                        : isFull
                          ? "Challenge Full"
                          : activePeriod !== "JoinActive"
                            ? "Registration Closed"
                            : `Join Challenge ${challenge.participation_fee} CPT`}
              </Button>
              {joinError && (
                <div className="text-red-500 text-sm">{joinError}</div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-wrap sm:flex-row gap-3 md:gap-6 mb-3">
            <Button
              variant="default"
              size="sm"
              className="bg-green-400 hover:bg-green-500"
              title="See TXs"
              onClick={() =>
                window.open(`https://solscan.io/token/${MintAddress}`, "_blank")
              }
            >
              See Transactions
            </Button>

            <div className="flex items-center gap-2 text-primary min-w-0">
              <User className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-sm sm:text-base">
                {challenge.creator.username || "Anonymous"}
              </span>
            </div>

            <div
              className="flex items-center gap-2 text-primary min-w-0"
              title="Current/Min-Max Participants"
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-sm sm:text-base">
                {challenge.participants.length} participating •{" "}
                {challenge.min_participants} min • {challenge.max_participants}{" "}
                max
              </span>
            </div>

            <div
              className="flex items-center gap-2 text-primary min-w-0"
              title="Challenge Reward"
            >
              <Coins className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-sm sm:text-base">
                {challenge.reward} CPT
              </span>
            </div>

            <div
              className="flex items-center gap-2 text-primary min-w-0"
              title="Voting Fee"
            >
              <Ticket className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-sm sm:text-base">
                {challenge.voting_fee} CPT
              </span>
            </div>
          </div>

          <p className="text-gray-600">{challenge.description}</p>

          {/* Keep error/status messages for user experience */}
          {(onChainStatus || onChainError) && (
            <div className="mt-2">
              {onChainStatus && (
                <div className="text-green-600 text-sm">{onChainStatus}</div>
              )}
              {onChainError && (
                <div className="text-red-600 text-sm">{onChainError}</div>
              )}
            </div>
          )}
        </div>

        {/* Add this section in your ChallengeDetails component after the challenge title */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <DeadlineTimer
            label="Registration Ends"
            date={challenge.registration_end}
            icon={UserPlus}
            noParticipate={
              new Date(challenge.registration_end).getTime() -
                new Date().getTime() <=
                0 && challenge.participants.length == 0
            }
          />
          <DeadlineTimer
            label="Submission Ends"
            date={challenge.submission_end}
            icon={Video}
            noParticipate={
              new Date(challenge.registration_end).getTime() -
                new Date().getTime() <=
                0 && challenge.participants.length == 0
            }
          />
          <DeadlineTimer
            label="Voting Ends"
            date={challenge.voting_end}
            icon={Vote}
            noParticipate={
              new Date(challenge.registration_end).getTime() -
                new Date().getTime() <=
                0 && challenge.participants.length == 0
            }
          />
        </div>

        {/* Video Submissions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#4A4A4A] mb-4">
            Video Submissions
          </h2>

          {isLoadingSubmissions ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#b3731d]"></div>
              <p className="mt-2 text-gray-500">Loading submissions...</p>
            </div>
          ) : videoSubmissions.length > 0 ? (
            <div className="space-y-4">
              {videoSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex flex-col md:flex-row gap-4 border border-[#9A9A9A] rounded-xl p-4"
                >
                  <div className="w-full md:w-1/3 flex flex-col">
                    {(activePeriod === "JoinActive" ||
                      activePeriod === "SubmitActive" ||
                      !activePeriod) &&
                      submission.video_url && (
                        <div className="bg-black/70 rounded-xl flex justify-center items-center text-center shadow-xl py-4 ">
                          <span className="flex flex-col justify-center items-center">
                            <p className="text-white">Start Viewing </p>
                            <EyeClosed size={50} color="orange" />
                            <p className="text-white">When Voting Starts</p>
                          </span>
                        </div>
                      )}
                    {(activePeriod === "VoteActive" ||
                      activePeriod === "CanFinalize") &&
                      submission.video_url && (
                        <RenderContent
                          videoUrl={submission.video_url}
                          submissionAvatarUrl={submission.participant?.avatar}
                        />
                      )}

                    {/* Like/Dislike buttons under thumbnail */}
                    <div className="flex justify-start items-center gap-6 mt-2 pl-1">
                      {(activePeriod === "VoteActive" ||
                        activePeriod === "CanFinalize") && (
                        <div className="flex items-center gap-1">
                          <ThumbsUp
                            className={`h-5 w-5 cursor-pointer ${
                              user?.id
                                ? "text-[#B3731D] fill-[#B3731D]"
                                : "text-gray-500 hover:text-[#B3731D]"
                            }`}
                            onClick={() => handleLikeVideo(submission.id)}
                          />
                          <span className="text-sm">
                            {typeof submission.likes === "number"
                              ? submission.likes
                              : 0}
                          </span>
                        </div>
                      )}
                      {(activePeriod === "VoteActive" ||
                        activePeriod === "CanFinalize") && (
                        <div className="flex items-center gap-1">
                          <ThumbsDown
                            className={`h-5 w-5 cursor-pointer ${
                              user?.id
                                ? "text-[#B3731D] fill-[#B3731D]"
                                : "text-gray-500 hover:text-[#B3731D]"
                            }`}
                            onClick={() => handleDislikeVideo(submission.id)}
                          />
                          <span className="text-sm">
                            {typeof submission.dislikes === "number"
                              ? submission.dislikes
                              : 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                    size="invisible"
                    ref={recaptchaRef}
                  />
                  <div className="flex-1 flex flex-col">
                    <p className="text-sm text-gray-700 mb-2">
                      {submission.participant.username || "Anonymous"} -{" "}
                    </p>
                    <div className="text-xs text-gray-500 mb-auto">
                      Submitted{" "}
                      {new Date(submission.created_at).toLocaleDateString() +
                        " " +
                        new Date(submission.created_at).toLocaleTimeString()}
                    </div>
                    <div className="flex justify-end items-center gap-4 mt-4">
                      {!user ? (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-[#b3731d]/40 hover:bg-[#b3731d]/40 cursor-not-allowed"
                          disabled={true}
                          title="Sign in to vote"
                        >
                          Sign in to vote
                        </Button>
                      ) : hasUserVotedInChallenge(user.id) ? (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white"
                          disabled={true}
                          title="You've already voted in this challenge"
                        >
                          Already voted in challenge
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleVote(submission.id)}
                          disabled={
                            isVoting ||
                            activePeriod !== "VoteActive" ||
                            isFailed
                          }
                          className={`${
                            isVoting
                              ? "bg-[#b3731d]/40 cursor-not-allowed"
                              : activePeriod === "VoteActive"
                                ? "bg-[#b3731d] hover:bg-[#b3731d]/90"
                                : "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            activePeriod === "VoteActive"
                              ? `Vote ${challenge.voting_fee} CPT`
                              : "Voting period has ended"
                          }
                        >
                          {isVoting
                            ? "Voting..."
                            : activePeriod === "VoteActive"
                              ? `Vote ${challenge.voting_fee} CPT`
                              : "Voting Disabled"}
                        </Button>
                      )}
                    </div>
                    {activePeriod === "CanFinalize" && (
                      <div className="mt-4 border-t border-gray-200 pt-4 w-full">
                        <Button
                          variant="ghost"
                          className="w-full flex items-center justify-between text-sm text-gray-600"
                          onClick={() => toggleSubmissionExpand(submission.id)}
                        >
                          <span>
                            Show Voters (
                            {voterAddresses[submission.id]
                              ? Object.entries(voterAddresses[submission.id])
                                  .length
                              : 0}
                            )
                          </span>
                          {expandedSubmissions.has(submission.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>

                        {expandedSubmissions.has(submission.id) &&
                          activePeriod === "CanFinalize" && (
                            <div className="mt-2 space-y-2 bg-gray-50 rounded-md p-3">
                              {voterAddresses[submission.id] ? (
                                Object.entries(
                                  voterAddresses[submission.id]
                                ).map((voteData, index) => {
                                  // const voterId = voteData[0];
                                  const voterData = voteData[1];
                                  // const voterData = voterAddresses[voterId];

                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 bg-gray-100 p-2 rounded"
                                    >
                                      <Avatar className="h-6 w-6 flex-shrink-0">
                                        {voterData?.avatar ? (
                                          <Image
                                            src={`${voterData.avatar}`}
                                            alt={
                                              voterData?.username ||
                                              "Voter avatar"
                                            }
                                            width={24}
                                            height={24}
                                            className="rounded-full object-cover"
                                          />
                                        ) : (
                                          <AvatarFallback className="text-xs">
                                            {(voterData?.username || "A")
                                              .charAt(0)
                                              .toUpperCase()}
                                          </AvatarFallback>
                                        )}
                                      </Avatar>
                                      <div className="flex flex-col flex-1">
                                        <span className="text-sm font-medium">
                                          {voterData?.username || "Loading..."}
                                        </span>
                                        <span className="text-xs font-mono text-gray-500 truncate">
                                          {voterData?.pubkey
                                            ? `${voterData.pubkey.slice(0, 6)}...${voterData.pubkey.slice(-4)}`
                                            : "Loading..."}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-sm text-gray-500 text-center">
                                  No votes yet
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
              <Video className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No video submissions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full md:w-[320px] flex-shrink-0">
        <div className="pb-2"></div>

        <Button
          className="w-full mb-4"
          onClick={() => setIsSubmitDialogOpen(true)}
          disabled={
            !isParticipant ||
            isCreator ||
            hasUserSubmittedVideo(user?.id) ||
            activePeriod !== "SubmitActive" ||
            isFailed
          }
          title={
            !user
              ? "Sign up to submit videos"
              : isCreator
                ? "You cannot submit videos to your own challenge"
                : !isParticipant
                  ? "Join the challenge to submit videos"
                  : hasUserSubmittedVideo(user?.id)
                    ? "You have already submitted a video to this challenge"
                    : activePeriod !== "SubmitActive"
                      ? "Submission period is not active"
                      : "Submit your video"
          }
        >
          <Video className="h-4 w-4 mr-2" />
          <span className="text-sm">
            {isCreator
              ? "Can't submit to own challenge"
              : hasUserSubmittedVideo(user?.id)
                ? "Already submitted a video"
                : activePeriod !== "SubmitActive"
                  ? "Submission period is not active"
                  : `Submit My Video`}
          </span>
        </Button>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {timeRemaining &&
                !(
                  new Date(challenge.registration_end).getTime() -
                    new Date().getTime() <=
                    0 &&
                  challenge.participants.length < challenge.min_participants
                ) && (
                  <span
                    className={`${
                      canFinalize ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {timeRemaining}
                  </span>
                )}
            </span>
          </div>
        </div>

        {finalizeError && (
          <div className="mt-2 mb-4 text-red-500 text-sm p-2 bg-red-50 rounded-md border border-red-200">
            {finalizeError}
          </div>
        )}
        {finalizeSuccess && (
          <div className="mt-2 mb-4 text-green-500 text-sm p-2 bg-green-50 rounded-md border border-green-200">
            {finalizeSuccess}
          </div>
        )}

        {isFailed && challenge.state === "active" && (
          <Button
            className={`w-full mb-4 "bg-[#B3731D] hover:bg-[#B3731D]/90"}`}
            onClick={handleRefundCPT}
            title={
              !challenge.onchain_id
                ? "Challenge doesn't have on-chain data"
                : "Refund CPT"
            }
          >
            <Trophy className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {isRefunding ? "Refunding..." : "Refund CPT"}
            </span>
          </Button>
        )}

        {activePeriod === "CanFinalize" &&
          !isFailed &&
          // (isCreator || isParticipant) &&
          challenge.state === "active" && (
            <Button
              className={`w-full mb-4 ${
                activePeriod === "CanFinalize"
                  ? "bg-[#B3731D] hover:bg-[#B3731D]/90"
                  : "bg-gray-400"
              }`}
              onClick={handleFinalizeChallenge}
              disabled={
                isFinalizing ||
                !challenge.onchain_id ||
                activePeriod !== "CanFinalize" ||
                isFailed
              }
              title={
                !challenge.onchain_id
                  ? "Challenge doesn't have on-chain data"
                  : activePeriod !== "CanFinalize"
                    ? "Waiting for voting to end"
                    : "Finalize Challenge"
              }
            >
              <Trophy className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {isFinalizing
                  ? "Finalizing..."
                  : activePeriod !== "CanFinalize"
                    ? "Waiting for voting to end"
                    : "Finalize Payout"}
              </span>
            </Button>
          )}

        <div className="border border-[#9A9A9A] rounded-xl flex flex-col h-[500px] md:h-[calc(100vh-200px)]">
          <div className="p-3 border-b border-[#9A9A9A]">
            <h2 className="font-semibold">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">
                  No messages yet
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col ${
                      message.expand?.sender?.id === user?.id
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        {message.expand?.avatar ? (
                          <Image
                            src={message.expand?.avatar}
                            alt={message.expand?.username || "User avatar"}
                            width={24}
                            height={24}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <AvatarFallback>
                            {(message.expand?.username || "A")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <span className="text-xs text-gray-500">
                        {message.expand?.username || "Anonymous"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.created).toLocaleTimeString()}
                      </span>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                        message.expand?.sender?.id === user?.id
                          ? "bg-[#b3731d] text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="p-3 border-t border-[#9A9A9A]">
            <div className="flex gap-2">
              <Input
                placeholder={
                  !user
                    ? "Sign in to chat"
                    : !isParticipant && !isCreator
                      ? "Join challenge to chat"
                      : "Type your message"
                }
                className="rounded-full text-sm"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    (isParticipant || isCreator) &&
                    challengeState === "active" &&
                    !isFailed
                  ) {
                    handleSendMessage();
                  }
                }}
                disabled={
                  !user ||
                  (!isParticipant && !isCreator) ||
                  challengeState !== "active" ||
                  isFailed
                }
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={
                  !user ||
                  (!isParticipant && !isCreator) ||
                  challengeState !== "active" ||
                  isFailed
                }
                title={
                  !user
                    ? "Sign in to chat"
                    : !isParticipant && !isCreator
                      ? "Join challenge to chat"
                      : "Send message"
                }
              >
                Send
              </Button>
            </div>
            {user && !isParticipant && !isCreator && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Join the challenge to participate in the chat
              </p>
            )}
          </div>
        </div>

        <SubmitVideoDialog
          open={isSubmitDialogOpen}
          onOpenChange={setIsSubmitDialogOpen}
          challengeId={challenge.id}
          onSubmitSuccess={() => {
            setDataVersion((v) => v + 1);
            setIsSubmitDialogOpen(false);
          }}
        />
      </div>
    </div>
  );
}
