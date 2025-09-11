"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Video, X } from "lucide-react";
import { getEmbedUrl, getPlatform } from "@/lib/utils";

export default function RenderContent({
  videoUrl,
  imageUrl,
  submissionAvatarUrl,
}: {
  videoUrl?: string;
  imageUrl?: string;
  submissionAvatarUrl?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(imageUrl);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>(videoUrl);

  const openFullscreen = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    if (document.fullscreenElement) document.exitFullscreen();
  };

  const renderEmbed = () => {
    const platform = getPlatform(resolvedVideoUrl);
    const embedUrl = getEmbedUrl(resolvedVideoUrl);
    switch (platform) {
      case "tiktok":
        return (
          <div className="relative flex items-center justify-center overflow-hidden w-[320px] h-[570px]">
            <div className="absolute top-0 left-0 w-[calc(100%-22px)] h-[2px] bg-black opacity-80 z-20" />
            <iframe
              src={embedUrl}
              title="TikTok Video Player"
              frameBorder="0"
              scrolling="no"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full"
            />
            <button onClick={closeModal} aria-label="Close video">
              <X className="w-6 h-6" />
            </button>
          </div>
        );
      case "youtube":
        return (
          <div className="w-[90vw] h-[90vh] pr-5">
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        );
      case "twitter":
      case "instagram":
        return (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">
              Embedding for {platform} not yet supported.
            </p>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Video className="h-12 w-12 text-gray-400" />
          </div>
        );
    }
  };

  useEffect(() => {
    const fetchMicrolinkThumbnail = async (url: string) => {
      try {
        const res = await fetch(
          `/api/microlink?url=${encodeURIComponent(url)}`
        );
        const data = await res.json();
        if (data?.data?.image?.url) {
          setThumbnailUrl(data.data.image.url);
        }
      } catch (error) {
        console.error("Microlink thumbnail fetch failed", error);
      }
    };

    const resolveShortTikTokUrl = async (url: string) => {
      try {
        const res = await fetch(
          `/api/tiktok-resolver?url=${encodeURIComponent(url)}`
        );
        const data = await res.json();
        if (data?.fullUrl) {
          setResolvedVideoUrl(data.fullUrl);
        } else {
          console.warn("Failed to resolve TikTok short URL");
        }
      } catch (err) {
        console.error("Error resolving TikTok URL", err);
      }
    };

    if (videoUrl?.includes("tiktok.com/t/")) {
      resolveShortTikTokUrl(videoUrl);
    }
    if (!imageUrl) {
      fetchMicrolinkThumbnail(videoUrl);
    }
  }, [videoUrl, imageUrl]);

  return (
    <div className="w-full aspect-video bg-gray-200 rounded-xl overflow-hidden mb-4 relative">
      {videoUrl ? (
        <>
          <button onClick={openFullscreen} className="w-full h-full relative">
            {imageUrl || thumbnailUrl ? (
              thumbnailUrl?.includes("tiktokcdn") ||
              imageUrl?.includes("tiktokcdn") ? (
                <Image
                  src={
                    imageUrl ||
                    thumbnailUrl ||
                    submissionAvatarUrl ||
                    "/images/logo.png"
                  }
                  alt="video"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={
                    imageUrl ||
                    thumbnailUrl ||
                    submissionAvatarUrl ||
                    "/images/logo.png"
                  }
                  alt="video"
                  fill
                  className="object-cover"
                />
              )
            ) : (
              <div className="w-full h-full bg-black/50 flex items-center justify-center">
                <Video className="h-12 w-12 text-white" />
              </div>
            )}
          </button>

          {isModalOpen && (
            <div
              ref={fullscreenRef}
              className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center overflow-hidden"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 left-4 z-[9999] bg-primary text-white p-2 rounded-full shadow-md hover:bg-gray-800 transition"
                aria-label="Go back"
              >
                <ArrowLeft className="w-7 h-7" />
              </button>

              <div className="flex items-center justify-center w-fit h-fit ml-5">
                {renderEmbed()}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <Video className="h-12 w-12 text-gray-400" />
        </div>
      )}
    </div>
  );
}
