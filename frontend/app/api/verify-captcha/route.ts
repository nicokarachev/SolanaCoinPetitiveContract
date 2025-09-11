// /app/api/verify-captcha/route.ts

export async function POST(request: Request) {
  const { token } = await request.json();

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  const res = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
    { method: "POST" },
  );

  const data = await res.json();

  if (data.success) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}
