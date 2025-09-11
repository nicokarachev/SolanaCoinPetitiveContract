import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const tiktokURL = req.nextUrl.searchParams.get("url");
  if (!tiktokURL)
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  try {
    const resolved = await fetch(tiktokURL, {
      method: "HEAD",
      redirect: "follow",
    });

    const resolvedTikTokURL = resolved.url;
    const oembedRes = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(resolvedTikTokURL)}`,
    );
    const contentType = oembedRes.headers.get("content-type");
    if (!contentType.includes("application/json")) {
      const fallbackText = await oembedRes.text();
      return NextResponse.json(
        { error: "Unexpected response: ", fallbackText },
        { status: 502 },
      );
    }
    const data = await oembedRes.json();

    return NextResponse.json({
      fullUrl: data?.url ?? resolvedTikTokURL,
      embedHtml: data?.html,
    });
  } catch (err) {
    console.error(
      "TikTok shortened URL has failed the expansion. Here is why: ",
      err,
    );
    return NextResponse.json(
      { err: "Expansion Failed for some unknown reason" },
      { status: 500 },
    );
  }
}
