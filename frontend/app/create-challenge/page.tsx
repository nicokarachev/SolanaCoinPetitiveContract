"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChallenge as createChallengeDB } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import Link from "next/link";
import Image from "next/image";
import { Calendar, Upload } from "lucide-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchor } from "@/lib/anchor-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { toast } from "@/hooks/use-toast";
import { toast } from "sonner"; // Use Sonner toast instead
import { useWallet } from "@solana/wallet-adapter-react";
// import { Switch } from "@/components/ui/switch";
// import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "@/lib/use-auth";
import { CreateChallengeSectionAccordion } from "@/components/CreateChallengeSectionAccordion";

const MAX_USERS = 50;

// type ChallengeResult = {
//   success: boolean;
//   challenge?: any;
//   error?: string;
// };

const categories = ["Food", "Art", "Fitness", "Gaming", "Music"];

export default function CreateChallengePage() {
  // const recaptchaRef = useRef(null);
  const router = useRouter();
  // const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);

  const { createChallenge: createOnChainChallenge, getAdminWallet } =
    useAnchor();
  const [cptLimit, updateCptLimit] = useState(0);
  // const [user, setUser] = useState<User | null>(null);
  const { user } = useAuth();

  const { wallet, publicKey } = useWallet();

  // Move all useState declarations before any conditional returns
  const [formData, setFormData] = useState({
    challengetitle: "",
    category: "",
    minparticipants: "",
    maxparticipants: "",
    voters: "",
    votingFees: "",
    participation_fee: "",
    reward: "",
    description: "",
    challengevideo: "",
    keywords: "",
    registration_end: "",
    submission_end: "",
    voting_end: "",
    minvoters: "",
    maxvoters: "",
    superchallenge: false,
  });

  useEffect(() => {
    if (wallet) {
      getAdminWallet().then((adminWallet) => {
        updateCptLimit(adminWallet.cptLimit);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   const checkAuth = setTimeout(() => {
  //     setAuthChecked(true);
  //   }, 500);

  //   return () => clearTimeout(checkAuth);
  // }, [auth.isAuthenticated]);

  // Render loading state while checking auth
  // if (!authChecked) {
  //   return <div>Loading...</div>;
  // }

  // Only show auth warning after we've confirmed auth state
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to create a challenge
          </h1>
        </div>
      </div>
    );
  }

  const uploadImageToSupabase = async (file: File, userId: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `challenges/${fileName}`; // folder path in bucket

    const { error } = await createClient()
      .storage.from("challenge-images")
      .upload(filePath, file, {
        upsert: true, // overwrite if exists
        cacheControl: "3600", // 1 hour
      });

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }

    return filePath; // Save this path in your DB
  };

  const validateForm = () => {
    const requiredFields = {
      challengetitle: "Challenge Name",
      category: "Category",
      maxparticipants: "Participants",
      reward: "Reward",
      description: "Description",
      registration_end: "Registration Period",
      submission_end: "Submission Period",
      voting_end: "Voting Period",
      votingFees: "Voting Fee",
      participation_fee: "Participation Fee",
    };

    const emptyFields = Object.entries(requiredFields).filter(
      ([key]) => !formData[key as keyof typeof formData]
    );

    if (!selectedImage) {
      return "Challenge image is required";
    }

    if (emptyFields.length > 0) {
      return `Please fill in the following required fields: ${emptyFields
        .map(([label]) => label)
        .join(", ")}`;
    }

    if (Number(formData.maxparticipants) <= 0) {
      return "Number of participants must be greater than 0";
    }

    if (Number(formData.maxparticipants) > MAX_USERS) {
      return `Maximum participants cannot exceed ${MAX_USERS} due to blockchain storage limits`;
    }

    if (Number(formData.maxvoters) > MAX_USERS) {
      return `Maximum voters cannot exceed ${MAX_USERS} due to blockchain storage limits`;
    }

    if (Number(formData.reward) <= 0) {
      return "Reward must be greater than 0";
    }

    if (Number(formData.registration_end) <= 0) {
      return "Registration period must be greater than 0 days";
    }

    if (Number(formData.submission_end) <= 0) {
      return "Submission period must be greater than 0 days";
    }

    if (Number(formData.voting_end) <= 0) {
      return "Voting period must be greater than 0 days";
    }

    const minVoters = parseInt(formData.minvoters) || 0;
    const maxVoters = parseInt(formData.maxvoters) || 0;

    if (minVoters < 0) {
      return "Minimum voters cannot be negative";
    }

    if (maxVoters < minVoters) {
      return "Maximum voters must be greater than or equal to minimum voters";
    }

    return null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Get Anchor context for blockchain interactions

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    // const token = await recaptchaRef.current.executeAsync();
    // recaptchaRef.current.reset();

    // const res = await fetch("/api/verify-captcha", {
    //   method: "POST",
    //   body: JSON.stringify({ token }),
    // });

    // const data = await res.json();
    // if (data.success) {
    setError("");
    setIsLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    // Check if wallet is connected
    if (!publicKey || !wallet) {
      toast.warning("Please connect a wallet before proceeding");
      console.log("No Wallet found");
      setIsLoading(false);
      return;
    }

    const userKey = user.pubkey?.trim();
    const walletKey = publicKey.toBase58().trim();

    console.log("User PubKey:", userKey);
    console.log("Wallet PubKey:", walletKey);

    if (userKey !== walletKey) {
      toast("Please sign in with the wallet associated with this account");
      console.log("Wrong public key");
      setIsLoading(false);
      return;
    }

    console.log("Bout to try");
    try {
      // First create the challenge on the blockchain
      console.log("Creating challenge on the blockchain...");

      const imageUrl = selectedImage
        ? await uploadImageToSupabase(selectedImage, user?.id || "")
        : "";

      console.log("successfully uploaded image into supabase");

      // Convert values to correct format for blockchain
      const rewardLamports = Number(formData.reward) * LAMPORTS_PER_SOL;
      const participationFeeLamports =
        Number(formData.participation_fee) * LAMPORTS_PER_SOL;
      const votingFeeLamports = Number(formData.votingFees) * LAMPORTS_PER_SOL;

      // Send the transaction to the blockchain with correct parameter names
      const onChainResult = await createOnChainChallenge({
        reward: rewardLamports,
        participationFee: participationFeeLamports, // Changed from registrationFee
        votingFee: votingFeeLamports,
        superChallenge: formData.superchallenge,
      });

      if (!onChainResult.success) {
        throw new Error(
          onChainResult.error || "Failed to create challenge on blockchain"
        );
      }

      console.log("Challenge created on blockchain:", onChainResult);
      console.log(
        "Challenge ID from blockchain (for Supabase):",
        onChainResult.challengePublicKey
      );

      if (!onChainResult.challengePublicKey) {
        console.error(
          "No challenge public key returned from blockchain - this is required for Supabase"
        );
        throw new Error("Failed to get challenge public key from blockchain");
      }

      // Now create the challenge in your database
      const now = new Date();

      // Calculate the end dates - Change from days to minutes
      const registrationEndDate = new Date(
        now.getTime() + parseInt(formData.registration_end) * 60 * 1000
      );
      const submissionEndDate = new Date(
        registrationEndDate.getTime() +
        parseInt(formData.submission_end) * 60 * 1000
      );
      const votingEndDate = new Date(
        submissionEndDate.getTime() + parseInt(formData.voting_end) * 60 * 1000
      );

      // Then create the challenge in your database
      const result = await createChallengeDB({
        title: formData.challengetitle,
        description: formData.description,
        category: formData.category,
        creator_id: user?.id || "",
        onchain_id: onChainResult.challengePublicKey || "",

        // Challenge parameters
        reward: Number(formData.reward),
        participation_fee: Number(formData.participation_fee),
        voting_fee: Number(formData.votingFees),
        min_participants: parseInt(formData.minparticipants) || 1,
        max_participants: parseInt(formData.maxparticipants),
        min_voters: parseInt(formData.minvoters) || 0,
        max_voters: parseInt(formData.maxvoters) || 0,

        // Timing - convert to ISO strings
        registration_end: registrationEndDate.toISOString(),
        submission_end: submissionEndDate.toISOString(),
        voting_end: votingEndDate.toISOString(),

        // Media
        image: imageUrl,
        challenge_video: formData.challengevideo || undefined,
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k),

        // Tracking
        participants: [],

        // State
        state: "active" as const,
      });

      if (result.success && result.challenge) {
        toast.success("Your challenge has been created successfully!");
        router.push(`/challenge/${result.challenge.id}`);
      } else {
        setError(result.error || "Failed to create challenge in database");
      }
    } catch (error: unknown) {
      console.error("Challenge creation error:", error);

      // Better handling of Solana errors
      if (
        error &&
        typeof error === "object" &&
        "logs" in error &&
        Array.isArray(error.logs)
      ) {
        console.error("Transaction logs:", error.logs);
        // Extract the specific error from Solana logs if possible
        const errorMessage = error.logs.find((log: string) =>
          log.includes("Error:")
        );
        setError(
          errorMessage ||
          (error instanceof Error ? error.message : "An error occurred")
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred during challenge creation");
      }
    } finally {
      setIsLoading(false);
    }
    // }
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newKeyword = keywordInput.trim();

      if (newKeyword && keywords.length < 5 && !keywords.includes(newKeyword)) {
        setKeywords([...keywords, newKeyword]);
        setKeywordInput("");
        setFormData((prev) => ({
          ...prev,
          keywords: [...keywords, newKeyword].join(","),
        }));
      }
    } else if (e.key === "Backspace" && keywordInput === "") {
      e.preventDefault();
      const newKeywords = keywords.slice(0, -1);
      setKeywords(newKeywords);
      setFormData((prev) => ({
        ...prev,
        keywords: newKeywords.join(","),
      }));
    }
  };

  const removeKeyword = (indexToRemove: number) => {
    const newKeywords = keywords.filter((_, index) => index !== indexToRemove);
    setKeywords(newKeywords);
    setFormData((prev) => ({
      ...prev,
      keywords: newKeywords.join(","),
    }));
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1200px] mx-auto">
      <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="text-[#B3731D] mb-1">Great!</div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-8">
          Lets Challenge People
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-6 md:gap-8">
          <div className="bg-gray-100 rounded-3xl flex items-center justify-center h-[250px] sm:h-[300px] relative overflow-hidden group border border-[#8a8a8a] mx-auto w-full max-w-[300px]">
            {previewUrl ? (
              <>
                <Image
                  src={previewUrl}
                  alt="Challenge preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer text-white flex flex-col items-center">
                    <Upload className="w-8 h-8 mb-2" />
                    <span>Change Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </>
            ) : (
              <label className="cursor-pointer text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <span className="text-sm text-gray-500">
                  Upload Challenge Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl font-semibold mb-2 sm:mb-4">
              Basic Details
            </h2>

            {/* <div className="flex items-center gap-4 pt-2">
              <Label htmlFor="superchallenge" className="text-base font-medium">
                Super Challenge Mode
              </Label>
              <Switch
                id="superchallenge"
                checked={formData.superchallenge}
                onCheckedChange={(value) =>
                  setFormData((prev) => ({ ...prev, superchallenge: value }))
                }
              />
            </div> */}
            {/* <p className="text-sm text-gray-500 mt-1">
              Enable this if the challenge creator will pay the full reward
              upfront.
            </p> */}

            <div className="grid grid-cols-1 sm:grid-cols-[1fr,300px] gap-4">
              <div>
                <Label>Challenge Name</Label>
                <Input
                  placeholder="Type Here"
                  value={formData.challengetitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      challengetitle: e.target.value,
                    }))
                  }
                  className="border-[#8a8a8a] rounded-[50px]"
                  required
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                  required
                >
                  <SelectTrigger className="border-[#8a8a8a] rounded-[50px]">
                    <SelectValue placeholder="Select One" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CreateChallengeSectionAccordion
              title="Challenge Timeframes"
              description="You can control the timeframe for each event in the challenge.
              Enter your time in minutes... ie. 60 minutes = 1 hour, 1440
              minutes = 1 day, 10080 minutes = 1 week, etc."
              isOpen={openSection === "timeframes"}
              onToggle={() =>
                setOpenSection((prev) =>
                  prev === "timeframes" ? null : "timeframes"
                )
              }
            />

            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "registration_end", label: "Registration" },
                { key: "submission_end", label: "Submission" },
                { key: "voting_end", label: "Voting" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div>
                    <Label>{label}</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData[key]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [key]: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="Minutes"
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <CreateChallengeSectionAccordion
              title="Participants & Voters"
              description="Keep in mind that Solana charges rent for each participant and voter,
              so setting these values too high may result in higher costs. But, you will get 
              any unused rent back at the end of the challenge."
              isOpen={openSection === "participants"}
              onToggle={() =>
                setOpenSection((prev) =>
                  prev === "participants" ? null : "participants"
                )
              }
            />
            {/* Participants & Voters */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Participants",
                  min: "minparticipants",
                  max: "maxparticipants",
                },
                { label: "Voters", min: "minvoters", max: "maxvoters" },
              ].map(({ label, min, max }) => (
                <div key={label}>
                  <Label>{label}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={formData[min]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [min]: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={formData[max]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [max]: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <CreateChallengeSectionAccordion
              title="Challenge Parameters"
              description="Set balanced values to ensure fair competition and smooth flow. Too high limits may raise Solana rent costs, while too low may limit engagement. Rewards and fees should motivate participation without making it too costly. Recommended: 3–50 participants, 3–50 voters, entry time 5k minutes, submission time 2.5k minutes, voting time 5k minutes, reward 12.5k CPT, entry fee 4.65k CPT, voting fee 1k CPT. Recommended values are based on simulations to improve the likelihood of successful challenges and to ensure that payouts remain worthwhile after transaction fees. But ultimately you are free to set them to whatever you want."
              isOpen={openSection === "parameters"}
              onToggle={() =>
                setOpenSection((prev) =>
                  prev === "parameters" ? null : "parameters"
                )
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Voting Fee</Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.votingFees}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      votingFees:
                        e.target.valueAsNumber >= 0 ? e.target.value : "0",
                    }))
                  }
                  className="border-[#8a8a8a] rounded-[50px]"
                  placeholder="0.000 CPT"
                  required
                />
              </div>
              <div>
                <Label>Participation Fee</Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.participation_fee}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      participation_fee:
                        e.target.valueAsNumber >= 0 ? e.target.value : "0",
                    }))
                  }
                  className="border-[#8a8a8a] rounded-[50px]"
                  placeholder="0.000 CPT"
                  required
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <Label>Reward</Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.reward}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reward:
                        cptLimit > 0 && e.target.valueAsNumber > cptLimit
                          ? cptLimit.toString()
                          : e.target.valueAsNumber >= 0
                            ? e.target.value
                            : "0",
                      // e.target.valueAsNumber <=
                      //   parseFloat(formData.participation_fee) *
                      //     parseFloat(formData.minparticipants) ||
                      // formData.superchallenge === true
                      //   ? e.target.value
                      //   : (
                      //       parseFloat(formData.participation_fee) *
                      //       parseFloat(formData.minparticipants)
                      //     ).toString(),
                    }))
                  }
                  className="border-[#8a8a8a] rounded-[50px]"
                  placeholder="0.000 CPT"
                  required
                />
              </div>
            </div>
            <CreateChallengeSectionAccordion
              title="Description & Rules"
              description="Provide a detailed description of your challenge, including rules,
             guidelines, and any other relevant information. This will guide participants 
             in creating successful submissions, and act as a guideline for voters."
              isOpen={openSection === "description"}
              onToggle={() =>
                setOpenSection((prev) =>
                  prev === "description" ? null : "description"
                )
              }
            />
            <div>
              <Label>Description & Rules</Label>
              <Textarea
                placeholder="Type Here"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="h-32 border-[#8a8a8a] rounded-[20px]"
                required
              />
            </div>

            <h2 className="text-xl font-semibold pt-2 sm:pt-4">
              Other Details
            </h2>
            <CreateChallengeSectionAccordion
              title="Challenge Video & Keywords"
              description={
                <>
                  You can provide an example video showing users what is
                  expected for a valid submission. Optionally, you can provide a
                  video URL that explains the challenge in detail. You can also
                  add keywords to help categorize and search for your challenge.
                  Supported video links currently are{" "}
                  <span className="font-bold text-red-600">
                    YouTube and TikTok
                  </span>
                  .
                </>
              }
              isOpen={openSection === "video"}
              onToggle={() =>
                setOpenSection((prev) => (prev === "video" ? null : "video"))
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Challenge Video URL</Label>

                <Input
                  type="url"
                  placeholder="Paste video URL"
                  value={formData.challengevideo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      challengevideo: e.target.value,
                    }))
                  }
                  className="border-[#8a8a8a] rounded-[50px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported: YouTube, Twitter, Instagram, TikTok
                </p>
              </div>
              <div>
                <Label>Keywords</Label>
                <div className="relative">
                  <div className="flex flex-wrap gap-2 p-2 min-h-[44px] border border-[#8a8a8a] rounded-[50px] bg-white">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-[#f8f1e9] text-[#B3731D] rounded-full text-sm"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(index)}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                      placeholder={
                        keywords.length >= 5 ? "Max 5" : "Type & press Enter"
                      }
                      className="flex-1 outline-none border-none bg-transparent placeholder:text-gray-400 min-w-[80px] text-sm"
                      disabled={keywords.length >= 5}
                    />
                  </div>
                  <div className="absolute right-3 top-[50%] -translate-y-[50%] text-xs text-gray-400">
                    {keywords.length}/5
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter or comma to add. Max 5 keywords.
                </p>
              </div>
            </div>
            {/* <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              size="invisible"
              ref={recaptchaRef}
            /> */}

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4">
              <Button
                variant="outline"
                className="px-8 rounded-[50px] w-full sm:w-auto order-2 sm:order-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                className="px-8 bg-[#B3731D] hover:bg-[#B3731D]/90 rounded-[50px] w-full sm:w-auto order-1 sm:order-2"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Challenge Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center mt-4">{error}</div>
      )}
    </div>
  );
}
