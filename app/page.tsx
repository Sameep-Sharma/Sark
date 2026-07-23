import Link from "next/link";
import { FlagshipEvents } from "@/components/flagship-events";
import { Shuffle } from "@/components/ui/Shuffle";
import { RayBackground } from "@/components/ui/bolt-style-chat";
import { Sparkles, Mouse, ChevronDown, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full flex flex-col relative z-10">

      {/* Hero Section with SARK Red Ray Background */}
      <div className="min-h-screen w-full relative flex flex-col justify-between pt-36 md:pt-40 pb-8 px-4 md:px-12 overflow-hidden bg-[#050505]">
        
        {/* Ray Background Canvas */}
        <RayBackground />

        {/* Dark Vignette Overlay for Crisp Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40 pointer-events-none z-[1]" />

        {/* Hero Main Content */}
        <div className="max-w-5xl w-full mx-auto flex flex-col items-center justify-center text-center relative z-10 my-auto px-4">
          
          {/* Top Pill Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs md:text-sm font-medium shadow-xl mb-6"
            style={{ filter: "url(#glass-effect)" }}
          >
            <Sparkles className="h-4 w-4 text-[#f84242]" />
            <span>✨ New Design Ideas</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight max-w-4xl mx-auto">
            <span className="italic font-serif font-normal text-neutral-200">Beautiful</span> Design <br />
            <span className="text-[#f84242]">Experiences</span> & <br />
            <Shuffle
              text="Innovation"
              className="text-[#f84242]"
              shuffleDirection="right"
              duration={0.35}
              animationMode="evenodd"
              shuffleTimes={2}
              ease="power3.out"
              stagger={0.05}
              threshold={0.1}
              triggerOnce={true}
              triggerOnHover={true}
              respectReducedMotion={true}
            />
            <span className="animate-blink text-[#f84242]">_</span>
          </h1>

          <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl leading-relaxed mx-auto">
            Where imagination transforms into cutting-edge technical products, campus hackathons, and creative engineering.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <Link 
              href="/login" 
              className="group relative inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-[#f84242] rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(248,66,66,0.6)] shadow-[0_0_15px_rgba(248,66,66,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Member&apos;s Login
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="#flagship-events"
              className="px-8 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm transition-all duration-300 hover:bg-white/20 hover:border-white/40 cursor-pointer"
            >
              Explore Events
            </Link>
          </div>

        </div>

        {/* Bottom Hero Indicator: "Scroll down" with mouse icon */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-6 pb-2">
          <Link
            href="#flagship-events"
            className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-black/60 backdrop-blur-lg border border-white/15 text-xs font-semibold uppercase tracking-widest text-neutral-300 hover:text-white hover:border-[#f84242]/50 hover:bg-[#f84242]/10 transition-all duration-300 shadow-xl group cursor-pointer"
          >
            <Mouse className="h-4 w-4 text-[#f84242] group-hover:scale-110 transition-transform animate-bounce" />
            <span>Scroll down</span>
            <ChevronDown className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
          </Link>
        </div>

      </div>

      {/* Flagship Events Section */}
      <div id="flagship-events">
        <FlagshipEvents />
      </div>

    </div>
  );
}
