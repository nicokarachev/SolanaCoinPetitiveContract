export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: { user: validUser }, error: validError } = await supabase.auth.getUser(token);
  if (validError || !validUser) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  console.log("Hello, ", validUser.email);

  // Parse + validate
  const { email } = (await request.json()) as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  // Insert into Supabase
  const { error: dbErr } = await supabase.from("notify_me").insert({ email });

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  // SendGrid notification
  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      templateId: process.env.SENDGRID_NOTIFY_TEMPLATE_ID!,
      dynamicTemplateData: {
        email,
        companyName: process.env.COMPANY_NAME,
        companyAddress: process.env.COMPANY_ADDRESS,
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
