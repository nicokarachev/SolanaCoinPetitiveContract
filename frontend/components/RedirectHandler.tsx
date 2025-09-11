"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RedirectHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const cookies = document.cookie;
    const redirectFlag = cookies.includes("redirectToLanding=true");

    if (redirectFlag && pathname !== "/landing") {
      // Clear the flag immediately
      document.cookie = "redirectToLanding=false; path=/; max-age=0";

      // Redirect to landing
      router.replace("/landing");
    }
  }, [pathname, router]);

  return null;
}
