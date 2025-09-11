"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, Coins, Ticket } from "lucide-react";
import ChallengeCard from "@/components/challenge-card";
import mountImage from "@/assets/mount.webp";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FilterType, getChallenges, type Challenge } from "@/lib/supabase";
import { getImageUrl } from "@/components/challenge-details";
import CPTTicker from "@/components/CPTTicker";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredChallenge, setFeaturedChallenge] = useState<Challenge | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const itemsPerPage = 6;

  useEffect(() => {
    const abortController = new AbortController();
    let isSubscribed = true;

    const fetchChallenges = async () => {
      try {
        // Build filter object for Supabase
        const filter: FilterType = {};

        if (selectedCategory !== "all") {
          filter.category = selectedCategory;
        }

        if (selectedState !== "all") {
          // Map states to match database values
          const stateMap: { [key: string]: string } = {
            registration: "active",
            voting: "active",
            completed: "completed",
            cancelled: "cancelled",
          };
          filter.state = stateMap[selectedState] || selectedState;
        }

        if (searchQuery.trim()) {
          filter.search = searchQuery.trim();
        }

        const result = await getChallenges(filter);

        if (isSubscribed && result.success && result.challenges) {
          const updatedChallenges = await Promise.all(
            result.challenges.map(async (challenge) => ({
              ...challenge,
              image: await getImageUrl(challenge.image),
            }))
          );
          setChallenges(updatedChallenges);
          // console.log(updatedChallenges);

          if (result.challenges.length > 0) {
            setFeaturedChallenge(updatedChallenges[0]);
          }
        } else if (!result.success) {
          console.error("Error fetching challenges:", result.error);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error fetching challenges:", error);
        }
      }
      if (isSubscribed) {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchChallenges();

    // Set up interval for subsequent fetches every 30 seconds (reduced from 5 seconds for better performance)
    const intervalId = setInterval(fetchChallenges, 30000);

    // Cleanup function
    return () => {
      isSubscribed = false;
      abortController.abort();
      clearInterval(intervalId);
    };
  }, [selectedCategory, selectedState, searchQuery]); // Add dependencies for auto-refresh on filter changes

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const getFilteredChallenges = () => {
    const filtered = [...challenges];

    // Sorting (since filtering is now done server-side)
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sortBy === "popular") {
        return (b.participants?.length || 0) - (a.participants?.length || 0);
      }
      return 0;
    });

    return filtered;
  };

  const filteredChallenges = getFilteredChallenges();
  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);

  return (
    <div className="min-h-screen flex flex-col">
      <main>
        {/* Hero Section with Featured Challenge */}
        <div className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 py-2">
            <div className="relative z-10 flex flex-col md:flex-row md:justify-between items-center">
              {/* Left Content */}
              <div className="w-full md:w-1/2 mb-8 md:mb-0">
                <h1 className="mb-2">
                  <span className="block text-3xl sm:text-4xl font-bold text-[#b3731d]">
                    Hello,
                  </span>
                  <span className="mt-1 block text-3xl sm:text-4xl font-bold text-gray-700">
                    Welcome to Coinpetitive
                  </span>
                </h1>
                <p className="mb-6 text-gray-500">
                  Post, Compete, Earn, Repeat
                </p>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                  <Link href="/create-challenge">
                    <Button className="w-full md:w-auto px-6 py-2 h-11 font-bold">
                      Start A New Challenge
                    </Button>
                  </Link>
                  <Link href="/usage">
                    <Button
                      variant="outline"
                      className="w-full md:w-auto px-6 py-2 h-11 font-bold bg-white"
                      style={{ border: "2px solid #b3731d", color: "#b3731d" }}
                    >
                      How To Play
                    </Button>
                  </Link>
                </div>
                <div className="pt-3">
                  <CPTTicker />
                </div>
                {/* Search Bar */}
                <div className="relative mt-8">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search Challenge"
                    className="w-full sm:w-[300px] md:w-[400px] rounded-[50px] border-[#898989] pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Content - Concentric Circles - Hidden on small screens */}
              <div className="hidden md:block relative w-[400px] lg:w-[600px] h-[400px] lg:h-[600px]">
                {/* Outer Circle */}
                <div className="absolute inset-0 rounded-full bg-[#f8f1e9] flex items-center justify-center">
                  {/* Middle Circle */}
                  <div className="w-[85%] h-[85%] rounded-full bg-[#f1e4d4] flex items-center justify-center">
                    {/* Inner Circle */}
                    <div className="w-[85%] h-[85%] rounded-full bg-[#ecd9c3] flex items-center justify-center">
                      {/* Featured Challenge Card */}
                      <div className="w-[290px] h-[360px] bg-white rounded-[30px] shadow-lg border-2 border-[#b3731d] p-4">
                        <div className="h-full flex flex-col">
                          {/* Thumbnail */}
                          <div className="relative h-[160px] w-full overflow-hidden rounded-2xl mb-4">
                            <Image
                              src={featuredChallenge?.image || mountImage}
                              alt={
                                featuredChallenge?.title || "Mountain Climbing"
                              }
                              fill
                              className="object-cover"
                              draggable={false}
                              sizes="(max-width: 768px) 100vw, 800px"
                            />
                          </div>

                          {/* Content */}
                          <div className="mb-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-800 leading-tight max-w-[180px]">
                                {featuredChallenge?.title ||
                                  "Let us Carry the logs & the boats !"}
                              </h3>
                              <div
                                className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ml-2 mt-1.5 ${
                                  featuredChallenge?.state === "active"
                                    ? "bg-green-400"
                                    : featuredChallenge?.state === "completed"
                                      ? "bg-blue-400"
                                      : "bg-gray-400"
                                }`}
                              />
                            </div>
                            <p className="text-sm text-gray-500 leading-normal line-clamp-3 break-words">
                              {featuredChallenge?.description ||
                                "Carrying logs is a physically and mentally demanding challenge that tests raw strength, endurance, and resilience. Whether it's part of military-style training, survival exercises, or extreme fitness routines, the log carry pushes the body to its limits by requiring participants to transport heavy, awkwardly shaped logs over a set distance or duration."}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <div className="flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>
                                {featuredChallenge?.reward || 100} CPT
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Ticket className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>
                                {featuredChallenge?.voting_fee || 5} CPT
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>
                                {featuredChallenge?.participants?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* End Featured Challenge Card */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of the content */}
        <div className="mx-auto max-w-7xl px-8 py-8">
          {/* Filters - Responsive */}
          <div className="mb-8 flex flex-wrap items-start gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0">
              <span className="text-sm font-medium">Category</span>
              <Select
                defaultValue="all"
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px] rounded-[50px] border-[#8a8a8a]">
                  <SelectValue placeholder="All Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Category</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0">
              <span className="text-sm font-medium">State</span>
              <Select
                defaultValue="all"
                value={selectedState}
                onValueChange={setSelectedState}
              >
                <SelectTrigger className="w-full sm:w-[180px] rounded-[50px] border-[#8a8a8a]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="registration">Open</SelectItem>
                  <SelectItem value="voting">Voting</SelectItem>
                  <SelectItem value="completed">Finalized</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0">
              <span className="text-sm font-medium">Sort By</span>
              <Select
                defaultValue="date"
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-full sm:w-[180px] rounded-[50px] border-[#8a8a8a]">
                  <SelectValue placeholder="Created Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Created Date</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full sm:w-auto sm:ml-auto bg-[#b3731d] text-white hover:bg-[#b3731d]">
              Advance Search
            </Button>
          </div>

          {/* Responsive Challenge Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            {isLoading ? (
              <div className="col-span-full text-center py-16">
                <p>Loading challenges...</p>
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium text-gray-600 mb-4">
                  No challenges found
                </h3>
                <Link href="/create-challenge">
                  <Button
                    variant="outline"
                    className="border-[#b3731d] text-[#b3731d] hover:bg-[#b3731d] hover:text-white"
                  >
                    Create Your First Challenge
                  </Button>
                </Link>
              </div>
            ) : (
              filteredChallenges
                .slice(startIndex, endIndex)
                .map((challenge) => (
                  <div key={challenge.id} className="flex justify-center">
                    <div className="w-full max-w-[800px] h-full">
                      <ChallengeCard challenge={challenge} />
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Responsive Pagination */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-[#b3731d] text-white hover:bg-[#b3731d]/90"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </Button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant="outline"
                  className={
                    page === currentPage
                      ? "border-[#b3731d] text-[#b3731d] hover:bg-transparent hover:text-[#b3731d] hover:border-[#b3731d]"
                      : "hover:bg-transparent hover:text-inherit"
                  }
                  size="icon"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="icon"
              className="bg-[#b3731d] text-white hover:bg-[#b3731d]/90"
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              &gt;
            </Button>
          </div>
        </div>
      </main>

      {/* Responsive Footer */}
      <footer className="mt-auto">
        <div className="flex justify-center">
          <div className="w-[80%] h-px bg-[#898989]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center">
            <Link
              href="/faq"
              className="text-gray-600 hover:text-[#b3731d] transition-colors"
            >
              FAQ
            </Link>
            <span className="hidden sm:block text-gray-300">|</span>

            <Link
              href="/privacy"
              className="text-gray-600 hover:text-[#b3731d] transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
