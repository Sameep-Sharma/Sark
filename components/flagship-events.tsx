"use client";

import React from "react";
import { InfoCard } from "@/components/ui/info-card";
import { Sparkles } from "lucide-react";

const EVENTS = [
  {
    title: "Infinity Saga",
    description: "Welcome to the Infinity Saga — an epic journey crafted exclusively for the bright minds joining us this year. Forget dusty orientation halls; this is where your real college story begins.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200",
    borderColor: "var(--border-color-1)",
    effectBgColor: "var(--border-color-1)",
    hoverTextColor: "var(--hover-text-color-1)",
    badge: "01 // ICEBREAKER SAGA",
    tag: "September 2026",
    accentColor: "rgba(248, 66, 66, 0.25)",
  },
  {
    title: "Capture the Flag",
    description: "Dive into real-world security challenges, cryptography, reverse engineering, and web exploits in SARK's flagship cybersecurity showdown.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
    borderColor: "var(--border-color-2)",
    effectBgColor: "var(--border-color-2)",
    hoverTextColor: "var(--hover-text-color-2)",
    badge: "02 // CYBERSECURITY CTF",
    tag: "Keynote & Demos",
    accentColor: "rgba(159, 78, 255, 0.25)",
  },
  {
    title: "Clash of Codes",
    description: "The ultimate competitive programming battle! Solve complex algorithmic problems under pressure and claim your title as SARK's top coder.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1200",
    borderColor: "var(--border-color-3)",
    effectBgColor: "var(--border-color-3)",
    hoverTextColor: "var(--hover-text-color-3)",
    badge: "03 // COMPETITIVE CODING",
    tag: "Prize Pool ₹50k",
    accentColor: "rgba(33, 150, 243, 0.25)",
  },
];

export function FlagshipEvents() {
  return (
    <div id="flagship-events" className="w-full flex flex-col items-center justify-center relative overflow-hidden pt-20 md:pt-28 pb-24 px-4 md:px-12 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center justify-center text-center mb-16 md:mb-20">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f84242]/15 text-[#f84242] text-xs font-semibold uppercase tracking-wider border border-[#f84242]/30 mb-4">
          <Sparkles className="h-3.5 w-3.5" /> Annual Experience
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Flagship <span className="text-[#f84242]">Events</span>
        </h1>
        <p className="mt-3 text-neutral-400 text-sm md:text-base max-w-xl mx-auto">
          Discover SARK&apos;s biggest technical gatherings, hackathons, and design masterclasses.
        </p>
      </div>

      {/* Full-Width Rectangular Horizontal Cards Stack */}
      <div className="w-full flex flex-col gap-8 md:gap-10 max-w-5xl mx-auto relative z-20 pointer-events-auto">
        {EVENTS.map((event) => (
          <div key={event.title} className="w-full group relative z-20 pointer-events-auto transition-transform duration-500 hover:scale-[1.015]">
            {/* Subtle Radial Glow on Hover */}
            <div
              className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none z-0"
              style={{ background: `radial-gradient(circle at center, ${event.accentColor} 0%, transparent 70%)` }}
            />

            {/* Horizontal Rectangular InfoCard */}
            <InfoCard
              image={event.image}
              title={event.title}
              description={event.description}
              badge={event.badge}
              tag={event.tag}
              layout="horizontal"
              width="100%"
              borderColor={event.borderColor}
              effectBgColor={event.effectBgColor}
              hoverTextColor={event.hoverTextColor}
              borderBgColor="var(--border-bg-color)"
              cardBgColor="var(--card-bg-color)"
              textColor="var(--text-color)"
              patternColor1="var(--pattern-color1)"
              patternColor2="var(--pattern-color2)"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
