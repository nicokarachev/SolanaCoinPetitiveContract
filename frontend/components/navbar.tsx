"use client";

import Link from "next/link";
import DocsModal from "./DocsModal";

export default function NavBar() {
  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center shadow-sm bg-background text-foreground">
      <Link href="/" className="text-2xl font-bold">
        Coinpetitive
      </Link>
      <div className="flex items-center space-x-2">
        <Link
          href="/join-beta"
          className="bg-primary text-primary-foreground px-2 sm:px-4 py-1 sm:py-2 rounded hover:opacity-90"
        >
          <span className="block sm:hidden">Beta</span>
          <span className="hidden sm:block">Join Beta</span>
        </Link>
        <DocsModal />
      </div>
    </nav>
  );
}
