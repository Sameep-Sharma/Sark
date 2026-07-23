import * as React from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Props for the FreelancerProfileCard component.
 */
interface FreelancerProfileCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** The user's full name. */
  name: string;
  /** The user's job title or role. */
  title: string;
  /** URL for the user's avatar image. */
  avatarSrc: string;
  /** URL for the card's banner image. */
  bannerSrc: string;
  /** Optional GitHub URL */
  github_url?: string;
  /** Optional X (Twitter) URL */
  x_url?: string;
  /** Optional LinkedIn URL */
  linkedin_url?: string;
  /** Optional Portfolio/Website URL */
  portfolio_url?: string;
  /** Optional additional class names. */
  className?: string;
}

// Animation variants for Framer Motion
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  hover: {
    scale: 1.03,
    transition: { duration: 0.3 },
  },
};

const contentVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3, // Start staggering after card loads
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/**
 * A reusable, animated profile card component.
 */
export const FreelancerProfileCard = React.forwardRef<
  HTMLDivElement,
  FreelancerProfileCardProps
>(
  (
    {
      className,
      name,
      title,
      avatarSrc,
      bannerSrc,
      github_url,
      x_url,
      linkedin_url,
      portfolio_url,
      ...props
    },
    ref
  ) => {
    const avatarName = name
      .split(" ")
      .map((n) => n[0])
      .join("");

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-lg",
          className
        )}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        {...props}
      >
        {/* Banner Image */}
        <div className="h-48 w-full">
          <img
            src={bannerSrc}
            alt={`${name}'s banner`}
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
        </div>

        {/* Avatar (overlaps banner) */}
        <div className="absolute left-1/2 top-40 -translate-x-1/2 -translate-y-1/2">
          <Avatar className="h-60 w-60 border-4 border-[#0a0a0a]">
            <AvatarImage src={avatarSrc} alt={name} className="object-cover" />
            <AvatarFallback className="bg-[#f84242] text-white">{avatarName}</AvatarFallback>
          </Avatar>
        </div>

        {/* Content Area */}
        <motion.div
          className="px-6 pb-6 pt-28 text-center" // pt-28 to clear larger avatar
          variants={contentVariants}
        >
          {/* Name and Title */}
          <motion.div
            className="mb-6 flex flex-col items-center"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold text-white">
              {name}
            </h2>
            <p className="text-sm text-neutral-400">{title}</p>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants} className="mt-6 flex justify-center gap-4">
            {github_url && (
              <a href={github_url} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f84242] text-white hover:bg-[#d63838] transition-colors" aria-label="GitHub">
                <GithubIcon className="h-6 w-6" />
              </a>
            )}
            {x_url && (
              <a href={x_url} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f84242] text-white hover:bg-[#d63838] transition-colors" aria-label="X (Twitter)">
                <TwitterIcon className="h-6 w-6" />
              </a>
            )}
            {linkedin_url && (
              <a href={linkedin_url} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f84242] text-white hover:bg-[#d63838] transition-colors" aria-label="LinkedIn">
                <LinkedinIcon className="h-6 w-6" />
              </a>
            )}
            {portfolio_url && (
              <a href={portfolio_url} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f84242] text-white hover:bg-[#d63838] transition-colors" aria-label="Portfolio">
                <Globe className="h-6 w-6" />
              </a>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }
);
FreelancerProfileCard.displayName = "FreelancerProfileCard";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
