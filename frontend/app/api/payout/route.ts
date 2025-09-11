/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";
import { payoutBugReport } from "@/lib/supabase/bugs/payoutBugReport";
import { sendBugPayoutIssuedEmail } from "@/utils/email/bugNotifications";
import { logError } from "@/lib/supabase/logError"; // ✅ add this
import { archiveBugAfterPayout } from "@/lib/supabase/bugs/archiveBug";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string, {
  commitment: "confirmed",
});

const CPT_MINT = process.env.NEXT_PUBLIC_CPT_TOKEN_MINT as string;

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Missing token" },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admins only" },
        { status: 403 },
      );
    }

    let walletAddress: string, cptAmount: string, bugId: string;
    try {
      ({ walletAddress, cptAmount, bugId } = await req.json());
      if (!walletAddress || !cptAmount || isNaN(Number(cptAmount))) {
        return NextResponse.json(
          { error: "Invalid payload: Wallet address or CPT amount missing." },
          { status: 400 },
        );
      }

      if (bugId) {
        const { data: existingPayouts, error } = await supabase
          .from("payout_logs")
          .select("id")
          .eq("bug_id", bugId);

        if (error) {
          await logError({
            message: "Failed to check for existing bug payouts",
            level: "error",
            category: "payout",
            context: { bugId, error: error.message },
          });

          return NextResponse.json(
            { error: "Server error checking payouts." },
            { status: 500 },
          );
        }

        if (existingPayouts && existingPayouts.length > 0) {
          return NextResponse.json(
            { error: "⚠️ This bug has already been rewarded." },
            { status: 400 },
          );
        }
      }
    } catch {
      await logError({
        message: "Invalid JSON body in payout request",
        context: { body: await req.text() },
        level: "error",
        category: "payout",
      });

      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const amount = Number(cptAmount);
    if (!walletAddress || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid CPT amount or address" },
        { status: 400 },
      );
    }

    const MAX_CPT_PER_TX = 10;
    if (amount > MAX_CPT_PER_TX) {
      return NextResponse.json(
        { error: `CPT amount exceeds limit of ${MAX_CPT_PER_TX}` },
        { status: 400 },
      );
    }

    const ONE_DAY_AGO = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();
    const { data: recentSends, error: sendError } = await supabase
      .from("payout_logs")
      .select("amount")
      .eq("user_id", user.id)
      .gte("created_at", ONE_DAY_AGO);

    if (sendError) {
      await logError({
        message: "Daily CPT cap check failed",
        level: "error",
        category: "payout",
        context: { userId: user.id, error: sendError.message },
      });

      return NextResponse.json(
        { error: "Daily cap check failed" },
        { status: 500 },
      );
    }

    const totalSentToday =
      recentSends?.reduce((sum, r) => sum + Number(r.amount || 0), 0) ?? 0;

    const DAILY_LIMIT_CPT = 100;
    const CPT_DECIMALS = 1_000_000_000;

    if (
      totalSentToday + amount * CPT_DECIMALS >
      DAILY_LIMIT_CPT * CPT_DECIMALS
    ) {
      return NextResponse.json(
        { error: `Daily CPT limit of ${DAILY_LIMIT_CPT} exceeded.` },
        { status: 429 },
      );
    }

    const { data: recentPayouts, error: payoutError } = await supabase
      .from("payout_logs")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (payoutError) {
      await logError({
        message: "Rate limit query error",
        level: "error",
        category: "payout",
        context: { userId: user.id, error: payoutError.message },
      });
    }

    if (recentPayouts?.length) {
      const last = new Date(recentPayouts[0].created_at);
      const now = new Date();
      const diffSeconds = (now.getTime() - last.getTime()) / 1000;

      const RATE_LIMIT_SECONDS = 60;
      if (diffSeconds < RATE_LIMIT_SECONDS) {
        return NextResponse.json(
          {
            error: `Rate limit: please wait ${Math.ceil(
              RATE_LIMIT_SECONDS - diffSeconds,
            )} seconds`,
          },
          { status: 429 },
        );
      }
    }

    const adminPrivateKey = bs58.decode(process.env.ADMIN_PRIVATE_KEY!);
    const adminKeypair = Keypair.fromSecretKey(adminPrivateKey);
    const mint = new PublicKey(CPT_MINT);
    const recipient = new PublicKey(walletAddress);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair,
      mint,
      adminKeypair.publicKey,
      false,
      "confirmed",
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      adminKeypair,
      mint,
      recipient,
      true,
      "confirmed",
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const transferIx = createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      adminKeypair.publicKey,
      amount * CPT_DECIMALS,
      [],
      TOKEN_2022_PROGRAM_ID,
    );

    const tx = new Transaction().add(transferIx);
    const signature = await sendAndConfirmTransaction(connection, tx, [
      adminKeypair,
    ]);

    if (bugId) {
      await payoutBugReport({
        reward_amount: amount,
        payout_datetime: new Date().toISOString(),
        bugId,
      });

      await archiveBugAfterPayout({
        bugId,
        adminUsername: user.user_metadata?.username || "unknown admin",
      });
    }

    await supabase.from("payout_logs").insert({
      user_id: user.id,
      wallet: walletAddress,
      amount: amount * CPT_DECIMALS,
      tx: signature,
      ...(bugId && { bug_id: bugId }),
    });

    try {
      const { data: bugData, error: bugFetchError } = await supabase
        .from("bug_report_reward")
        .select("bug_content")
        .eq("uuid_id", bugId)
        .single();

      if (bugFetchError || !bugData?.bug_content) {
        await logError({
          message: "Failed to fetch bug content for payout email",
          level: "error",
          category: "email",
          context: { bugId, error: bugFetchError?.message },
        });
      }

      await sendBugPayoutIssuedEmail({
        email: user.email,
        username: user.user_metadata?.username || "unknown user",
        bugDescription: bugData?.bug_content || "Bug description not found",
        amount,
        tx: signature,
      });
    } catch (emailErr: any) {
      await logError({
        message: "Failed to send bug payout email",
        level: "error",
        category: "email",
        context: {
          email: user.email,
          tx: signature,
          error: emailErr.message,
        },
      });
    }

    return NextResponse.json({ success: true, tx: signature });
  } catch (err: any) {
    await logError({
      message: "Unhandled payout transfer error",
      level: "error",
      category: "payout",
      context: { error: err.message },
    });

    return NextResponse.json(
      { error: "Transfer failed", detail: err.message },
      { status: 500 },
    );
  }
}
