"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const hasLandingFlag = document?.cookie.includes("redirectToLanding=true");
    if (hasLandingFlag && window.location.pathname !== "/landing") {
      document.cookie = "redirectToLanding=false; path=/;";
      router.replace("/landing");
    }
  }, [router]);

  return <>{children}</>;
}
