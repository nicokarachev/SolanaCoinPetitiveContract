"use client";

import * as anchor from "@coral-xyz/anchor";
import {
  Program,
  AnchorProvider as AnchorSDKProvider,
  Idl,
} from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  Connection,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { createContext, useContext, useMemo } from "react";
import { idl } from "@/utils/types";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { isMobileDevice } from "./utils";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

export const PROGRAM_ID = new PublicKey(idl.address);
export const PROGRAM_TREASURY = new PublicKey(
  "FuFzoMF5xTwZego84fRoscnart4dPYNkpHho2UBe7NDt",
);
export const CPT_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_CPT_TOKEN_MINT,
);

function getAssociatedToken2022AddressSync(
  mint: PublicKey,
  owner: PublicKey,
): PublicKey {
  return getAssociatedTokenAddressSync(
    mint,
    owner,
    true, // allowOwnerOffCurve
    TOKEN_2022_PROGRAM_ID, // programId
  );
}

// Define program account types
type ChallengeAccount = {
  creator: PublicKey;
  is_active: boolean; // Changed from isActive
  reward: anchor.BN;
  participation_fee: anchor.BN; // Changed from participationFee
  voting_fee: anchor.BN; // Changed from votingFee
  challenge_treasury: anchor.BN; // Changed from challengeTreasury
  voting_treasury: anchor.BN; // Changed from votingTreasury
  winner: PublicKey | null;
  total_votes: anchor.BN; // Changed from totalVotes
  winning_votes: anchor.BN; // Changed from winningVotes
  reward_token_mint: PublicKey; // Changed from rewardTokenMint
  participants: PublicKey[];
  max_participants: number; // Changed from maxParticipants
  submission_votes: [PublicKey, anchor.BN][]; // Changed from submissionVotes
  voters: [PublicKey, PublicKey][];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Index signature allowing access with string keys
};

// Define typed program interface
interface CoinpetitiveProgram extends Program<Idl> {
  account: {
    challenge: {
      fetch(address: PublicKey): Promise<ChallengeAccount>;
      // Add other methods you might use like fetchMultiple, all, etc.
    };
    // Add other account types if needed
  };
}

