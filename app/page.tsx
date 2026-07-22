import Image from "next/image";
import Link from "next/link";
import { FlagshipEvents } from "@/components/flagship-events";
import { Shuffle } from "@/components/ui/Shuffle";

export default function Home() {
  return (
    <div className="w-full flex flex-col relative z-10">

      {/* Hero Section */}
      <div className="min-h-screen w-full flex items-center justify-center pt-32 pb-12 px-4 md:px-8">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-black/30  border border-white/10 rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden">

          {/* Subtle red glow behind the card content */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#f84242]/20 blur-[120px] rounded-full pointer-events-none" />

          {/* Left Column: Typography & Call to Action */}
          <div className="relative z-10 flex flex-col items-start space-y-6">
            <span className="text-[#f84242] font-semibold tracking-wider uppercase text-sm md:text-base">
              Welcome
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1]">
              Where Imagination <br />
              <span className="text-[#f84242]">Transform</span> <br />
              To <Shuffle text="Innovation" className="text-[#f84242]" shuffleDirection="right" duration={0.35} animationMode="evenodd" shuffleTimes={2} ease="power3.out" stagger={0.05} threshold={0.1} triggerOnce={true} triggerOnHover={true} respectReducedMotion={true} /><span className="animate-blink text-[#f84242]">_</span>
            </h1>
            
            <div className="pt-4">
              <Link 
                href="/login" 
                className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-[#f84242] rounded-full overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_25px_rgba(248,66,66,0.6)] shadow-[0_0_15px_rgba(248,66,66,0.3)]"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-64 group-hover:h-56 opacity-20"></span>
                <span className="relative">Member's Login</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Visual */}
          <div className="relative z-10 flex justify-center lg:justify-end animate-float mt-12 lg:mt-0">
            <div className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-[#f84242]/30 bg-black">
              <Image
                src="/  Gemini_Generated_Image_b3t71fb3t71fb3t.png"
                alt="Innovation Abstract"
                fill
                className="object-cover opacity-90 mix-blend-screen"
                sizes="(max-width: 768px) 100vw, 500px"
                priority
              />
              {/* Extra gradient overlays to blend it into the dark aesthetic */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#050505] via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#f84242]/20 via-transparent to-transparent opacity-40 mix-blend-overlay" />
            </div>
          </div>
          
        </div>
      </div>

      {/* Flagship Events Section */}
      <FlagshipEvents />

    </div>
  );
}
