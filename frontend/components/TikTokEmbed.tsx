import { useEffect } from "react";

function extractTikTokVideoId(url: string): string | null {
  try {
    const parts = url.split("/video/");
    return parts[1]?.split("?")[0] || null;
  } catch {
    return null;
  }
}

export function TikTokEmbed({ url }: { url: string }) {
  useEffect(() => {
    const existing = document.querySelector(
      'script[src="https://www.tiktok.com/embed.js"]',
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).tiktok) {
        (window as any).tiktok.load(); // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }
  }, [url]);

  const videoId = extractTikTokVideoId(url);
  if (!videoId) return null;

  return (
    <div className="absolute w-full" style={{ aspectRatio: "9 / 16" }}>
      <blockquote
        className="tiktok-embed absolute top-0 left-0 w-full h-full"
        cite={url}
        data-video-id={videoId}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          minWidth: "100%",
          minHeight: "100%",
        }}
      >
        <section>Loading TikTok...</section>
      </blockquote>
    </div>
  );
}
