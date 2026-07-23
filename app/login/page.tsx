"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Upload,
  X,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { SmoothInput } from "@/components/ui/smooth-input";

/* ── Inline brand SVG icons ── */
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TECH_SUGGESTIONS = [
  "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "SvelteKit",
  "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap",
  "Sass/SCSS", "Three.js", "GSAP", "Framer Motion", "WebGL", "Redux", "Zustand",
  "Node.js", "Express.js", "NestJS", "Python", "Django", "FastAPI", "Flask",
  "Java", "Spring Boot", "C++", "C#", ".NET", "Go", "Rust", "PHP", "Laravel",
  "Ruby", "Ruby on Rails", "GraphQL", "REST API", "gRPC", "WebSockets",
  "PostgreSQL", "MongoDB", "MySQL", "SQLite", "Redis", "Supabase", "Firebase",
  "Prisma", "Drizzle ORM", "Elasticsearch", "Docker", "Kubernetes", "AWS",
  "Google Cloud", "Azure", "Vercel", "Netlify", "Git", "GitHub Actions",
  "Flutter", "React Native", "Swift", "Kotlin", "Figma", "OpenAI API", "PyTorch", "TensorFlow"
];

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

interface ProfileFormData {
  name: string;
  year: string;
  title: string;
  profilePicture: File | null;
  bannerImage: File | null;
  github: string;
  linkedin: string;
  twitter: string;
  portfolio: string;
  techStack: string[];
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    year: "",
    title: "",
    profilePicture: null,
    bannerImage: null,
    github: "",
    linkedin: "",
    twitter: "",
    portfolio: "",
    techStack: [],
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [techInput, setTechInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (
    field: "profilePicture" | "bannerImage",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, [field]: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      if (field === "profilePicture")
        setProfilePreview(reader.result as string);
      else setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !formData.techStack.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, trimmed],
      }));
    }
    setTechInput("");
  };

  const removeTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tech),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("year", formData.year);
      if (formData.title) body.append("title", formData.title);
      if (formData.profilePicture) body.append("profilePicture", formData.profilePicture);
      if (formData.bannerImage) body.append("bannerImage", formData.bannerImage);
      if (formData.github) body.append("github", formData.github);
      if (formData.linkedin) body.append("linkedin", formData.linkedin);
      if (formData.twitter) body.append("twitter", formData.twitter);
      if (formData.portfolio) body.append("portfolio", formData.portfolio);
      if (formData.techStack.length > 0) {
        body.append("techStack", JSON.stringify(formData.techStack));
      }

      const res = await fetch("/api/team", {
        method: "POST",
        body,
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error || "Something went wrong.");
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/team");
      }, 1500);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-32 px-4 relative z-50">

      <div className="text-center mb-10 mt-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Join The <span className="text-[#f84242]">Squad</span>
        </h1>
        <p className="mt-3 text-neutral-400 text-base max-w-md mx-auto">
          Set up your SARK member profile. All fields with
          <span className="text-[#f84242]"> * </span>are required.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">

        <form onSubmit={handleSubmit} className="relative z-10 pointer-events-auto bg-[#111111]">

          {/* Banner Preview / Upload */}
          <div className="relative h-44 w-full bg-neutral-900 group">
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="h-full w-full object-cover opacity-80"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800">
                <span className="text-neutral-600 text-sm">Banner Image</span>
              </div>
            )}

            <label
              htmlFor="banner-upload"
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 text-neutral-300 text-xs border border-white/10 cursor-pointer hover:bg-black transition-colors pointer-events-auto"
            >
              <Upload className="h-3.5 w-3.5" /> Upload Banner
            </label>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange("bannerImage", e)}
            />

            {/* Profile Picture (overlapping banner) */}
            <div className="absolute left-1/2 bottom-0 translate-y-1/2 -translate-x-1/2">
              <label
                htmlFor="profile-upload"
                className="cursor-pointer group/avatar block"
              >
                <div className="relative h-28 w-28 rounded-full border-4 border-[#111111] overflow-hidden bg-neutral-800 shadow-xl pointer-events-auto">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-neutral-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                </div>
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange("profilePicture", e)}
              />
            </div>
          </div>

          <div className="px-6 md:px-8 pt-20 pb-8 space-y-6">

            {/* Name */}
            <div>
              <label htmlFor="field-name" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Full Name <span className="text-[#f84242]">*</span>
              </label>
              <SmoothInput
                id="field-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}

                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#f84242] transition-all text-sm pointer-events-auto"
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="field-title" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Title / Role
              </label>
              <SmoothInput
                id="field-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}

                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#f84242] transition-all text-sm pointer-events-auto"
              />
            </div>

            {/* Year Select */}
            <div>
              <label htmlFor="field-year" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Year <span className="text-[#f84242]">*</span>
              </label>
              <select
                id="field-year"
                required
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-[#f84242] transition-all text-sm appearance-none pointer-events-auto"
              >
                <option value="" disabled className="bg-[#111111] text-neutral-500">Select your year</option>
                {YEAR_OPTIONS.map((yr) => (
                  <option key={yr} value={yr} className="bg-[#111111] text-white">
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-white/5 pt-2" />

            {/* Social Links */}
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                Social & Links
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-[#f84242] transition-all">
                  <GithubIcon className="h-4 w-4 text-neutral-500" />
                  <SmoothInput
                    type="url"
                    value={formData.github}
                    onChange={(e) => handleInputChange("github", e.target.value)}

                    className="flex-1 bg-transparent text-white text-sm placeholder:text-neutral-600 focus:outline-none pointer-events-auto"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-[#f84242] transition-all">
                  <LinkedinIcon className="h-4 w-4 text-neutral-500" />
                  <SmoothInput
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}

                    className="flex-1 bg-transparent text-white text-sm placeholder:text-neutral-600 focus:outline-none pointer-events-auto"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-[#f84242] transition-all">
                  <TwitterIcon className="h-4 w-4 text-neutral-500" />
                  <SmoothInput
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange("twitter", e.target.value)}

                    className="flex-1 bg-transparent text-white text-sm placeholder:text-neutral-600 focus:outline-none pointer-events-auto"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-[#f84242] transition-all">
                  <Globe className="h-4 w-4 text-neutral-500" />
                  <SmoothInput
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange("portfolio", e.target.value)}

                    className="flex-1 bg-transparent text-white text-sm placeholder:text-neutral-600 focus:outline-none pointer-events-auto"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-2" />

            {/* Tech Stack */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="field-techstack" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Tech Stack {formData.techStack.length > 0 ? `(${formData.techStack.length} selected)` : ""}
                </label>
                {formData.techStack.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, techStack: [] }))}
                    className="text-[11px] text-neutral-500 hover:text-red-400 transition-colors pointer-events-auto cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {formData.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 max-h-36 overflow-y-auto p-1">
                  {formData.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f84242]/15 text-[#f84242] text-xs font-medium border border-[#f84242]/20 shadow-xs"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="hover:text-white transition-colors pointer-events-auto cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-[#f84242] transition-all">
                <Plus className="h-4 w-4 text-neutral-500 shrink-0" />
                <SmoothInput
                  id="field-techstack"
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (techInput.trim()) addTech(techInput);
                    }
                  }}
                  placeholder="Type or click suggestions below..."
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-neutral-600 focus:outline-none pointer-events-auto"
                />
                <button
                  type="button"
                  onClick={() => techInput.trim() && addTech(techInput)}
                  className="text-xs text-[#f84242] font-semibold hover:text-white pointer-events-auto cursor-pointer"
                >
                  ADD
                </button>
              </div>

              {/* Interactive Suggestions List */}
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Popular Tech Suggestions (Click to add)</span>
                  <span className="text-neutral-600 font-normal">
                    {TECH_SUGGESTIONS.filter(t => !formData.techStack.includes(t) && (!techInput || t.toLowerCase().includes(techInput.toLowerCase()))).length} options
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {TECH_SUGGESTIONS
                    .filter((tech) => !formData.techStack.includes(tech) && (!techInput || tech.toLowerCase().includes(techInput.toLowerCase())))
                    .map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => addTech(tech)}
                        className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#f84242]/20 hover:text-[#f84242] hover:border-[#f84242]/30 text-neutral-300 text-xs transition-colors border border-white/5 pointer-events-auto cursor-pointer"
                      >
                        + {tech}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Profile created successfully! Redirecting...
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || submitSuccess || !formData.name || !formData.year}
                className="w-full rounded-xl bg-[#f84242] py-3.5 text-sm font-bold text-white uppercase tracking-wider transition-all hover:bg-[#d63838] disabled:opacity-40 disabled:cursor-not-allowed pointer-events-auto"
              >
                {isSubmitting ? "Submitting..." : submitSuccess ? "Success ✓" : "Submit Profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
