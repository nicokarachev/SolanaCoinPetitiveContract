import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "p16-sign.tiktokcdn-us.com",
      },
      {
        protocol: "https",
        hostname: "p19-sign.tiktokcdn-us.com",
      },
      {
        protocol: "https",
        hostname: "rhowdrgpmwqyqpqlljwx.supabase.co",
      },
      {
        protocol: "https",
        hostname: "coinpetitive.io",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  trailingSlash: true,
  generateBuildId: () => "my-build-" + Date.now(),
};

export default nextConfig;