// Function to provide Anchor context values
export function useAnchorContextProvider(): AnchorContextType {
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string);
  const anchorWallet = useWallet();

  // Convert undefined to null for type compatibility
  const wallet = anchorWallet || null;

  const program = useMemo(() => {
    if (!wallet || !connection) return null;

    const provider = new AnchorSDKProvider(
      connection,
      wallet, // Now this is either an AnchorWallet or null
      AnchorSDKProvider.defaultOptions(),
    );

    return new Program(
      idl as unknown as Idl,
      provider,
    ) as unknown as CoinpetitiveProgram;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  const createChallenge = async ({
    reward,
    participationFee,
    votingFee,
    superChallenge,
  }: {
    reward: number;
    participationFee: number;
    votingFee: number;
    superChallenge: boolean;
    maxParticipants?: number;
  }) => {
    if (!program || !wallet || !connection) {
      throw new Error("Wallet not connected");
    }

    try {
      const adjustedReward = reward;
      const adjustedParticipationFee = participationFee;
      const adjustedVotingFee = votingFee;

      console.log("Creating challenge with adjusted amounts:", {
        originalReward: reward,
        adjustedReward: adjustedReward,
        originalParticipationFee: participationFee,
        adjustedParticipationFee: adjustedParticipationFee,
        originalVotingFee: votingFee,
        adjustedVotingFee: adjustedVotingFee,
        superChallenge: superChallenge,
      });

      // Generate a unique challenge ID using timestamp
      const challengeId = new anchor.BN(Date.now());

      const challengeIdBuffer = challengeId.toArrayLike(Buffer, "le", 8);

      const [challengePubkey] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("challenge"),
          wallet.publicKey.toBuffer(),
          challengeIdBuffer,
        ],
        program.programId,
      );

      // Derive PDAs and find token accounts - no changes to this part
      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury"), challengePubkey.toBuffer()],
        program.programId,
      );

      const [votingTreasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("voting_treasury"), challengePubkey.toBuffer()],
        program.programId,
      );

      // Find token accounts - no changes
      const treasuryTokenAccount = getAssociatedTokenAddressSync(
        CPT_TOKEN_MINT,
        treasuryPDA,
        true,
        TOKEN_2022_PROGRAM_ID,
      );

      const votingTreasuryTokenAccount = getAssociatedTokenAddressSync(
        CPT_TOKEN_MINT,
        votingTreasuryPDA,
        true,
        TOKEN_2022_PROGRAM_ID,
      );

      const userTokenAccount = getAssociatedToken2022AddressSync(
        CPT_TOKEN_MINT,
        wallet.publicKey,
      );

      console.log("Creating challenge with parameters:", {
        reward: adjustedReward.toString(),
        participationFee: adjustedParticipationFee.toString(),
        votingFee: adjustedVotingFee.toString(),
        challengePubkey,
        treasuryPDA: treasuryPDA.toString(),
        creatorTokenAccount: userTokenAccount.toString(),
        treasuryTokenAccount: treasuryTokenAccount.toString(),
      });

      // Get the latest blockhash for better transaction confirmation
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      console.log({
        user: wallet.publicKey.toBase58(),
        challenge: challengePubkey.toBase58(),
        treasury: treasuryPDA.toBase58(),
        votingTreasury: votingTreasuryPDA.toBase58(),
        programAccount: PROGRAM_TREASURY.toBase58(),
        systemProgram: SystemProgram.programId.toBase58(),
        tokenProgram2022: TOKEN_2022_PROGRAM_ID.toBase58(),
        tokenMint: CPT_TOKEN_MINT.toBase58(),
        creatorTokenAccount: userTokenAccount.toBase58(),
        treasuryTokenAccount: treasuryTokenAccount.toBase58(),
        votingTreasuryTokenAccount: votingTreasuryTokenAccount.toBase58(),
        associatedTokenProgram: new PublicKey(
          "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
        ).toBase58(),
      })

      // BUILD TRANSACTION MANUALLY FOR MORE CONTROL
      const createChallengeIx = await program.methods
        .createChallenge(
          new anchor.BN(adjustedReward),
          new anchor.BN(adjustedParticipationFee),
          new anchor.BN(adjustedVotingFee),
          challengeId,
        )
        .accounts({
          user: wallet.publicKey,
          challenge: challengePubkey,
          treasury: treasuryPDA,
          votingTreasury: votingTreasuryPDA,
          programAccount: PROGRAM_TREASURY,
          systemProgram: SystemProgram.programId,
          tokenProgram2022: TOKEN_2022_PROGRAM_ID,
          tokenMint: CPT_TOKEN_MINT,
          creatorTokenAccount: userTokenAccount,
          treasuryTokenAccount: treasuryTokenAccount,
          votingTreasuryTokenAccount: votingTreasuryTokenAccount,
          associatedTokenProgram: new PublicKey(
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
          ),
        })
        .instruction();

      const transferIx = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey("E1QTbiXkxF4UebWLff2B5HWsLrSCsoK77CMC7cX2QXU"),
        lamports: 0.0025 * LAMPORTS_PER_SOL,
      });

      // Create transaction with the instruction
      const tx = new Transaction().add(createChallengeIx, transferIx);

      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = blockhash;

      let signedTx;
      if (!isMobileDevice()) {
        // Sign with wallet
        console.log("Transacting with wallet...");
        signedTx = await wallet.signTransaction(tx);
      } else {
        // console.log("Transacting with mobile wallet...");
        // signature = await wallet.sendTransaction(tx, connection);
        console.log("Transacting with mobile wallet...");
        signedTx = await transact(async (wallet: Web3MobileWallet) => {
          await wallet.authorize({
            cluster: "mainnet-beta",
            identity: {
              name: "Coinpetitive",
              uri: "https://coinpetitive.io",
            },
          });

          const signedTransactions = await wallet.signTransactions({
            transactions: [tx],
          });
          return signedTransactions[0];
        });
      }

      // Send the transaction with skipPreflight set to false for better validation
      console.log("Sending challenge creation transaction...");
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: false,
        },
      );

      console.log("Challenge creation transaction sent:", signature);

      try {
        // Use enhanced confirmation with timeout parameters
        console.log("Waiting for confirmation...");
        const status = await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          "confirmed",
        );

        if (status.value.err) {
          console.error("Transaction confirmed but failed:", status.value.err);
          return {
            success: false,
            error: `Transaction failed: ${JSON.stringify(status.value.err)}`,
          };
        }

        console.log(
          "Challenge created successfully! Transaction signature:",
          signature,
        );

        return {
          success: true,
          signature,
          challengePublicKey: challengePubkey.toString(),
          treasuryPublicKey: treasuryPDA.toString(),
          votingTreasuryPublicKey: votingTreasuryPDA.toString(),
        };
      } catch (confirmError) {
        // Special handling for confirmation timeout
        if (
          confirmError instanceof Error &&
          confirmError.message.includes("was not confirmed")
        ) {
          console.warn(
            "Transaction confirmation timed out but may still succeed",
          );
          return {
            success: false,
            error:
              "Transaction submitted but confirmation timed out. Check the transaction status manually.",
            pendingSignature: signature,
            challengePublicKey: challengePubkey.toString(),
            treasuryPublicKey: treasuryPDA.toString(),
            votingTreasuryPublicKey: votingTreasuryPDA.toString(),
          };
        }

        throw confirmError; // Re-throw other confirmation errors
      }
    } catch (error: unknown) {
      console.error("Error creating challenge:", error);
      // Extract the specific Anchor error if it exists
      let errorMessage = "Failed to create challenge";
      if (error instanceof Error) {
        errorMessage = error.message;

        if (errorMessage.includes("insufficient funds")) {
          errorMessage = "Insufficient funds!!!";
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const participateInChallenge = async (challengePublicKey: string) => {
    console.log("participate in challenge ---> ");
    if (!wallet || !wallet.publicKey || !connection) {
      return {
        success: false,
        error: "Wallet not connected",
      };
    }

    if (!program) {
      return {
        success: false,
        error: "Program not initialized",
      };
    }

    try {
      console.log("Program object:", program);
      console.log("Program accounts:", program.account);

      // Convert string to PublicKey
      const challengePubkey = new PublicKey(challengePublicKey);

      const [treasuryPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury"), challengePubkey.toBuffer()],
        program.programId,
      );

      // // If we reach here, we can try to fetch the challenge account
      // const challenge = await program.account.challenge.fetch(challengePubkey);
      // const treasuryPubkey = challenge.treasury;

      // Find the token accounts
      const participantTokenAccount = getAssociatedToken2022AddressSync(
        CPT_TOKEN_MINT,
        wallet.publicKey,
      );

      const treasuryTokenAccount = getAssociatedTokenAddressSync(
        CPT_TOKEN_MINT,
        treasuryPubkey,
        true, // allowOwnerOffCurve for PDA
        TOKEN_2022_PROGRAM_ID,
      );

      // Rest of the function remains the same...
      console.log("Participating in challenge:", challengePublicKey);
      console.log("Treasury:", treasuryPubkey.toString());
      console.log("Treasury token account:", treasuryTokenAccount.toString());
      console.log(
        "Participant token account:",
        participantTokenAccount.toString(),
      );

      // Call the payParticipationFee instruction
      const ix = await program.methods
        .payParticipationFee()
        .accounts({
          participant: wallet.publicKey,
          challenge: challengePubkey,
          treasury: treasuryPubkey,
          tokenMint: CPT_TOKEN_MINT,
          tokenProgram2022: TOKEN_2022_PROGRAM_ID,
          participantTokenAccount: participantTokenAccount,
          treasuryTokenAccount: treasuryTokenAccount,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: wallet.publicKey,
      }).add(ix);

      let signedTx;
      if (!isMobileDevice()) {
        // Sign with wallet
        console.log("Transacting with wallet...");
        signedTx = await wallet.signTransaction(tx);
      } else {
        // console.log("Transacting with mobile wallet...");
        // signature = await wallet.sendTransaction(tx, connection);
        console.log("Transacting with mobile wallet...");
        signedTx = await transact(async (wallet: Web3MobileWallet) => {
          await wallet.authorize({
            cluster: "mainnet-beta",
            identity: {
              name: "Coinpetitive",
              uri: "https://coinpetitive.io",
            },
          });

          const signedTransactions = await wallet.signTransactions({
            transactions: [tx],
          });
          return signedTransactions[0];
        });
      }

      const txid = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
      });
      // const txid = await wallet.sendTransaction(tx, connection, {
      //   skipPreflight: false,
      // })

      await connection.confirmTransaction({
        signature: txid,
        blockhash,
        lastValidBlockHeight,
      });

      console.log(
        "Successfully participated in challenge! Transaction signature:",
        tx,
      );
      return {
        success: true,
        signature: txid,
      };
    } catch (error: unknown) {
      console.error("Error participating in challenge:", error);

      // Extract the specific Anchor error if it exists
      let errorMessage = "Failed to join challenge";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for specific Anchor errors
        if (errorMessage.includes("MaxParticipantsReached")) {
          errorMessage =
            "This challenge is already full. Please try another challenge.";
        } else if (errorMessage.includes("AlreadyParticipated")) {
          errorMessage = "You are already participating in this challenge.";
        } else if (errorMessage.includes("fetch")) {
          errorMessage = "Unable to retrieve challenge data. Please try again.";
        } else if (errorMessage.includes("insufficient funds")) {
          errorMessage = "Insufficient funds!!!";
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const initAdminPanel = async () => {
    if (!wallet || !connection) {
      return { success: false, error: "Wallet not connected" };
    }

    if (!program) {
      return { success: false, error: "Program not initialized" };
    }
    try {
      console.log("Initializing admin panel...");
      const adminPubkey = wallet.publicKey;
      const [adminPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from("admin_panel")],
        program.programId,
      );

      const tx = await program.methods
        .initAdminPanel()
        .accounts({
          admin: adminPubkey,
          adminPanel: adminPDA,
        })
        .rpc({ skipPreflight: false }); // Enable preflight checks

      console.log(
        "Successfully initialized admin panel! Transaction signature:",
        tx,
      );
      return {
        success: true,
        signature: tx,
      };
    } catch (error: unknown) {
      console.error("Error initializing admin panel on-chain:", error);

      // Check if it's a timeout error but the transaction might still be processing
      if (
        error instanceof Error &&
        error.message.includes("was not confirmed")
      ) {
        return {
          success: false,
          error:
            "Transaction submitted but confirmation timed out. Check the transaction status manually.",
          pendingSignature: error.message.match(
            /Check signature ([^\s]+)/,
          )?.[1],
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const updateAdminPanel = async (updatedWallet: string) => {
    if (!wallet || !connection) {
      return { success: false, error: "Wallet not connected" };
    }

    if (!program) {
      return { success: false, error: "Program not initialized" };
    }
    try {
      console.log("updating admin panel...");
      const updatedPubkey = new PublicKey(updatedWallet);
      const adminPubkey = wallet.publicKey;
      const [adminPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from("admin_panel")],
        program.programId,
      );

      const tx = await program.methods
        .updateAdminPanel(updatedPubkey)
        .accounts({
          admin: adminPubkey,
          adminPanel: adminPDA,
        })
        .rpc({ skipPreflight: false }); // Enable preflight checks

      console.log(
        "Successfully updated admin panel! Transaction signature:",
        tx,
      );
      return {
        success: true,
        signature: tx,
      };
    } catch (error: unknown) {
      console.error("Error updating admin panel on-chain:", error);

      // Check if it's a timeout error but the transaction might still be processing
      if (
        error instanceof Error &&
        error.message.includes("was not confirmed")
      ) {
        return {
          success: false,
          error:
            "Transaction submitted but confirmation timed out. Check the transaction status manually.",
          pendingSignature: error.message.match(
            /Check signature ([^\s]+)/,
          )?.[1],
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const updateBackendWallet = async (backendWallet: string) => {
    if (!wallet || !connection) {
      return { success: false, error: "Wallet not connected" };
    }

    if (!program) {
      return { success: false, error: "Program not initialized" };
    }
    try {
      console.log("updating admin panel...");
      const backendPubkey = new PublicKey(backendWallet);
      const adminPubkey = wallet.publicKey;
      const [adminPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from("admin_panel")],
        program.programId,
      );

      const tx = await program.methods
        .setBackendWallet(backendPubkey)
        .accounts({
          admin: adminPubkey,
          adminPanel: adminPDA,
        })
        .rpc({ skipPreflight: false }); // Enable preflight checks

      console.log(
        "Successfully updated Backend Wallet! Transaction signature:",
        tx,
      );
      return {
        success: true,
        signature: tx,
      };
    } catch (error: unknown) {
      console.error("Error updating backend wallet on-chain:", error);

      // Check if it's a timeout error but the transaction might still be processing
      if (
        error instanceof Error &&
        error.message.includes("was not confirmed")
      ) {
        return {
          success: false,
          error:
            "Transaction submitted but confirmation timed out. Check the transaction status manually.",
          pendingSignature: error.message.match(
            /Check signature ([^\s]+)/,
          )?.[1],
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const setCptLimit = async (cptLimit: number) => {
    if (!wallet || !connection) {
      return { success: false, error: "Wallet not connected" };
    }

    if (!program) {
      return { success: false, error: "Program not initialized" };
    }
    try {
      console.log("Setting CPT limit...");
      const adminPubkey = wallet.publicKey;
      const [adminPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from("admin_panel")],
        program.programId,
      );

      const tx = await program.methods
        .setCptLimit(new anchor.BN(cptLimit * 1000000000))
        .accounts({
          admin: adminPubkey,
          adminPanel: adminPDA,
        })
        .rpc({ skipPreflight: false }); // Enable preflight checks

      console.log("Successfully set CPT limit! Transaction signature:", tx);
      return {
        success: true,
        signature: tx,
      };
    } catch (error: unknown) {
      console.error("Error setting CPT limit on-chain:", error);

      // Check if it's a timeout error but the transaction might still be processing
      if (
        error instanceof Error &&
        error.message.includes("was not confirmed")
      ) {
        return {
          success: false,
          error:
            "Transaction submitted but confirmation timed out. Check the transaction status manually.",
          pendingSignature: error.message.match(
            /Check signature ([^\s]+)/,
          )?.[1],
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const voteForSubmissionOnChain = async (
    challengePublicKey: string,
    submissionPublicKey: string,
  ) => {
    if (!wallet || !connection) {
      return { success: false, error: "Wallet not connected" };
    }

    if (!program) {
      return { success: false, error: "Program not initialized" };
    }

    try {
      console.log("Starting vote process for challenge:", challengePublicKey);

      // Convert strings to PublicKeys
      const challengePubkey = new PublicKey(challengePublicKey);
      const submissionPubkey = new PublicKey(submissionPublicKey);

      // Derive PDAs
      const [treasuryPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury"), challengePubkey.toBuffer()],
        program.programId,
      );

      const [votingTreasuryPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from("voting_treasury"), challengePubkey.toBuffer()],
        program.programId,
      );

      // Get token accounts
      const voterTokenAccount = getAssociatedToken2022AddressSync(
        CPT_TOKEN_MINT,
        wallet.publicKey,
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

      // Check if the voting treasury token account exists and create it if needed
      let setupTx = null;
      try {
        const votingTokenAccountInfo = await connection.getAccountInfo(
          votingTreasuryTokenAccount,
        );

        if (!votingTokenAccountInfo) {
          console.log(
            "Voting treasury token account doesn't exist, creating it...",
          );

          // Create and send the setup transaction
          const createAtaIx = createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            votingTreasuryTokenAccount,
            votingTreasuryPubkey,
            CPT_TOKEN_MINT,
            TOKEN_2022_PROGRAM_ID,
            TOKEN_2022_PROGRAM_ID,
          );

          const setupTransaction = new Transaction().add(createAtaIx);
          setupTransaction.feePayer = wallet.publicKey;
          const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash();
          setupTransaction.recentBlockhash = blockhash;

          let signedSetupTx;
          if (!isMobileDevice()) {
            // Sign with wallet
            console.log("Transacting with wallet...");
            signedSetupTx = await wallet.signTransaction(setupTransaction);
          } else {
            // console.log("Transacting with mobile wallet...");
            // signature = await wallet.sendTransaction(tx, connection);
            console.log("Transacting with mobile wallet...");
            signedSetupTx = await transact(async (wallet: Web3MobileWallet) => {
              await wallet.authorize({
                cluster: "mainnet-beta",
                identity: {
                  name: "Coinpetitive",
                  uri: "https://coinpetitive.io",
                },
              });

              const signedTransactions = await wallet.signTransactions({
                transactions: [setupTransaction],
              });
              return signedTransactions[0];
            });
          }

          const setupSig = await connection.sendRawTransaction(
            signedSetupTx.serialize(),
          );
          // const setupSig = await wallet.sendTransaction(setupTransaction, connection, {
          //   skipPreflight: false,
          // });

          console.log("Setup transaction sent:", setupSig);

          // Wait for setup transaction to confirm with enhanced timeout handling
          const setupStatus = await connection.confirmTransaction({
            signature: setupSig,
            blockhash,
            lastValidBlockHeight,
          });

          if (setupStatus.value.err) {
            console.error("Setup transaction failed:", setupStatus.value.err);
            return {
              success: false,
              error: `Failed to create voting treasury account: ${JSON.stringify(
                setupStatus.value.err,
              )}`,
            };
          }

          setupTx = setupSig;
          console.log("Created voting treasury token account");
        }
      } catch (err) {
        console.error("Error checking/creating token account:", err);
        return {
          success: false,
          error: "Failed to set up voting treasury account",
        };
      }

      // Now prepare the vote transaction
      // Get fresh blockhash for the vote transaction
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      // Prepare the vote instruction
      const voteIx = await program.methods
        .voteForSubmission()
        .accounts({
          voter: wallet.publicKey,
          challenge: challengePubkey,
          treasury: treasuryPubkey,
          treasuryTokenAccount: treasuryTokenAccount,
          votingTreasury: votingTreasuryPubkey,
          tokenMint: CPT_TOKEN_MINT,
          tokenProgram2022: TOKEN_2022_PROGRAM_ID,
          voterTokenAccount: voterTokenAccount,
          votingTreasuryTokenAccount: votingTreasuryTokenAccount,
          submissionId: submissionPubkey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Create and send the vote transaction
      const voteTx = new Transaction().add(voteIx);
      voteTx.feePayer = wallet.publicKey;
      voteTx.recentBlockhash = blockhash;

      console.log("Signing vote transaction...");
      let signedVoteTx;
      if (!isMobileDevice()) {
        // Sign with wallet
        console.log("Transacting with wallet...");
        signedVoteTx = await wallet.signTransaction(voteTx);
      } else {
        // console.log("Transacting with mobile wallet...");
        // signature = await wallet.sendTransaction(tx, connection);
        console.log("Transacting with mobile wallet...");
        signedVoteTx = await transact(async (wallet: Web3MobileWallet) => {
          await wallet.authorize({
            cluster: "mainnet-beta",
            identity: {
              name: "Coinpetitive",
              uri: "https://coinpetitive.io",
            },
          });

          const signedTransactions = await wallet.signTransactions({
            transactions: [voteTx],
          });
          return signedTransactions[0];
        });
      }

      console.log("Sending vote transaction...");
      const signature = await connection.sendRawTransaction(
        signedVoteTx.serialize(),
        {
          skipPreflight: true,
        },
      );
      // const signature = await wallet.sendTransaction(voteTx, connection, {
      //   skipPreflight: false,
      // })

      console.log("Vote transaction sent! Signature:", signature);

      try {
        // Wait for confirmation with enhanced timeout handling
        console.log("Waiting for vote transaction confirmation...");
        const status = await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          "confirmed",
        );

        if (status.value.err) {
          console.error(
            "Vote transaction confirmed but failed:",
            status.value.err,
          );
          return {
            success: false,
            error: `Transaction failed: ${JSON.stringify(status.value.err)}`,
          };
        }

        console.log("Vote successful! Transaction confirmed:", signature);
        return {
          success: true,
          signature,
          setupTransaction: setupTx,
        };
      } catch (confirmError) {
        // Handle confirmation timeout
        if (
          confirmError instanceof Error &&
          confirmError.message.includes("was not confirmed")
        ) {
          console.warn(
            "Transaction confirmation timed out but may still succeed",
          );
          return {
            success: false,
            error:
              "Transaction submitted but confirmation timed out. Check the transaction status manually.",
            pendingSignature: signature,
            setupTransaction: setupTx,
          };
        }

        throw confirmError; // Re-throw other errors
      }
    } catch (error) {
      console.error("Error voting for submission:", error);

      let errorMessage = "Failed to vote for submission";
      if (error instanceof Error) {
        errorMessage = error.message;

        if (errorMessage.includes("AlreadyVoted")) {
          errorMessage = "You have already voted for this submission";
        } else if (errorMessage.includes("ChallengeNotActive")) {
          errorMessage = "This challenge is no longer active";
        } else if (errorMessage.includes("AccountDidNotSerialize")) {
          errorMessage =
            "Error updating challenge data. The voters list might be full.";
        } else if (errorMessage.includes("insufficient funds")) {
          errorMessage = "Insufficient funds!!!";
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const getAdminWallet = async () => {
    if (!program) {
      return { success: false, error: "Program not initialized" };
    }

    try {
      const [adminPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from("admin_panel")],
        program.programId,
      );

      // @ts-expect-error - adminPanel is valid but not recognized by inferred type
      const adminAccount = await program.account.adminPanel.fetch(adminPDA);

      console.log("adminWallet:");
      console.log(adminAccount.adminWallet.toBase58());
      console.log("cptLimt:");
      console.log(adminAccount.cptLimit.toString());

      return {
        success: true,
        adminWallet: adminAccount.adminWallet.toBase58(),
        cptLimit: parseInt(adminAccount.cptLimit) / 1000000000,
      };
    } catch (error) {
      console.error("Error voting for submission:", error);

      let errorMessage = "Failed to vote for submission";
      if (error instanceof Error) {
        errorMessage = error.message;

        if (errorMessage.includes("AlreadyVoted")) {
          errorMessage = "You have already voted for this submission";
        } else if (errorMessage.includes("ChallengeNotActive")) {
          errorMessage = "This challenge is no longer active";
        } else if (errorMessage.includes("AccountDidNotSerialize")) {
          errorMessage =
            "Error updating challenge data. The voters list might be full.";
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const getTreasuryBalance = async (challengePublicKey: string) => {
    if (!connection) {
      return {
        success: false,
        error: "Connection not available",
      };
    }

    try {
      // Convert string to PublicKey
      const challengePubkey = new PublicKey(challengePublicKey);

      // Derive the treasury PDA from the challenge
      const [treasuryPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury"), challengePubkey.toBuffer()],
        PROGRAM_ID,
      );

      // Find treasury token account
      const treasuryTokenAccount = getAssociatedTokenAddressSync(
        CPT_TOKEN_MINT,
        treasuryPubkey,
        true, // allowOwnerOffCurve for PDAs
        TOKEN_2022_PROGRAM_ID,
      );

      console.log("Treasury information:", {
        challenge: challengePubkey.toString(),
        treasury: treasuryPubkey.toString(),
        treasuryTokenAccount: treasuryTokenAccount.toString(),
      });

      // Get the token account info
      const tokenAccountInfo =
        await connection.getTokenAccountBalance(treasuryTokenAccount);

      // Get the SOL balance of the treasury
      const solBalance = await connection.getBalance(treasuryPubkey);

      return {
        success: true,
        tokenBalance: tokenAccountInfo.value.uiAmount ?? undefined, // Convert null to undefined
        tokenDecimals: tokenAccountInfo.value.decimals,
        tokenAmountRaw: tokenAccountInfo.value.amount,
        solBalance: solBalance / LAMPORTS_PER_SOL,
        treasuryAddress: treasuryPubkey.toString(),
        treasuryTokenAccount: treasuryTokenAccount.toString(),
      };
    } catch (error: unknown) {
      console.error("Error fetching treasury balance:", error);

      // Try to provide more specific error information
      let errorMessage = "Failed to get treasury balance";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for common token account errors
        if (errorMessage.includes("account not found")) {
          errorMessage =
            "Treasury token account not found. The account might not have been created yet.";
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const getVotingTreasuryBalance = async (challengePublicKey: string) => {
    if (!connection) {
      return {
        success: false,
        error: "Connection not available",
      };
    }

    try {
      // Convert string to PublicKey
      const challengePubkey = new PublicKey(challengePublicKey);

      // Derive the voting treasury PDA from the challenge
      const [votingTreasuryPubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from("voting_treasury"), challengePubkey.toBuffer()],
        PROGRAM_ID,
      );

      // Find voting treasury token account
      const votingTreasuryTokenAccount = getAssociatedTokenAddressSync(
        CPT_TOKEN_MINT,
        votingTreasuryPubkey,
        true, // allowOwnerOffCurve for PDAs
        TOKEN_2022_PROGRAM_ID,
      );

      console.log("Voting Treasury information:", {
        challenge: challengePubkey.toString(),
        votingTreasury: votingTreasuryPubkey.toString(),
        votingTreasuryTokenAccount: votingTreasuryTokenAccount.toString(),
      });

      // Check if the account exists before getting balance
      const accountInfo = await connection.getAccountInfo(
        votingTreasuryTokenAccount,
      );

      let tokenBalance = {
        value: { amount: "0", decimals: 9, uiAmount: 0 },
      };

      // Only try to get token balance if account exists
      if (accountInfo) {
        const tokenBalanceResponse = await connection.getTokenAccountBalance(
          votingTreasuryTokenAccount,
        );
        tokenBalance = {
          value: {
            amount: tokenBalanceResponse.value.amount,
            decimals: tokenBalanceResponse.value.decimals,
            uiAmount: tokenBalanceResponse.value.uiAmount ?? 0, // Convert null to 0
          },
        };
      } else {
        console.log(
          "Voting treasury token account doesn't exist yet, returning zero balance",
        );
      }

      // Get the SOL balance of the voting treasury
      const solBalance = await connection.getBalance(votingTreasuryPubkey);

      return {
        success: true,
        tokenBalance: tokenBalance.value.uiAmount ?? 0,
        tokenDecimals: tokenBalance.value.decimals,
        tokenAmountRaw: tokenBalance.value.amount,
        solBalance: solBalance / LAMPORTS_PER_SOL,
        votingTreasuryAddress: votingTreasuryPubkey.toString(),
        votingTreasuryTokenAccount: votingTreasuryTokenAccount.toString(),
        accountExists: !!accountInfo,
      };
    } catch (error: unknown) {
      console.error("Error fetching voting treasury balance:", error);

      let errorMessage = "Failed to get voting treasury balance";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    wallet,
    program,
    createChallenge,
    participateInChallenge,
    voteForSubmissionOnChain,
    getTreasuryBalance,
    getVotingTreasuryBalance,
    initAdminPanel,
    updateAdminPanel,
    setCptLimit,
    updateBackendWallet,
    getAdminWallet,
    // finalizeChallenge,
    // finalizeVotingTreasury,
    // claimCreatorReward,
  };
}

// Define the return type for our hook
export type AnchorContextType = {
  wallet: ReturnType<typeof useWallet> | null;
  program: CoinpetitiveProgram | null;
  createChallenge: ({
    reward,
    participationFee,
    votingFee,
    superChallenge,
    maxParticipants,
  }: {
    reward: number;
    participationFee: number;
    votingFee: number;
    superChallenge: boolean;
    maxParticipants?: number;
  }) => Promise<{
    success: boolean;
    signature?: string;
    challengePublicKey?: string;
    error?: string;
  }>;
  participateInChallenge: (challengePublicKey: string) => Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }>;
  voteForSubmissionOnChain: (
    challengePublicKey: string,
    submissionPublicKey: string,
  ) => Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }>;
  getTreasuryBalance: (challengePublicKey: string) => Promise<{
    success: boolean;
    tokenBalance?: number;
    tokenDecimals?: number;
    tokenAmountRaw?: string;
    solBalance?: number;
    treasuryAddress?: string;
    treasuryTokenAccount?: string;
    error?: string;
  }>;
  getVotingTreasuryBalance: (challengePublicKey: string) => Promise<{
    success: boolean;
    tokenBalance?: number;
    tokenDecimals?: number;
    tokenAmountRaw?: string;
    solBalance?: number;
    votingTreasuryAddress?: string;
    votingTreasuryTokenAccount?: string;
    accountExists?: boolean;
    error?: string;
  }>;
  initAdminPanel: () => Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }>;
  updateAdminPanel: (adminWallet: string) => Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }>;
  updateBackendWallet: (backendWallet: string) => Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }>;
  setCptLimit: (cptLimit: number) => Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }>;
  getAdminWallet: () => Promise<{
    success: boolean;
    adminWallet?: string;
    backendWallet?: string;
    cptLimit?: number;
    error?: string;
  }>;
  // finalizeChallenge: (challengePublicKey: string) => Promise<{
  //   success: boolean;
  //   signature?: string;
  //   winner?: string;
  //   winningVotes?: number;
  //   error?: string;
  // }>;
  // finalizeVotingTreasury: (challengePublicKey: string) => Promise<{
  //   success: boolean;
  //   processed?: number;
  //   total?: number;
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   results?: any[];
  //   error?: string;
  // }>;
  // claimCreatorReward: (challengePublicKey: string) => Promise<{
  //   success: boolean;
  //   signature?: string;
  //   error?: string;
  // }>;
};

// Create the context with proper default value
export const AnchorContext = createContext<AnchorContextType | null>(null);

// Create a hook to use the context
export const useAnchor = () => {
  const context = useContext(AnchorContext);
  if (!context) {
    throw new Error("useAnchor must be used within an AnchorProvider");
  }
  return context;
};
