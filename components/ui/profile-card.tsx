"use client";

import React, { useState } from "react";
import { Plus, Globe, Code2 } from "lucide-react";

const TechIcon = ({ tech }: { tech: string }) => {
  const [error, setError] = useState(false);
  return (
    <div className="group/icon relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      {!error ? (
        <img
          src={`https://cdn.simpleicons.org/${getTechIconSlug(tech)}/white`}
          alt=""
          className="w-5 h-5 opacity-80 group-hover/icon:opacity-100 transition-opacity"
          onError={() => setError(true)}
        />
      ) : (
        <Code2 className="w-5 h-5 opacity-80 group-hover/icon:opacity-100 transition-opacity text-white" />
      )}
      {/* Tooltip */}
      <div 
        className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-black text-white text-[11px] font-semibold rounded-md opacity-0 group-hover/icon:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 border border-white/20 shadow-xl"
        style={{ fontFamily: "'Inter', 'Poppins', sans-serif", letterSpacing: "normal" }}
      >
        {tech}
      </div>
    </div>
  );
};

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.54 6-6.36 0-1.4-.5-2.5-1.3-3.4.1-.3.6-1.6-.1-3.4 0 0-1-.3-3.4 1.3a11.5 11.5 0 0 0-6 0c-2.4-1.6-3.4-1.3-3.4-1.3-.7 1.8-.2 3.1-.1 3.4-.8.9-1.3 2-1.3 3.4 0 4.8 3 6 6 6.36.3.3.5.9.5 1.94v4.06" />
    <path d="M9 20c-4 1-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  portfolio?: string;
}

export interface ProfileCardProps {
  coverImage?: string;
  avatarImage?: string;
  name?: string;
  bio?: string;
  techStack?: string[];
  socialLinks?: SocialLinks;
  onFollow?: () => void;
  className?: string;
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80";
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";

const getTechIconSlug = (name: string) => {
  const normalized = name.toLowerCase().trim();
  const map: Record<string, string> = {
    'nuxt': 'nuxt',
    'nuxt js': 'nuxt',
    'nuxtjs': 'nuxt',
    'nuxt.js': 'nuxt',
    'next': 'nextdotjs',
    'next js': 'nextdotjs',
    'nextjs': 'nextdotjs',
    'next.js': 'nextdotjs',
    'node': 'nodedotjs',
    'node js': 'nodedotjs',
    'nodejs': 'nodedotjs',
    'node.js': 'nodedotjs',
    'vue': 'vuedotjs',
    'vue js': 'vuedotjs',
    'vuejs': 'vuedotjs',
    'vue.js': 'vuedotjs',
    'react': 'react',
    'react js': 'react',
    'reactjs': 'react',
    'react.js': 'react',
    'react native': 'react',
    'c++': 'cplusplus',
    'c#': 'csharp',
    'f#': 'fsharp',
  };
  
  if (map[normalized]) return map[normalized];
  
  return normalized
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/\./g, 'dot')
    .replace(/[^a-z0-9]/g, '');
};

export function ProfileCard({
  coverImage = DEFAULT_COVER,
  avatarImage = DEFAULT_AVATAR,
  name = "Bhomik Chauhan",
  bio = "Product Designer who focuses on simplicity & usability.",
  techStack = [],
  socialLinks,
  onFollow,
  className = "",
}: ProfileCardProps) {
  return (
    <div className={`group relative w-full max-w-[380px] rounded-3xl overflow-hidden bg-[#0e0e10] border border-white/10 shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.12)] hover:-translate-y-2 ${className}`}>
      {/* Cover Photo */}
      <div className="relative h-[180px] w-full overflow-hidden">
        <img
          src={coverImage}
          alt="Cover photo"
          className="h-full w-full object-cover"
        />

      </div>

      {/* Avatar Overlap */}
      <div className="absolute top-[75px] left-1/2 -translate-x-1/2 z-10">
        <div className="h-[211px] w-[211px] overflow-hidden rounded-full border-[6px] border-[#0e0e10] bg-[#0e0e10] shadow-xl">
          <img
            src={avatarImage}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 pt-[120px] pb-6 flex flex-col items-center text-center h-[340px]">
        {/* Name */}
        <h3 className="mt-1 text-2xl font-bold text-white tracking-tight">{name}</h3>

        {/* Bio */}
        <p className="mt-1.5 text-sm leading-relaxed text-blue-300/60 font-medium line-clamp-2 min-h-[40px]">{bio}</p>

        {/* Divider */}
        <div className="my-4 border-b border-white/10 w-full" />

        {/* Tech Stack */}
        <div className="flex-grow flex items-center justify-center">
          {techStack && techStack.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {techStack.map((tech) => (
                <TechIcon key={tech} tech={tech} />
              ))}
            </div>
          ) : (
            <span className="text-xs text-neutral-500 font-medium italic" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>No tech stack listed</span>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 border-b border-white/10" />

        {/* Social Icons Row */}
        <div className="flex items-center justify-center gap-6 pt-1">
          {socialLinks?.github && (
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-all duration-200 hover:text-white hover:scale-110 active:scale-95"
              aria-label="GitHub"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
          )}
          {socialLinks?.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-all duration-200 hover:text-white hover:scale-110 active:scale-95"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="h-5 w-5" />
            </a>
          )}
          {socialLinks?.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-all duration-200 hover:text-white hover:scale-110 active:scale-95"
              aria-label="Twitter"
            >
              <TwitterIcon className="h-5 w-5" />
            </a>
          )}
          {socialLinks?.portfolio && (
            <a
              href={socialLinks.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-all duration-200 hover:text-white hover:scale-110 active:scale-95"
              aria-label="Portfolio"
            >
              <Globe className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
