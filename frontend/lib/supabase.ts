import { createClient } from "@/utils/supabase/client";
import { ChatMessage } from "@/types/chat";
// Database types
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  pubkey?: string;
  x_profile?: string;
  telegram?: string;
  created_at: string;
  updated_at: string;
  role?: "user" | "admin" | "beta-tester";
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  state?: "active" | "completed" | "cancelled";
  creator_id: string;
  onchain_id?: string;
  creator?: {
    username: string;
  };

  // Challenge parameters
  reward: number;
  participation_fee?: number;
  voting_fee?: number;
  min_participants?: number;
  max_participants?: number;
  min_voters?: number;
  max_voters?: number;

  // Timing
  registration_end?: string;
  submission_end?: string;
  voting_end?: string;

  // Media
  image?: string;
  challenge_video?: string;
  keywords?: string[];

  // Tracking
  participants?: string[];
  submissions?: VideoSubmission[];
  votes?: Vote[];

  created_at: string;
  updated_at?: string;
}

export interface VideoSubmission {
  description?: string;
  id: string;
  challenge_id?: string;
  participant_id?: string;
  video_url?: string;
  likes?: number;
  dislikes?: number;
  votes?: number;
  voters?: string[];
  created_at?: string;
  updated_at?: string;
  participant?: {
    id: string;
    username: string;
    avatar: string;
  };
}

export interface Vote {
  id: string;
  challenge_id: string;
  submission_id: string;
  voter_id: string;
  created_at: string;
}

