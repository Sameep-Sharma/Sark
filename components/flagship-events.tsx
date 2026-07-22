import React from "react";
import { WobbleCard } from "@/components/ui/wobble-card";
import Image from "next/image";

export function FlagshipEvents() {
  return (
    <div className="w-full max-w-7xl mx-auto py-24 md:py-32 px-4 relative z-10">
      <div className="text-center mb-16 md:mb-24 relative">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
          Flagship <span className="text-[#f84242]">Events</span>
        </h2>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-[#f84242]/20 blur-[100px] pointer-events-none rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        
        {/* Card 1: Hackathon (2 columns wide) */}
        <WobbleCard
          containerClassName="col-span-1 lg:col-span-2 h-full bg-[#111] border border-white/10 min-h-[500px] lg:min-h-[300px]"
          className=""
        >
          <div className="max-w-xs relative z-20">
            <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-bold tracking-[-0.015em] text-white">
              Annual Hackathon
            </h2>
            <p className="mt-4 text-left text-base/6 text-neutral-300">
              Join hundreds of innovators for 48 hours of non-stop coding, designing, and building the future. Turn your ideas into reality.
            </p>
          </div>
          <Image
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800"
            width={600}
            height={400}
            alt="Hackathon"
            className="absolute -right-4 lg:-right-[10%] -bottom-10 object-cover rounded-2xl opacity-60 mix-blend-screen mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)] z-10 pointer-events-none"
          />
        </WobbleCard>

        {/* Card 2: Symposium (1 column) */}
        <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-[#1a0505] border border-[#f84242]/30">
          <div className="relative z-20">
            <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-bold tracking-[-0.015em] text-white">
              Tech Symposium
            </h2>
            <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-300">
              Experience keynote speeches, workshops, and panel discussions on cutting-edge tech from industry leaders.
            </p>
          </div>
          <Image
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
            width={400}
            height={400}
            alt="Symposium"
            className="absolute -right-10 -bottom-10 object-cover opacity-20 mix-blend-overlay z-10 pointer-events-none"
          />
        </WobbleCard>

        {/* Card 3: Design Workshop (Full width) */}
        <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-black border border-white/10 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
          <div className="max-w-sm relative z-20">
            <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-bold tracking-[-0.015em] text-white">
              Design Workshop
            </h2>
            <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-300">
              Master the art of UI/UX and product design. Hands-on sessions with experienced designers to elevate your creative skills.
            </p>
          </div>
          <Image
            src="https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800"
            width={600}
            height={600}
            alt="Design Workshop"
            className="absolute -right-10 md:-right-[20%] lg:-right-[5%] -bottom-10 object-contain rounded-2xl opacity-70 mix-blend-screen z-10 pointer-events-none"
          />
        </WobbleCard>
        
      </div>
    </div>
  );
}
