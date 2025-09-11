import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function isMobileDevice(): boolean {
  // On the server, there's no navigator
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent ?? navigator.vendor ?? "";
  return /android/i.test(userAgent);
}

export const getPlatform = (url: string) => {
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("youtu")) return "youtube";
  if (url.includes("twitter")) return "twitter";
  if (url.includes("instagram")) return "instagram";
  return null;
};

// Extract an embeddable URL from common platforms
export const getEmbedUrl = (url: string) => {
  try {
    // YouTube
    if (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("youtube.com/shorts")
    ) {
      let videoId = "";

      if (url.includes("youtube.com/watch")) {
        videoId = url.split("v=")[1]?.split("&")[0] ?? "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] ?? "";
      } else if (url.includes("youtube.com/shorts/")) {
        videoId = url.split("/shorts/")[1]?.split("?")[0] ?? "";
      }

      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Twitter (X)
    if (url.includes("twitter.com") || url.includes("x.com")) {
      return `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
    }

    // Instagram
    if (url.includes("instagram.com")) {
      const id = url.split("/p/")[1]?.split("/")[0] ?? "";
      return `https://www.instagram.com/embed/${id}`;
    }

    // TikTok
    if (url.includes("tiktok.com")) {
      const id = url.split("/video/")[1]?.split("?")[0] ?? "";
      return `https://www.tiktok.com/embed/${id}`;
    }

    // Loom
    if (url.includes("loom.com") && url.includes("/share/")) {
      const videoId = url.split("/share/")[1]?.split("?")[0] ?? "";
      return `https://www.loom.com/embed/${videoId}`;
    }

    // Fallback
    return url;
  } catch {
    return url;
  }
};