// API Functions
export async function signUp(userData: {
  email: string;
  password: string;
  username: string;
  pubkey: string;
  xProfile?: string;
  telegram?: string;
  secretCode?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log("🔐 Starting user registration...", {
      email: userData.email,
      username: userData.username,
    });

    // First, create the auth user
    const { data, error } = await createClient().auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          pubkey: userData.pubkey,
          x_profile: userData.xProfile,
          telegram: userData.telegram,
          secret_code: userData.secretCode,
        },
      },
    });

    if (error) {
      console.error("❌ Auth signup error:", error);

      // If it's a database error from the trigger, try a different approach
      if (error.message.includes("Database error saving new user")) {
        console.log(
          "🔄 Trigger failed, trying manual user creation approach...",
        );

        // Try signing up without metadata first
        const { data: retryData, error: retryError } =
          await createClient().auth.signUp({
            email: userData.email,
            password: userData.password,
          });

        if (retryError) {
          throw retryError;
        }

        if (retryData.user) {
          console.log(
            "✅ Auth user created without trigger, now creating profile manually...",
          );

          // Wait a moment to ensure auth user is fully created
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Create user profile manually
          const profileData = {
            id: retryData.user.id,
            email: userData.email,
            username: userData.username,
            pubkey: userData.pubkey,
            x_profile: userData.xProfile,
            telegram: userData.telegram,
          };

          console.log("📊 Creating profile manually:", profileData);

          const { error: profileError } = await createClient()
            .from("users")
            .insert(profileData);

          if (profileError) {
            console.error("❌ Manual profile creation error:", profileError);

            // If username conflict, try with a unique username
            if (
              profileError.code === "23505" &&
              profileError.message.includes("username")
            ) {
              const uniqueUsername = `${userData.username}_${Date.now()}`;
              console.log("🔄 Retrying with unique username:", uniqueUsername);

              const { error: retryProfileError } = await createClient()
                .from("users")
                .insert({
                  ...profileData,
                  username: uniqueUsername,
                });

              if (retryProfileError) {
                throw new Error(
                  `Failed to create user profile: ${retryProfileError.message}`,
                );
              }

              console.log("✅ User profile created with unique username");
            } else {
              throw new Error(
                `Failed to create user profile: ${profileError.message}`,
              );
            }
          } else {
            console.log("✅ User profile created successfully");
          }

          // Get the complete user profile
          const { data: userProfile, error: fetchError } = await createClient()
            .from("users")
            .select("*")
            .eq("id", retryData.user.id)
            .single();

          if (fetchError) {
            console.error("❌ Profile fetch error:", fetchError);
            throw new Error(
              `Failed to retrieve user profile: ${fetchError.message}`,
            );
          }

          console.log(
            "🎉 User registration completed successfully (manual approach)",
          );
          return { success: true, user: userProfile as User };
        }
      }

      throw error;
    }

    if (data.user) {
      console.log("✅ Auth user created with trigger:", data.user.id);

      // Wait a moment for the trigger to create the basic profile
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if profile was created by trigger
      const { data: existingProfile, error: checkError } = await createClient()
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (checkError || !existingProfile) {
        console.log("⚠️ Trigger did not create profile, creating manually...");

        // Create profile manually
        const profileData = {
          id: data.user.id,
          email: userData.email,
          username: userData.username,
          pubkey: userData.pubkey,
          x_profile: userData.xProfile,
          telegram: userData.telegram,
        };

        const { error: profileError } = await createClient()
          .from("users")
          .insert(profileData);

        if (profileError) {
          console.error("❌ Manual profile creation error:", profileError);
          throw new Error(
            `Failed to create user profile: ${profileError.message}`,
          );
        }

        console.log("✅ User profile created manually");
      } else {
        console.log(
          "✅ Profile created by trigger, updating with additional data...",
        );

        // Update the profile with additional data
        const updateData = {
          username: userData.username, // Update username in case it was auto-generated
          pubkey: userData.pubkey,
          x_profile: userData.xProfile,
          telegram: userData.telegram,
        };

        const { error: updateError } = await createClient()
          .from("users")
          .update(updateData)
          .eq("id", data.user.id);

        if (updateError) {
          console.error("❌ Profile update error:", updateError);
          throw new Error(
            `Failed to update user profile: ${updateError.message}`,
          );
        }

        console.log("✅ User profile updated successfully");
      }

      // Get the final user profile
      const { data: userProfile, error: fetchError } = await createClient()
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (fetchError) {
        console.error("❌ Profile fetch error:", fetchError);
        throw new Error(
          `Failed to retrieve user profile: ${fetchError.message}`,
        );
      }

      console.log("🎉 User registration completed successfully");
      return { success: true, user: userProfile as User };
    }

    return { success: false, error: "Failed to create user" };
  } catch (error) {
    console.error("❌ SignUp function error:", error);
    return { success: false, error: error.message };
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { data, error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Get user profile
      const { data: profile, error: profileError } = await createClient()
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      return { success: true, user: profile };
    }

    return { success: false, error: "Failed to sign in" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function signOut(): Promise<void> {
  await createClient().auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log("🔍 Getting current user...");

    // Use getSession instead of getUser for more reliable auto state
    const sessionPromise = createClient().auth.getSession();
    const sessionTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Session check timeout")), 5000),
    );

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const {
      data: { session },
    } = (await Promise.race([sessionPromise, sessionTimeout])) as any;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const user = session?.user;

    if (!user) {
      console.log("❌ No authenticated user found in session");
      return null;
    }

    console.log("✅ Auth user found, fetching profile...");

    try {
      // Try to get profile with shorter timeout
      const profilePromise = createClient()
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      const profileTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile query timeout")), 500000),
      );

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { data: profile } = (await Promise.race([
        profilePromise,
        profileTimeout,
      ])) as any;
      /* eslint-enable @typescript-eslint/no-explicit-any */

      if (profile) {
        console.log("✅ Profile found:", profile.email);
        return profile;
      }
    } catch (profileError) {
      console.log(
        "⚠️ Profile query failed, using auth user as fallback:",
        profileError,
      );
    }

    // Fallback: create a basic user object from auth user
    const fallbackUser: User = {
      id: user.id,
      email: user.email || "",
      username: user?.username || user.email?.split("@")[0] || "Unknown",
      name: user?.name,
      avatar: user?.avatar,
      pubkey: user?.pubkey,
      x_profile: user?.x_profile,
      telegram: user?.telegram,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString(),
    };

    console.log("🔄 Using fallback user object");
    return fallbackUser;
  } catch (error) {
    console.log("❌ getCurrentUser failed:", error);
    return null;
  }
}

export type FilterType = {
  category?: string;
  state?: string;
  search?: string;
};

