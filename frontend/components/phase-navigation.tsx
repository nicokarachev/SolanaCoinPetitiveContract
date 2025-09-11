"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Shield,
  Coins,
  Target,
  ArrowLeft,
  Home,
  TestTube,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  status: "completed" | "current" | "upcoming";
}

export function PhaseNavigation() {
  const pathname = usePathname();

  const phases: Phase[] = [
    {
      id: "phase-a",
      title: "Phase A: Database Schema",
      shortTitle: "Database",
      description: "Test database operations and RLS policies",
      path: "/test-database",
      icon: <Database className="h-4 w-4" />,
      status: pathname === "/test-database" ? "current" : "completed",
    },
    {
      id: "phase-b",
      title: "Phase B: Authentication & Wallet",
      shortTitle: "Auth & Wallet",
      description: "Test user authentication and wallet connections",
      path: "/test-auth",
      icon: <Shield className="h-4 w-4" />,
      status:
        pathname === "/test-auth"
          ? "current"
          : pathname === "/test-database"
            ? "upcoming"
            : "completed",
    },
    {
      id: "phase-c",
      title: "Phase C: Smart Contracts",
      shortTitle: "Contracts",
      description: "Test tokenomics and blockchain operations",
      path: "/test-contracts",
      icon: <Coins className="h-4 w-4" />,
      status:
        pathname === "/test-contracts"
          ? "current"
          : ["/test-database", "/test-auth"].includes(pathname)
            ? "upcoming"
            : "completed",
    },
    {
      id: "phase-d",
      title: "Phase D: Integration Testing",
      shortTitle: "Integration",
      description: "Test complete user flows and system integration",
      path: "/test-integration",
      icon: <Target className="h-4 w-4" />,
      status: pathname === "/test-integration" ? "current" : "upcoming",
    },
  ];

  const currentPhaseIndex = phases.findIndex(
    (phase) => phase.path === pathname,
  );
  const currentPhase = phases[currentPhaseIndex];
  const previousPhase =
    currentPhaseIndex > 0 ? phases[currentPhaseIndex - 1] : null;
  const nextPhase =
    currentPhaseIndex < phases.length - 1
      ? phases[currentPhaseIndex + 1]
      : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "current":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "upcoming":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Don't show navigation if not on a test phase page
  if (!currentPhase) {
    return null;
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 mb-6">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Left: Back to Test Suite */}
          <Link href="/test-suite">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Test Suite
            </Button>
          </Link>

          {/* Center: Current Phase Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[#b3731d]">
              {currentPhase.icon}
              <span className="font-semibold">{currentPhase.shortTitle}</span>
            </div>
            <Badge
              className={cn("text-xs", getStatusColor(currentPhase.status))}
            >
              {currentPhase.status.toUpperCase()}
            </Badge>
          </div>

          {/* Right: Home Link */}
          <Link href="/test-suite">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Home className="h-4 w-4 mr-2" />
              Test Home
            </Button>
          </Link>
        </div>

        {/* Phase Progress Bar */}
        <div className="flex items-center justify-between mb-4">
          {phases.map((phase, index) => (
            <div key={phase.id} className="flex items-center">
              {/* Phase Circle */}
              <Link href={phase.path}>
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors cursor-pointer",
                    phase.status === "completed"
                      ? "bg-green-500 border-green-500 text-white"
                      : phase.status === "current"
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-gray-200 border-gray-300 text-gray-500",
                  )}
                >
                  {phase.icon}
                </div>
              </Link>

              {/* Connector Line */}
              {index < phases.length - 1 && (
                <div
                  className={cn(
                    "w-16 h-0.5 mx-2",
                    index < currentPhaseIndex ? "bg-green-500" : "bg-gray-300",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Phase Labels */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className="text-center"
              style={{ width: "120px" }}
            >
              <Link
                href={phase.path}
                className="hover:text-[#b3731d] transition-colors"
              >
                {phase.shortTitle}
              </Link>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          {/* Previous Phase */}
          <div className="flex-1">
            {previousPhase ? (
              <Link href={previousPhase.path}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {previousPhase.shortTitle}
                </Button>
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link href="/test-suite">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#b3731d] hover:bg-[#b3731d]/10"
              >
                <TestTube className="h-4 w-4 mr-1" />
                All Tests
              </Button>
            </Link>
          </div>

          {/* Next Phase */}
          <div className="flex-1 flex justify-end">
            {nextPhase ? (
              <Link href={nextPhase.path}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {nextPhase.shortTitle}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
