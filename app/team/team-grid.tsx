"use client";

import React from "react";
import { ProfileCard } from "@/components/ui/profile-card";
import type { TeamMember } from "@/lib/team/db";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80";

export default function TeamGrid({ grouped }: { grouped: Record<string, TeamMember[]> }) {
  const hasMembers = Object.keys(grouped).length > 0;

  return (
    <div className="min-h-screen w-full relative z-10 pt-32 pb-24 px-4 md:px-8 bg-[#050505]">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-24 relative">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight">
          Meet The <span className="text-[#f84242]">Dev Squad</span>
        </h1>
        <p className="mt-6 text-neutral-400 max-w-2xl mx-auto text-lg">
          The brilliant minds behind SARK. Building the future, one line of code at a time.
        </p>
        
        {/* Glowing orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-[#f84242]/20 blur-[100px] pointer-events-none rounded-full" />
      </div>

      {!hasMembers ? (
        <div className="text-center text-neutral-500 mt-20">
          <p>No team members found. Be the first to join!</p>
        </div>
      ) : (
        /* Squad Sections */
        <div className="max-w-7xl mx-auto space-y-32">
          {Object.entries(grouped).map(([year, members]) => (
            <div key={year} className="relative">
              {/* Year Heading */}
              <div className="mb-12 border-b border-white/10 pb-4">
                <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                  <span className="text-[#f84242]">|</span> {year}
                </h2>
              </div>

              {/* Grid of Profile Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {members.map((member) => (
                  <ProfileCard
                    key={member.id}
                    name={member.name}
                    bio={member.title || "Product Designer & Developer"}
                    avatarImage={member.avatar_url || DEFAULT_AVATAR}
                    coverImage={member.banner_url || DEFAULT_COVER}
                    socialLinks={{
                      instagram: member.portfolio_url || undefined,
                      twitter: member.twitter_url || undefined,
                      layers: member.github_url || undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