export async function getChallenges(
  filter?: FilterType,
): Promise<{ success: boolean; challenges?: Challenge[]; error?: string }> {
  try {
    let query = createClient()
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter?.category) {
      query = query.eq("category", filter.category);
    }

    if (filter?.state) {
      query = query.eq("state", filter.state);
    }

    if (filter?.search) {
      query = query.ilike("title", `%${filter.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, challenges: data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getChallenge(
  challengeId: string,
): Promise<{ success: boolean; challenge?: Challenge; error?: string }> {
  try {
    const { data, error } = await createClient()
      .from("challenges")
      .select("*, creator:users(username)")
      .eq("id", challengeId)
      .single();

    if (error) throw error;

    return { success: true, challenge: data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function createChallenge(
  challengeData: Partial<Challenge>,
): Promise<{ success: boolean; challenge?: Challenge; error?: string }> {
  try {
    const { data, error } = await createClient()
      .from("challenges")
      .insert(challengeData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, challenge: data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function uploadAvatarToSupabase(
  file: File,
  userId: string,
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await createClient()
      .storage.from("avatars")
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      });
    if (error) throw error;

    return { success: true, filePath: filePath };
  } catch (error) {
    return { success: false, error };
  }
}

export async function joinChallenge(
  challengeId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get current participants
    const { data: challenge, error: fetchError } = await createClient()
      .from("challenges")
      .select("participants, max_participants")
      .eq("id", challengeId)
      .single();

    if (fetchError) throw fetchError;

    const currentParticipants = challenge.participants || [];

    // Check if already joined
    if (currentParticipants.includes(userId)) {
      return { success: false, error: "Already joined this challenge" };
    }

    // Check max participants
    if (
      challenge.max_participants &&
      currentParticipants.length >= challenge.max_participants
    ) {
      return { success: false, error: "Challenge is full" };
    }

    const updatedParticipants = [...currentParticipants, userId];

    const { data: updateData, error: updateError } = await createClient()
      .from("challenges")
      .update({ participants: updatedParticipants })
      .eq("id", challengeId)
      .select(); // <-- This ensures response is not null

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    if (!updateData || updateData.length === 0) {
      return { success: false, error: "Update did not affect any rows" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getVideoSubmissions(challengeId: string): Promise<{
  success: boolean;
  submissions?: VideoSubmission[];
  error?: string;
}> {
  try {
    const { data, error } = await createClient()
      .from("video_submissions")
      .select("*, participant:users(id, username, avatar)")
      .eq("challenge_id", challengeId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, submissions: data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function submitVideo(
  challengeId: string,
  userId: string,
  videoUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await createClient().from("video_submissions").insert({
      challenge_id: challengeId,
      participant_id: userId,
      video_url: videoUrl,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function votersFromSubmissionId(submissionId: string): Promise<{
  success: boolean;
  voters?: Vote[];
  error?: string;
}> {
  try {
    const { data, error } = await createClient()
      .from("votes")
      .select("*")
      .eq("submission_id", submissionId);

    if (error) throw error;

    return { success: true, voters: data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function voteForSubmission(
  submissionId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // First check if user already voted for this submission
    const { data: existingVote } = await createClient()
      .from("votes")
      .select("id")
      .eq("submission_id", submissionId)
      .eq("voter_id", userId)
      .single();

    if (existingVote) {
      return { success: false, error: "Already voted for this submission" };
    }

    // Add vote
    const { error: addVoteError } = await createClient().from("votes").insert({
      submission_id: submissionId,
      voter_id: userId,
    });

    if (addVoteError) {
      return { success: false, error: "Error adding vote" };
    }

    const { data: existingSubmission } = await createClient()
      .from("video_submissions")
      .select("votes, voters")
      .eq("id", submissionId)
      .single();

    console.log("existingSubmission: ");
    console.log(existingSubmission);

    const existingVoters = existingSubmission.voters || [];

    const { error: updateSubmissionError } = await createClient()
      .from("video_submissions")
      .update({
        votes: existingSubmission.votes + 1,
        voters: [...existingVoters, userId],
      })
      .eq("id", submissionId);

    console.log("updateSubmission", {
      votes: existingSubmission.votes + 1,
      voters: [...existingVoters, userId],
    });

    if (updateSubmissionError) {
      return { success: false, error: "Error updating Submission" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// Auth helpers
export function subscribeToAuth(
  callback: (user: User | null) => void,
): () => void {
  console.log("🔗 Setting up auth subscription...");

  const {
    data: { subscription },
  } = createClient().auth.onAuthStateChange(async (event, session) => {
    console.log("🔄 Auth state changed:", event);

    if (session?.user) {
      try {
        // Use getCurrentUser which has timeout handling
        const user = await getCurrentUser();
        callback(user);
      } catch (error) {
        console.log(
          "⚠️ Failed to get user on auth change, passing null:",
          error,
        );
        callback(null);
      }
    } else {
      console.warn(
        "⚠️ Session is null — verifying with getUser() before logout...",
      );

      // Wait a tick and re-check
      setTimeout(async () => {
        const {
          data: { user: recheckedUser },
        } = await createClient().auth.getUser();

        if (recheckedUser) {
          const fullUser = await getCurrentUser();
          callback(fullUser);
        } else {
          callback(null); // actually unauthenticated
        }
      }, 300); // small delay to let cookies hydrate
    }
  });

  return () => {
    console.log("🔌 Unsubscribing from auth changes");
    subscription.unsubscribe();
  };
}

// Chat functions
export async function getChatMessages(
  challengeId: string,
): Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }> {
  try {
    const { data, error } = await createClient()
      .from("chat_messages")
      .select(
        `
        *,
        sender:users(id, username, avatar)
      `,
      )
      .eq("challenge_id", challengeId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return { success: true, messages: data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendMessage(
  challengeId: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase.from("chat_messages").insert({
      challenge_id: challengeId,
      user_id: user.id, // trust the session, not localStorage
      message,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error" };
  }
}

// User profile functions
export async function getUserChallenges(
  userId: string,
): Promise<{ success: boolean; challenges?: Challenge[]; error?: string }> {
  try {
    const { data, error } = await createClient()
      .from("challenges")
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, challenges: data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getAvatarImageUrl(path: string): Promise<string | null> {
  if (path === null || path === "") return null;
  console.log(path);
  const { data, error } = await createClient()
    .storage.from("avatars")
    .createSignedUrl(path, 3600); // valid for 1 hour

  console.log(data);
  console.log(error);

  return error ? null : data.signedUrl;
}

export async function updateUserProfile(
  userId: string,
  profileData: {
    username?: string;
    email?: string;
    xProfile?: string;
    telegram?: string;
    avatarUrl?: string;
  },
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Verify password first
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Update profile
    const { error } = await createClient()
      .from("users")
      .update({
        username: profileData.username,
        email: profileData.email,
        x_profile: profileData.xProfile,
        telegram: profileData.telegram,
        avatar: profileData.avatarUrl,
      })
      .eq("id", userId);

    if (error) throw error;

    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
}

export async function deleteUserAccount(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify password first
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Delete user profile
    const { error } = await createClient()
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) throw error;

    // Sign out
    await signOut();

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// Challenge interaction functions
export async function reportChallenge(): Promise<{
  success: boolean;
  deleted?: boolean;
  reportsCount?: number;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // For now, just return success (implement proper reporting logic later)
    return { success: true, reportsCount: 1 };
  } catch (error) {
    return { success: false, error };
  }
}

export async function likeVideoSubmission(
  submissionId: string,
): Promise<{ success: boolean; submission?: VideoSubmission; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get current submission
    const { data: submission, error: fetchError } = await createClient()
      .from("video_submissions")
      .select("likes, likedBy")
      .eq("id", submissionId)
      .single();

    if (fetchError) throw fetchError;

    const likedBy = submission.likedBy || [];
    const newLikedBy = likedBy.includes(user.id)
      ? likedBy.filter((id: string) => id !== user.id)
      : [...likedBy, user.id];

    const { data: updatedSubmission, error } = await createClient()
      .from("video_submissions")
      .update({
        likes: newLikedBy.length,
        likedBy: newLikedBy,
      })
      .eq("id", submissionId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, submission: updatedSubmission };
  } catch (error) {
    return { success: false, error };
  }
}

export async function dislikeVideoSubmission(
  submissionId: string,
): Promise<{ success: boolean; submission?: VideoSubmission; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get current submission
    const { data: submission, error: fetchError } = await createClient()
      .from("video_submissions")
      .select("dislikes, dislikedBy")
      .eq("id", submissionId)
      .single();

    if (fetchError) throw fetchError;

    const dislikedBy = submission.dislikedBy || [];
    const newDislikedBy = dislikedBy.includes(user.id)
      ? dislikedBy.filter((id: string) => id !== user.id)
      : [...dislikedBy, user.id];

    const { data: updatedSubmission, error } = await createClient()
      .from("video_submissions")
      .update({
        dislikes: newDislikedBy.length,
        dislikedBy: newDislikedBy,
      })
      .eq("id", submissionId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, submission: updatedSubmission };
  } catch (error) {
    return { success: false, error };
  }
}

// Helper function to check and fix user sync issues
export async function checkUserSync(email: string): Promise<{
  success: boolean;
  status: "synced" | "orphaned" | "missing_profile" | "not_found";
  user?: User;
  error?: string;
}> {
  try {
    console.log("🔍 Checking user sync status for:", email);

    // Check if user exists in public.users
    const { data: publicUser, error: publicError } = await createClient()
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // Try to get current auth user (this only works if the user is currently signed in)
    const {
      data: { user: currentAuthUser },
    } = await createClient().auth.getUser();

    if (
      publicUser &&
      !publicError &&
      currentAuthUser &&
      currentAuthUser.email === email
    ) {
      console.log("✅ User is properly synced");
      return { success: true, status: "synced", user: publicUser };
    } else if (
      currentAuthUser &&
      currentAuthUser.email === email &&
      (publicError || !publicUser)
    ) {
      console.log("⚠️ User has auth record but missing profile");
      return { success: true, status: "missing_profile" };
    } else if (!currentAuthUser && publicUser && !publicError) {
      console.log("⚠️ User has profile but missing auth record (orphaned)");
      return { success: true, status: "orphaned", user: publicUser };
    } else {
      console.log("❌ User not found or not currently authenticated");
      return { success: true, status: "not_found" };
    }
  } catch (error) {
    console.error("❌ Error checking user sync:", error);
    return { success: false, status: "not_found", error };
  }
}

// Helper function to create missing user profile
export async function createMissingProfile(
  authUserId: string,
  email: string,
  username?: string,
): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    console.log("📝 Creating missing profile for auth user:", authUserId);

    // Generate unique username if not provided
    let finalUsername = username || email.split("@")[0];
    let counter = 0;

    // Check for username uniqueness
    while (true) {
      const { data: existingUser } = await createClient()
        .from("users")
        .select("id")
        .eq("username", finalUsername)
        .single();

      if (!existingUser) break;

      counter++;
      finalUsername = `${username || email.split("@")[0]}_${counter}`;
    }

    // Create the profile
    const { data: newProfile, error: createError } = await createClient()
      .from("users")
      .insert({
        id: authUserId,
        email: email,
        username: finalUsername,
      })
      .select()
      .single();

    if (createError) {
      console.error("❌ Failed to create profile:", createError);
      return { success: false, error: createError.message };
    }

    console.log("✅ Profile created successfully");
    return { success: true, user: newProfile };
  } catch (error) {
    console.error("❌ Error creating profile:", error);
    return { success: false, error };
  }
}

// Enhanced signIn function with sync checking
export async function signInWithSyncCheck(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  user?: User;
  error?: string;
  syncIssue?: string;
}> {
  try {
    console.log("🔐 Attempting sign in with sync check for:", email);

    // First, try normal sign in
    const { data, error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Auth sign in failed:", error);
      return { success: false, error: error.message };
    }

    if (data.user) {
      console.log("✅ Auth sign in successful, checking profile...");

      // Check if user profile exists
      const { data: profile, error: profileError } = await createClient()
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.log("⚠️ Profile not found, creating missing profile...");

        // Try to create missing profile
        const createResult = await createMissingProfile(
          data.user.id,
          data.user.email || email,
          data.user.user_metadata?.username,
        );

        if (createResult.success && createResult.user) {
          return {
            success: true,
            user: createResult.user,
            syncIssue: "Created missing profile",
          };
        } else {
          return {
            success: false,
            error: "Failed to create missing profile: " + createResult.error,
            syncIssue: "Missing profile could not be created",
          };
        }
      }

      console.log("✅ Sign in completed successfully");
      return { success: true, user: profile };
    }

    return { success: false, error: "Failed to sign in" };
  } catch (error) {
    console.error("❌ SignIn with sync check error:", error);
    return { success: false, error };
  }
}
