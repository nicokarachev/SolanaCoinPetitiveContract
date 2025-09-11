import { NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";
import { Program, Idl, BN, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { idl, CoinpetitiveContract } from "@/utils/types";
import { createClient } from "@/utils/supabase/server";
import { logError } from "@/lib/supabase/logError";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string, {
  commitment: "confirmed",
});

export async function POST(req: Request) {
  const supabase = await createClient();

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: { user: validUser }, error: validError } = await supabase.auth.getUser(token);
  if (validError || !validUser) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  console.log("Hello, ", validUser.email);

  try {
    if (!process.env.ADMIN_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "environment is needed" },
        { status: 500 },
      );
    }
    const { challengePublicKey } = await req.json();

    const adminPrivateKey = bs58.decode(process.env.ADMIN_PRIVATE_KEY);
    const adminKeypair = Keypair.fromSecretKey(adminPrivateKey);
    const CPT_TOKEN_MINT = new PublicKey(
      process.env.NEXT_PUBLIC_CPT_TOKEN_MINT,
    );

    const balanceBefore = await connection.getBalance(adminKeypair.publicKey);

    const wallet: Wallet = {
      publicKey: adminKeypair.publicKey,
      signAllTransactions: async (txs) =>
        txs.map((tx) => {
          return tx;
        }),
      signTransaction: async (tx) => {
        return tx;
      },
      payer: adminKeypair,
    };

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new Program(
      idl as unknown as Idl,
      provider,
    ) as Program<CoinpetitiveContract>;

    console.log("program is initalized:", program.programId);

    const challengePubkey = new PublicKey(challengePublicKey);

    const [adminPDA] = await PublicKey.findProgramAddressSync(
      [Buffer.from("admin_panel")],
      program.programId,
    );

    const challengeAccountInfo =
      await connection.getAccountInfo(challengePubkey);
    if (!challengeAccountInfo) {
      return NextResponse.json({
        success: false,
        error: "Challenge not found on blockchain",
      });
    }

    const { data: challenges, error: challengeFetchError } = await supabase
      .from("challenges")
      .select("*, creator_id")
      .eq("onchain_id", challengePublicKey)

    if (challengeFetchError) {
      return NextResponse.json({
        success: false,
        error: "Challenge not found in Supabase",
      });
    }

    if (challenges?.[0].state !== 'active') {
      return NextResponse.json({
        success: false,
        error: "Challenge is not active. Someone is in finalizing or refunding now.",
      });
    }

    // Update Supabase challenge status
    const { error: pendingError } = await supabase
      .from("challenges")
      .update({ state: "pending" })
      .eq("onchain_id", challengePublicKey);

    if (pendingError) {
      console.log(pendingError);
    }

    console.log("challenges:", JSON.stringify(challenges));

    const { data: users, error: userFetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", challenges?.[0]?.creator_id);

    if (challengeFetchError || !challenges || challenges.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Challenge not found in Supabase",
      });
    }

    if (userFetchError || !users || users.length === 0) {
      return NextResponse.json({
        success: false,
        error: "User not found in Supabase",
      });
    }

    const user = users[0];
    const creatorPubkey = user?.pubkey
      ? new PublicKey(user.pubkey)
      : adminKeypair.publicKey;

    const [treasuryPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), challengePubkey.toBuffer()],
      program.programId,
    );

    const treasuryTokenAccount = getAssociatedTokenAddressSync(
      CPT_TOKEN_MINT,
      treasuryPubkey,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    console.log("treasuryTokenAccount:", treasuryTokenAccount.toString());

    const creatorTokenAccount = getAssociatedTokenAddressSync(
      CPT_TOKEN_MINT,
      creatorPubkey,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    const { data: submissions } = await supabase
      .from("video_submissions")
      .select("*")
      .eq("challenge_id", challenges[0].id);

    console.log("submissions:", JSON.stringify(submissions));

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No submissions found",
      });
    }

    const submissionIds = submissions?.map((s) => s.id) ?? [];

    const { data: votes } = await supabase
      .from("votes")
      .select("submission_id, voter_id")
      .in("submission_id", submissionIds);

    console.log("votes:", JSON.stringify(votes));

    if (!votes || votes.length === 0) {
      return NextResponse.json({ success: false, error: "No votes found" });
    }

    const submissionVoteCount: Record<string, number> = {};
    votes.forEach((v) => {
      submissionVoteCount[v.submission_id] =
        (submissionVoteCount[v.submission_id] || 0) + 1;
    });

    console.log("submissionVoteCount:", JSON.stringify(submissionVoteCount));

    const maxVotes = Math.max(...Object.values(submissionVoteCount));

    const topSubmissionIds = Object.entries(submissionVoteCount)
      .filter(([_, count]) => count === maxVotes)
      .map(([submissionId]) => submissionId);

    const topVoterIds = votes
      .filter((v) => topSubmissionIds.includes(v.submission_id))
      .map((v) => v.voter_id);

    console.log("topVoterIds:", topVoterIds);

    const topSubmissions = submissions.filter((s) =>
      topSubmissionIds.includes(s.id),
    );

    console.log("topSubmissions:", JSON.stringify(topSubmissions));

    const { data: winnerUsers } = await supabase
      .from("users")
      .select("id, username, pubkey, avatar")
      .in("id", topVoterIds);

    console.log("winnerUsers:", winnerUsers);

    for (const winnerSubmission of topSubmissions) {
      if (!winnerSubmission.participant_id) {
        return NextResponse.json({ success: false, error: "Winner's wallet address not found" });
      }
    }

    const participantIds = topSubmissions
      .map((s) => s.participant_id)
      .filter((id): id is string => !!id);

    if (participantIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No winner wallet addresses found",
      });
    }

    const { data: topWinners } = await supabase
      .from("users")
      .select("*")
      .in("id", participantIds);

    const finalizeIx = await program.methods
      .finalizeChallenge(new BN(topWinners.length))
      .accounts({
        authority: adminKeypair.publicKey,
        challenge: challengePubkey,
        // @ts-expect-error - adminPanel is valid but not recognized by inferred type
        adminPanel: adminPDA,
        tokenMint: CPT_TOKEN_MINT,
        tokenProgram2022: TOKEN_2022_PROGRAM_ID,
        treasury: treasuryPubkey,
        treasuryTokenAccount,
        platformTreasuryTokenAccount: new PublicKey(
          // "BEcHbgDvaDukTCpoDtz1fpG4B7X9FvFshzZ3MJPyRDzf", //Mainnet CPT Token Account
          "J3yCxeNeAiCCcCg8g9yd4DHYQykoQ3PqLrd38rTjWLnC", // Mainnet Update CPT Token
          // "FKTCHhbcjhLSJoXZA96HJnGJccBtuBJS8kDU3JJWbzg9" //Devnet CPT Token Account
        ),
        creatorTokenAccount,
      })
      .instruction();
    const finalizeTx = new Transaction().add(finalizeIx);

    const sig = await sendAndConfirmTransaction(connection, finalizeTx, [
      adminKeypair,
    ]);
    console.log("Finalized challenge");
    console.log("sig:", sig);

    // await Promise.all(
    //   topWinners.map(async (topWinner, i) => {

    for (let i = 0; i < topWinners.length; i++) {
      const topWinner = topWinners[i];
      console.log(
        `Processing winner ${i + 1}/${topWinners.length
        }: (${topWinner.pubkey.toString().substring(0, 8)}...)`,
      );

      const winnerPubkey = new PublicKey(topWinner.pubkey);
      const winnerTokenAccount = getAssociatedTokenAddressSync(
        CPT_TOKEN_MINT,
        winnerPubkey,
        true,
        TOKEN_2022_PROGRAM_ID,
      );
      const winnerTokenAccountInfo =
        await connection.getAccountInfo(winnerTokenAccount);

      if (!winnerTokenAccountInfo) {
        const ix = createAssociatedTokenAccountInstruction(
          adminKeypair.publicKey,
          winnerTokenAccount,
          winnerPubkey,
          CPT_TOKEN_MINT,
          TOKEN_2022_PROGRAM_ID,
        );
        const tx = new Transaction().add(ix);
        const sig = await sendAndConfirmTransaction(connection, tx, [
          adminKeypair,
        ]);

        console.log("Created token account for winner");
        console.log("sig:", sig);
      }

      const creatorTokenAccountInfo =
        await connection.getAccountInfo(creatorTokenAccount);

      console.log(creatorTokenAccountInfo);

      if (!creatorTokenAccountInfo) {
        const ix = createAssociatedTokenAccountInstruction(
          adminKeypair.publicKey,
          creatorTokenAccount,
          creatorPubkey,
          CPT_TOKEN_MINT,
          TOKEN_2022_PROGRAM_ID,
        );

        const tx = new Transaction().add(ix);
        const sig = await sendAndConfirmTransaction(connection, tx, [
          adminKeypair,
        ]);
        console.log("Created token account for creator");
        console.log("sig:", sig);
      }

      const distributeRewardIx = await program.methods
        .distributeReward()
        .accounts({
          authority: adminKeypair.publicKey,
          challenge: challengePubkey,
          // @ts-expect-error - adminPanel is valid but not recognized by inferred type
          adminPanel: adminPDA,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          winnerTokenAccount: winnerTokenAccount,
          treasury: treasuryPubkey,
          treasuryTokenAccount,
          tokenMint: CPT_TOKEN_MINT,
          tokenProgram2022: TOKEN_2022_PROGRAM_ID,
        })
        .instruction();
      const distributeRewardTx = new Transaction().add(distributeRewardIx);

      const sig = await sendAndConfirmTransaction(
        connection,
        distributeRewardTx,
        [adminKeypair],
      );
      console.log("Distributed reward for challenge");
      console.log("sig:", sig);
    }
    // );

    const [votingTreasuryPubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("voting_treasury"), challengePubkey.toBuffer()],
      program.programId,
    );

    const votingTreasuryTokenAccount = getAssociatedTokenAddressSync(
      CPT_TOKEN_MINT,
      votingTreasuryPubkey,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    console.log("winnerUsers: ");
    console.log(winnerUsers);

    for (let i = 0; i < winnerUsers.length; i++) {
      // await Promise.all(
      //   winnerUsers.map(async (user, i) => {
      const user = winnerUsers[i];
      const voterPubkey = new PublicKey(user.pubkey);
      const username = user.username || "Unknown";

      console.log(
        `Processing voter ${i + 1}/${winnerUsers.length
        }: ${username} (${voterPubkey.toString().substring(0, 8)}...)`,
      );

      const voterTokenAccount = getAssociatedTokenAddressSync(
        CPT_TOKEN_MINT,
        voterPubkey,
        false,
        TOKEN_2022_PROGRAM_ID,
      );

      const voterAccountInfo =
        await connection.getAccountInfo(voterTokenAccount);
      if (!voterAccountInfo) {
        console.log(`Creating token account for voter ${i + 1}`);
        const createAtaIx = createAssociatedTokenAccountInstruction(
          adminKeypair.publicKey,
          voterTokenAccount,
          voterPubkey,
          CPT_TOKEN_MINT,
          TOKEN_2022_PROGRAM_ID,
        );

        const tx = new Transaction().add(createAtaIx);

        const sig = await sendAndConfirmTransaction(connection, tx, [
          adminKeypair,
        ]);
        console.log(`Created token account for voter ${i + 1}`);
        console.log("sig:", sig);
      }

      try {
        const distributeIx = await program.methods
          .distributeVotingTreasury(voterPubkey, new BN(winnerUsers.length))
          .accounts({
            authority: adminKeypair.publicKey,
            challenge: challengePubkey,
            tokenProgram2022: TOKEN_2022_PROGRAM_ID,
            votingTreasury: votingTreasuryPubkey,
            votingTreasuryTokenAccount: votingTreasuryTokenAccount,
            voterTokenAccount: voterTokenAccount,
            tokenMint: CPT_TOKEN_MINT,
          })
          .instruction();

        const tx = new Transaction().add(distributeIx);

        const sig = await sendAndConfirmTransaction(connection, tx, [
          adminKeypair,
        ]);
        console.log(`Distributed token for voter ${i + 1}`);
        console.log("sig:", sig);

        console.log(`Distributed to voter ${i + 1}, signature: ${sig}`);
      } catch (distError) {
        console.error(`Error distributing to voter ${i + 1}:`, distError);
      }
    }
    //   }),
    // );

    const claimIx = await program.methods
      .claimCreatorReward()
      .accounts({
        authority: adminKeypair.publicKey,
        challenge: challengePubkey,
        tokenProgram2022: TOKEN_2022_PROGRAM_ID,
        // @ts-expect-error treasury is valid but not recognized by inferred type
        treasury: treasuryPubkey,
        treasuryTokenAccount: treasuryTokenAccount,
        votingTreasury: votingTreasuryPubkey,
        votingTreasuryTokenAccount,
        creatorTokenAccount: creatorTokenAccount,
        tokenMint: CPT_TOKEN_MINT,
        recipient: creatorPubkey,
      })
      .instruction();

    const tx = new Transaction().add(claimIx);
    const claimSig = await sendAndConfirmTransaction(connection, tx, [
      adminKeypair,
    ]);
    console.log("claimSig: ", claimSig);

    // Update Supabase challenge status
    const { error } = await supabase
      .from("challenges")
      .update({ state: "completed" })
      .eq("onchain_id", challengePublicKey);

    if (error) {
      console.log(error);
    }

    const balanceAfter = await connection.getBalance(
      adminKeypair.publicKey,
    );

    const feesSpent = balanceBefore - balanceAfter;

    if (feesSpent > 0) {
      const refundIx = SystemProgram.transfer({
        fromPubkey: adminKeypair.publicKey,
        toPubkey: creatorPubkey,
        lamports: 0.0025 * LAMPORTS_PER_SOL - feesSpent,
      });



      const refundTx = new Transaction().add(refundIx);

      await sendAndConfirmTransaction(connection, refundTx, [
        adminKeypair,
      ]);
    }

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {

    if (err.logs) {
      console.error("Program logs:");
      err.logs.forEach((log: string) => console.error(log));
    }

    if (err.error) {
      console.error("Anchor error code:", err.error.errorCode);
      console.error("Anchor error message:", err.error.msg);
    }

    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    await logError({
      message: "Transfer failed",
      level: "error",
      category: "transfers",
      context: {
        errorMessage,
        path: "/api/your-endpoint",
      },
    });
    return NextResponse.json(
      { error: "Transfer failed", detail: errorMessage },
      { status: 500 },
    );
  }
}
