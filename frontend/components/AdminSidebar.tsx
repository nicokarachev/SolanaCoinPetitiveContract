"use client";

import React from "react";
import { useRouter } from "next/navigation";

type AdminSidebarProps = {
  selected: string;
  onSelect: (section: string) => void;
};

export default function AdminSidebar({
  selected,
  onSelect,
}: AdminSidebarProps) {
  const navItems = [
    { id: "beta-testers", label: "Bug Reports" },
    { id: "flagged-submissions", label: "Flagged Submissions" },
    { id: "add-beta-testers", label: "Beta Tester Access" },
  ];

  const router = useRouter();

  return (
    <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
      <h2 className="text-xl font-bold">Admin Panel</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`block w-full text-left px-3 py-2 rounded ${
              selected === item.id ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            {item.label}
          </button>
        ))}
        <div className="h-1 bg-white" />
        <div className="w-full ">
          <button
            onClick={() => router.push("/admin/limit")}
            className="bg-red-300 px-3 py-2 mt-2 rounded w-full text-left hover:bg-red-700 "
          >
            CPT Limit
          </button>
        </div>
      </nav>
    </aside>
  );
}
