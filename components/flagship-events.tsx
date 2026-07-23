"use client";

import React from "react";
import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Code2, Sparkles, Terminal, ArrowUpRight } from "lucide-react";

const EVENTS = [
  {
    title: "Annual Hackathon 2026",
    category: "48-Hour Sprint",
    description: "Join hundreds of innovators for 48 hours of non-stop coding, designing, and building the future.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200",
    badge: "₹1,50,000+ Prizes",
    icon: Terminal,
  },
  {
    title: "National Tech Symposium",
    category: "Keynote & Panels",
    description: "Experience keynote speeches, hands-on tech demos, and panel discussions from industry leaders.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
    badge: "Keynote Speakers",
    icon: Sparkles,
  },
  {
    title: "UI/UX & Product Workshop",
    category: "Design Masterclass",
    description: "Master the art of product design, interaction physics, and design systems with veteran mentors.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1200",
    badge: "Hands-on Lab",
    icon: Code2,
  },
];

export function FlagshipEvents() {
  return (
    <div className="w-full flex flex-col items-center justify-center relative overflow-hidden pt-20 md:pt-28 pb-12">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f84242]/15 text-[#f84242] text-xs font-semibold uppercase tracking-wider border border-[#f84242]/30 mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Annual Experience
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Flagship <span className="text-[#f84242]">Events</span>
            </h1>
            <p className="mt-3 mb-12 md:mb-20 text-neutral-400 text-sm md:text-base max-w-xl mx-auto">
              Scroll to reveal SARK&apos;s biggest technical gatherings, hackathons, and design masterclasses.
            </p>
          </div>
        }
      >
        <div className="h-full w-full bg-neutral-950 p-4 md:p-6 overflow-y-auto rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 border border-white/10 scrollbar-thin scrollbar-thumb-neutral-800">
          {EVENTS.map((event) => {
            const Icon = event.icon;
            return (
              <div
                key={event.title}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-neutral-900/80 flex flex-col justify-between p-5 hover:border-[#f84242]/50 transition-all duration-300 shadow-lg"
              >
                {/* Background Image with Dark Gradient Overlay */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
                </div>

                {/* Top Row: Icon & Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-[#f84242] backdrop-blur-md">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#f84242]/20 border border-[#f84242]/30 text-[#f84242] text-[11px] font-bold tracking-wide uppercase">
                    {event.badge}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 pt-16">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    {event.category}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-white mt-1 group-hover:text-[#f84242] transition-colors flex items-center justify-between">
                    {event.title}
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#f84242]" />
                  </h3>
                  <p className="mt-2 text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ContainerScroll>
    </div>
  );
}
