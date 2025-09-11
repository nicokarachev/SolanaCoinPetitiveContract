"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import mountImage from "@/assets/mount2.png";
import { useState, useEffect } from "react";
import { submitVideo } from "@/lib/supabase";
import { useAuth } from "@/lib/use-auth";
import { Loader2, Video } from "lucide-react";
import { toast } from "sonner"; // Add this import
import {
  InstagramEmbed,
  TikTokEmbed,
  TwitterEmbed,
  YouTubeEmbed,
} from "react-social-media-embed";

interface SubmitVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  onSubmitSuccess?: () => void;
}

export function SubmitVideoDialog({
  open,
  onOpenChange,
  challengeId,
  onSubmitSuccess,
}: SubmitVideoDialogProps) {
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  // Generate embed URL from raw URLs (for preview)
  const getEmbedUrl = (url: string) => {
    try {
      // YouTube
      if (
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("youtube.com/shorts")
      ) {
        let videoId = "";

        if (url.includes("youtube.com/watch")) {
          videoId = url.split("v=")[1]?.split("&")[0];
        } else if (url.includes("youtu.be/")) {
          videoId = url.split("youtu.be/")[1]?.split("?")[0];
        } else if (url.includes("youtube.com/shorts/")) {
          videoId = url.split("/shorts/")[1]?.split("?")[0];
        }

        return `https://www.youtube.com/embed/${videoId}`;
      }
      // Twitter
      else if (url.includes("twitter.com")) {
        return `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
      }
      // Instagram
      else if (url.includes("instagram.com")) {
        return `https://www.instagram.com/embed/${
          url.split("/p/")[1]?.split("/")[0]
        }`;
      }
      // TikTok
      else if (url.includes("tiktok.com")) {
        return `https://www.tiktok.com/embed/${url.split("/video/")[1]}`;
      }
      // Loom
      if (url.includes("loom.com") && url.includes("/share/")) {
        const videoId = url.split("/share/")[1]?.split("?")[0];
        return `https://www.loom.com/embed/${videoId}`;
      }
      // Return original URL if no matches
      return url;
    } catch {
      return url;
    }
  };

  // Update preview when URL changes
  useEffect(() => {
    setPreviewUrl(getEmbedUrl(videoUrl));
  }, [videoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Then submit to database
      const result = await submitVideo(
        challengeId,
        auth.user?.id.toString() || "",
        videoUrl || "",
      );

      if (result.success) {
        toast.success("Video submitted successfully!");

        // Clear form and close dialog
        setDescription("");
        setVideoUrl("");

        // Only call onSubmitSuccess if it exists
        if (typeof onSubmitSuccess === "function") {
          onSubmitSuccess();
        }

        onOpenChange(false);
      } else {
        setError(result.error || "Failed to submit video");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Video</DialogTitle>
        </DialogHeader>

        {/* Video Preview */}
        <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2 border border-[#9A9A9A] flex items-center justify-center">
          {previewUrl ? (
            previewUrl.includes("tiktok.com") ? (
              <TikTokEmbed url={getEmbedUrl(previewUrl)} />
            ) : previewUrl.includes("youtu") ? (
              <YouTubeEmbed url={getEmbedUrl(previewUrl)} />
            ) : previewUrl.includes("twitter") ? (
              <TwitterEmbed url={getEmbedUrl(previewUrl)} />
            ) : previewUrl.includes("instagram") ? (
              <InstagramEmbed url={getEmbedUrl(previewUrl)} />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <Image
                src={mountImage}
                alt="Video placeholder"
                width={64}
                height={64}
                className="opacity-50 mb-2"
              />
              <p className="text-sm text-gray-500">No video URL entered</p>
            </div>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="border-[#9A9A9A]"
            />
            <p className="text-xs text-gray-500">
              Enter YouTube, Twitter, Instagram, or TikTok video URL
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your submission"
              className="border-[#9A9A9A]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#b3731d] hover:bg-[#b3731d]/90"
              disabled={isSubmitting || !auth.isAuthenticated}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Submit`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SubmitVideoDialog;
