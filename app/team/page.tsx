"use client";

import React from "react";
import { FreelancerProfileCard } from "@/components/ui/freelancer-profile-card";
import { Cpu, Monitor, PenTool, Terminal, Code2, Database } from "lucide-react";

// Helper component for tool icons
const ToolIcon = ({ icon: Icon }: { icon: React.ElementType }) => (
  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-neutral-300">
    <Icon className="h-4 w-4" />
  </div>
);

const squadData = {
  "4th Year": [
    {
      name: "Alex Sterling",
      title: "Lead Full-Stack Engineer",
      avatarSrc: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
      bannerSrc: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80",
      experience: "4 Yrs",
      projects: "24+",
      tools: [<ToolIcon key="1" icon={Monitor} />, <ToolIcon key="2" icon={Cpu} />],
    },
    {
      name: "Sarah Chen",
      title: "Head of UI/UX",
      avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      bannerSrc: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80",
      experience: "3 Yrs",
      projects: "18+",
      tools: [<ToolIcon key="1" icon={PenTool} />, <ToolIcon key="2" icon={Monitor} />],
    }
  ],
  "3rd Year": [
    {
      name: "Marcus Johnson",
      title: "Backend Specialist",
      avatarSrc: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop",
      bannerSrc: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80",
      experience: "2.5 Yrs",
      projects: "15+",
      tools: [<ToolIcon key="1" icon={Terminal} />, <ToolIcon key="2" icon={Database} />],
    },
    {
      name: "Elena Rodriguez",
      title: "Frontend Developer",
      avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      bannerSrc: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80",
      experience: "2 Yrs",
      projects: "12+",
      tools: [<ToolIcon key="1" icon={Code2} />, <ToolIcon key="2" icon={Cpu} />],
    }
  ],
  "2nd Year": [
    {
      name: "David Kim",
      title: "Mobile App Developer",
      avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      bannerSrc: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&q=80",
      experience: "1 Yr",
      projects: "5+",
      tools: [<ToolIcon key="1" icon={Monitor} />, <ToolIcon key="2" icon={Code2} />],
    }
  ],
  "1st Year": [
    {
      name: "Maya Patel",
      title: "Junior Developer",
      avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
      bannerSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
      experience: "6 Mos",
      projects: "2+",
      tools: [<ToolIcon key="1" icon={Terminal} />, <ToolIcon key="2" icon={Cpu} />],
    }
  ]
};

export default function TeamPage() {
  return (
    <div className="min-h-screen w-full relative z-10 pt-32 pb-24 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-24 relative">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight">
          Meet The <span className="text-[#f84242]">Dev Squad</span>
        </h1>
        <p className="mt-6 text-neutral-400 max-w-2xl mx-auto text-lg">
          The brilliant minds behind SARK. Building the future, one line of code at a time.
        </p>
        
        {/* Subtle glowing orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-[#f84242]/20 blur-[100px] pointer-events-none rounded-full" />
      </div>

      {/* Squad Sections */}
      <div className="max-w-7xl mx-auto space-y-32">
        {Object.entries(squadData).map(([year, members]) => (
          <div key={year} className="relative">
            {/* Year Heading */}
            <div className="mb-12 border-b border-white/10 pb-4">
              <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                <span className="text-[#f84242]">|</span> {year}
              </h2>
            </div>

            {/* Grid of Profile Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {members.map((member, index) => (
                <FreelancerProfileCard
                  key={index}
                  name={member.name}
                  title={member.title}
                  avatarSrc={member.avatarSrc}
                  bannerSrc={member.bannerSrc}
                  duration={member.experience}
                  rate={member.projects}
                  tools={member.tools}
                  onGetInTouch={() => console.log(`Viewing profile of ${member.name}`)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
