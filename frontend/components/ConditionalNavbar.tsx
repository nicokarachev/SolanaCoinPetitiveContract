"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import { Nav } from "./Nav";

const landingRoutes = ["/landing", "/notify-me", "/join-beta"];

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Remove trailing slash (if any)
  const normalizedPath = pathname.replace(/\/$/, "");

  const showNavbar = landingRoutes.includes(normalizedPath);

  return showNavbar ? <Navbar /> : <Nav />;
}
