import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { logError } from "@/lib/supabase/logError";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();
    console.log("Received token:", token);

    // Basic validation
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "Captcha token is required" },
        { status: 400 },
      );
    }

    // Verify hCaptcha token
    const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY;
    if (!hcaptchaSecret) {
      console.error("Missing HCAPTCHA_SECRET_KEY environment variable");
      return NextResponse.json(
        { error: "Captcha config error" },
        { status: 500 },
      );
    }

    const hcaptchaRes = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `response=${token}&secret=${hcaptchaSecret}`,
    });

    const hcaptchaData = await hcaptchaRes.json();
    console.log("hCaptcha verification response:", hcaptchaData);

    if (!hcaptchaData.success) {
      console.warn("hCaptcha failed:", hcaptchaData);
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 },
      );
    }

    // Validate Google Sheets credentials
    if (
      !process.env.GOOGLE_CLIENT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.GOOGLE_SHEET_ID
    ) {
      console.error("Missing required environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const timestamp = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Coinpetitive Email Sign Up!A:B",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[email, timestamp]],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email added successfully",
    });
  } catch (err: unknown) {
    await logError({
      message: "Error adding email to Google Sheet",
      context: { error: err },
      level: "error",
      category: "Email Sign Up",
    });

    return NextResponse.json(
      { error: "Error adding email to Google Sheet" },
      { status: 500 },
    );
  }
}
