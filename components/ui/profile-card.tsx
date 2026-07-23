"use client";

import React from "react";
import { Plus, Layers } from "lucide-react";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  layers?: string;
}

export interface ProfileCardProps {
  coverImage?: string;
  avatarImage?: string;
  name?: string;
  bio?: string;
  likes?: string;
  posts?: string;
  views?: string;
  expProgress?: number;
  socialLinks?: SocialLinks;
  onFollow?: () => void;
  className?: string;
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80";
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";

export function ProfileCard({
  coverImage = DEFAULT_COVER,
  avatarImage = DEFAULT_AVATAR,
  name = "Bhomik Chauhan",
  bio = "Product Designer who focuses on simplicity & usability.",
  likes = "72.9K",
  posts = "828",
  views = "342.9K",
  expProgress = 75,
  socialLinks,
  onFollow,
  className = "",
}: ProfileCardProps) {
  return (
    <div className={`relative w-full max-w-[380px] rounded-3xl overflow-hidden bg-[#0e0e10] border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 ${className}`}>
      {/* Cover Photo */}
      <div className="relative h-[180px] w-full overflow-hidden">
        <img
          src={coverImage}
          alt="Cover photo"
          className="h-full w-full object-cover"
        />
        <button
          onClick={onFollow}
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-bold text-black shadow-md transition-all duration-200 hover:scale-105 hover:bg-neutral-200 active:scale-95"
        >
          <span>Follow</span>
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
        </button>
      </div>

      {/* Avatar Overlap */}
      <div className="absolute top-[132px] left-6">
        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-[#0e0e10] bg-[#0e0e10] shadow-xl">
          <img
            src={avatarImage}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 pt-14 pb-6">
        {/* exp. progress row */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-400 lowercase">exp.</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 via-orange-500 via-yellow-500 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, expProgress))}%` }}
            />
          </div>
        </div>

        {/* Name */}
        <h3 className="mt-4 text-2xl font-bold text-white tracking-tight">{name}</h3>

        {/* Bio */}
        <p className="mt-1 text-sm leading-relaxed text-blue-300/60 font-medium">{bio}</p>

        {/* Divider */}
        <div className="my-4 border-b border-white/10" />

        {/* Stats Row */}
        <div className="grid grid-cols-3 items-center text-center">
          <div className="pr-2 border-r border-white/10">
            <div className="text-xl font-bold text-white">{likes}</div>
            <div className="mt-0.5 text-xs text-gray-400 font-medium">Likes</div>
          </div>
          <div className="px-2 border-r border-white/10">
            <div className="text-xl font-bold text-white">{posts}</div>
            <div className="mt-0.5 text-xs text-gray-400 font-medium">Posts</div>
          </div>
          <div className="pl-2">
            <div className="text-xl font-bold text-white">{views}</div>
            <div className="mt-0.5 text-xs text-gray-400 font-medium">Views</div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-b border-white/10" />

        {/* Social Icons Row */}
        <div className="flex items-center justify-center gap-6 pt-1">
          <a
            href={socialLinks?.instagram || "#"}
            target={socialLinks?.instagram ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="text-gray-400 transition-all duration-200 hover:text-white hover:scale-110 active:scale-95"
            aria-label="Instagram"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
          <a
            href={socialLinks?.twitter || "#"}
            target={socialLinks?.twitter ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="text-gray-400 transition-all duration-200 hover:text-white hover:scale-110 active:scale-95"
            aria-label="Twitter"
          >
            <TwitterIcon className="h-5 w-5" />
          </a>
          <a
            href={socialLinks?.layers || "#"}
            target={socialLinks?.layers ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="text-gray-400 transition-all duration-200 hover:text-white hover:scale-110 active:scale-95"
            aria-label="Layers"
          >
            <Layers className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
