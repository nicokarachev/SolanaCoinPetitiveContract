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
        const balanceBefore = await connection.getBalance(adminKeypair.publicKey);

        const wallet: Wallet = {
            publicKey: adminKeypair.publicKey,
            signAllTransactions: async (txs) => txs.map((tx) => tx),
            signTransaction: async (tx) => tx,
            payer: adminKeypair,
        };

        const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
        const program = new Program(idl as unknown as Idl, provider) as Program<CoinpetitiveContract>;

        const challengePubkey = new PublicKey(challengePublicKey);

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

        const challenge = challenges[0];
        console.log("challenge found");
        console.log(challenge);

        // Fetch participants
        const { data: participants } = await supabase
            .from("users")
            .select("*")
            .in("id", challenge.participants);

        console.log(participants);

        const CPT_TOKEN_MINT = new PublicKey(process.env.NEXT_PUBLIC_CPT_TOKEN_MINT);
        const [treasuryPubkey] = PublicKey.findProgramAddressSync(
            [Buffer.from("treasury"), challengePubkey.toBuffer()],
            program.programId,
        );

        const [votingTreasuryPubkey] = PublicKey.findProgramAddressSync(
            [Buffer.from("voting_treasury"), challengePubkey.toBuffer()],
            program.programId,
        );

        const treasuryTokenAccount = getAssociatedTokenAddressSync(
            CPT_TOKEN_MINT,
            treasuryPubkey,
            true,
            TOKEN_2022_PROGRAM_ID,
        );

        const votingTreasuryTokenAccount = getAssociatedTokenAddressSync(
            CPT_TOKEN_MINT,
            votingTreasuryPubkey,
            true,
            TOKEN_2022_PROGRAM_ID,
        );

        // Fetch creator
        const { data: creator } = await supabase
            .from("users")
            .select("*")
            .eq("id", challenge.creator_id)
            .single();

        const creatorPubkey = new PublicKey(creator.pubkey);
        const creatorTokenAccount = getAssociatedTokenAddressSync(
            CPT_TOKEN_MINT,
            creatorPubkey,
            true,
            TOKEN_2022_PROGRAM_ID,
        );
        console.log(creator);

        const reward = new BN(challenge.reward * Math.pow(10, 9));
        console.log("reward: ");
        console.log(reward);

        console.log({
            challenge: challengePubkey,
            tokenProgram2022: TOKEN_2022_PROGRAM_ID,
            treasury: treasuryPubkey,
            treasuryTokenAccount,
            creatorTokenAccount,
        });

        // Refund reward to challenge creator
        const rewardRefundIx = await program.methods
            .handleCpt(reward, true)
            .accounts({
                authority: adminKeypair.publicKey,
                challenge: challengePubkey,
                tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                tokenMint: CPT_TOKEN_MINT,
                treasury: treasuryPubkey,
                treasuryTokenAccount,
                creatorTokenAccount,
            })
            .instruction();

        const rewardTx = new Transaction().add(rewardRefundIx);
        console.log("tx: ", rewardTx);
        const res = await sendAndConfirmTransaction(connection, rewardTx, [adminKeypair]);

        console.log("res: ", res);

        if (participants && participants.length > 0) {
            // Refund participation fees to all participants
            await Promise.all(
                participants.map(async (participant, i) => {
                    const participantPubkey = new PublicKey(participant.pubkey);
                    const participantTokenAccount = getAssociatedTokenAddressSync(
                        CPT_TOKEN_MINT,
                        participantPubkey,
                        true,
                        TOKEN_2022_PROGRAM_ID,
                    );

                    // Ensure participant has token account
                    const participantAccountInfo = await connection.getAccountInfo(participantTokenAccount);
                    if (!participantAccountInfo) {
                        const ix = createAssociatedTokenAccountInstruction(
                            adminKeypair.publicKey,
                            participantTokenAccount,
                            participantPubkey,
                            CPT_TOKEN_MINT,
                            TOKEN_2022_PROGRAM_ID,
                        );
                        const tx = new Transaction().add(ix);
                        await sendAndConfirmTransaction(connection, tx, [adminKeypair]);
                    }

                    // Transfer participation fee
                    const refundIx = await program.methods
                        .handleCpt(new BN(challenge.participation_fee * Math.pow(10, 9)), true)
                        .accounts({
                            authority: adminKeypair.publicKey,
                            challenge: challengePubkey,
                            tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                            treasury: treasuryPubkey,
                            treasuryTokenAccount,
                            tokenMint: CPT_TOKEN_MINT,
                            creatorTokenAccount: participantTokenAccount,
                        })
                        .instruction();

                    const tx = new Transaction().add(refundIx);
                    await sendAndConfirmTransaction(connection, tx, [adminKeypair]);
                }),
            );

            const { data: submissions, error: submissionsError } = await supabase
                .from("video_submissions")
                .select("*")
                .eq("challenge_id", challenge.id);

            if (submissionsError) {
                throw new Error(submissionsError.message);
            }
            console.log("submissions: ", submissions);

            await Promise.all(
                submissions.map(async (submission) => {
                    const { data: voters, error: votersError } = await supabase
                        .from("votes")
                        .select("*")
                        .eq("submission_id", submission.id);

                    console.log("voters: ", voters);

                    if (votersError) {
                        throw new Error(votersError.message);
                    }

                    await Promise.all(
                        voters.map(async (vote) => {
                            const { data: user, error: userError } = await supabase
                                .from("users")
                                .select("*")
                                .eq("id", vote.voter_id)
                                .single();

                            console.log(user);

                            if (userError) {
                                throw new Error(userError.message);
                            }

                            const voterPubkey = new PublicKey(user.pubkey);
                            const voterTokenAccount = getAssociatedTokenAddressSync(
                                CPT_TOKEN_MINT,
                                voterPubkey,
                                true,
                                TOKEN_2022_PROGRAM_ID,
                            );

                            // Ensure voter has token account
                            const voterAccountInfo = await connection.getAccountInfo(voterTokenAccount);
                            if (!voterAccountInfo) {
                                const ix = createAssociatedTokenAccountInstruction(
                                    adminKeypair.publicKey,
                                    voterTokenAccount,
                                    voterPubkey,
                                    CPT_TOKEN_MINT,
                                    TOKEN_2022_PROGRAM_ID,
                                );
                                const tx = new Transaction().add(ix);
                                await sendAndConfirmTransaction(connection, tx, [adminKeypair]);
                            }
                            console.log("voterTokenAccount: ", voterTokenAccount);

                            console.log({
                                challenge: challengePubkey,
                                tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                                treasury: votingTreasuryPubkey,
                                treasuryTokenAccount: votingTreasuryTokenAccount,
                                tokenMint: CPT_TOKEN_MINT,
                                creatorTokenAccount: voterTokenAccount,
                            })

                            const ix = await program.methods
                                .handleCpt(new BN(challenge.voting_fee * Math.pow(10, 9)), false)
                                .accounts({
                                    authority: adminKeypair.publicKey,
                                    challenge: challengePubkey,
                                    tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                                    treasury: votingTreasuryPubkey,
                                    treasuryTokenAccount: votingTreasuryTokenAccount,
                                    tokenMint: CPT_TOKEN_MINT,
                                    creatorTokenAccount: voterTokenAccount,
                                })
                                .instruction();

                            const tx = new Transaction().add(ix);
                            console.log("tx: ", tx);
                            const res = await sendAndConfirmTransaction(connection, tx, [adminKeypair]);
                            console.log(res);
                        })
                    );
                }),
            );
        }

        const claimIx = await program.methods
            .claimCreatorReward()
            .accounts({
                authority: adminKeypair.publicKey,
                challenge: challengePublicKey,
                tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                creatorTokenAccount: creatorTokenAccount,
                recipient: creatorPubkey,
                tokenMint: CPT_TOKEN_MINT,
                // @ts-expect-error treasury is valid but not recognized by inferred type
                treasury: treasuryPubkey,
                votingTreasury: votingTreasuryPubkey,
                treasuryTokenAccount: treasuryTokenAccount,
                votingTreasuryTokenAccount,
            })
            .instruction();

        console.log("claimIx: ", claimIx);

        const tx = new Transaction().add(claimIx);
        const claimSig = await sendAndConfirmTransaction(connection, tx, [
            adminKeypair,
        ]);
        console.log("claimSig: ", claimSig);

        // Update challenge state to failed
        await supabase.from("challenges").update({ state: "cancelled" }).eq("onchain_id", challengePublicKey);

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
            message: "Failed challenge refund",
            level: "error",
            category: "transfers",
            context: { errorMessage, path: "/api/refund-cpt" },
        });
        return NextResponse.json({ error: "Refund failed", detail: errorMessage }, { status: 500 });
    }
}
