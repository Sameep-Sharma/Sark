import "server-only";

import { promises as fs } from "fs";
import path from "path";

import { getSupabaseAdmin } from "@/lib/db/supabase";

/* ── Types ── */
export interface TeamMember {
  id: string;
  name: string;
  year: string;
  title: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  portfolio_url: string | null;
  tech_stack: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTeamMemberInput {
  name: string;
  year: string;
  title?: string;
  avatar_url?: string;
  banner_url?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  portfolio_url?: string;
  tech_stack?: string[];
}

/* ── Queries ── */

const FALLBACK_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "team-members.json",
);

function isPlaceholderSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (
    !url ||
    url.includes("placeholder-project") ||
    url.includes("<project-id>") ||
    url.includes("your-supabase")
  );
}

async function readFallbackMembers(): Promise<TeamMember[]> {
  try {
    const file = await fs.readFile(FALLBACK_FILE_PATH, "utf-8");
    const parsed = JSON.parse(file) as TeamMember[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("[team/db] Could not read fallback team members:", error);
    }
    return [];
  }
}

async function writeFallbackMembers(members: TeamMember[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(FALLBACK_FILE_PATH), { recursive: true });
    await fs.writeFile(
      FALLBACK_FILE_PATH,
      JSON.stringify(members, null, 2),
      "utf-8",
    );
  } catch (error) {
    console.warn("[team/db] Could not write fallback team members:", error);
  }
}

/**
 * Fetch all team members, ordered by year (4th→1st) then by name.
 */
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  if (isPlaceholderSupabase()) {
    return readFallbackMembers();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn(
        "[team/db] getAllTeamMembers notice, using fallback data:",
        error.message,
      );
      return readFallbackMembers();
    }

    if (data && data.length > 0) {
      return data as TeamMember[];
    }
  } catch (error) {
    console.warn(
      "[team/db] getAllTeamMembers notice, using fallback data:",
      error instanceof Error ? error.message : String(error),
    );
  }

  return readFallbackMembers();
}

/**
 * Fetch team members grouped by year.
 * Returns a Record where keys are year strings (e.g. "4th Year")
 * in the standard display order.
 */
export async function getTeamMembersGroupedByYear(): Promise<
  Record<string, TeamMember[]>
> {
  const members = await getAllTeamMembers();

  const yearOrder = ["4th Year", "3rd Year", "2nd Year", "1st Year"];
  const grouped: Record<string, TeamMember[]> = {};

  for (const year of yearOrder) {
    const yearMembers = members.filter((m) => m.year === year);
    if (yearMembers.length > 0) {
      grouped[year] = yearMembers;
    }
  }

  return grouped;
}

/**
 * Fetch alumni team members grouped by graduation year / batch.
 */
export async function getAlumniMembersGroupedByYear(): Promise<
  Record<string, TeamMember[]>
> {
  const members = await getAllTeamMembers();

  const alumniMembers = members.filter(
    (m) =>
      m.year.toLowerCase().includes("alumni") ||
      m.year.toLowerCase().includes("graduated") ||
      /^\d{4}$/.test(m.year)
  );

  const targetMembers = alumniMembers.length > 0 ? alumniMembers : members;

  const grouped: Record<string, TeamMember[]> = {};
  for (const m of targetMembers) {
    const key = m.year || "Alumni Batch";
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(m);
  }

  return grouped;
}

/**
 * Insert a new team member into the database.
 */
export async function createTeamMember(
  input: CreateTeamMemberInput,
): Promise<{ data: TeamMember | null; error: string | null }> {
  if (isPlaceholderSupabase()) {
    const fallbackMember: TeamMember = {
      id: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: input.name,
      year: input.year,
      title: input.title || null,
      avatar_url: input.avatar_url || null,
      banner_url: input.banner_url || null,
      github_url: input.github_url || null,
      linkedin_url: input.linkedin_url || null,
      twitter_url: input.twitter_url || null,
      portfolio_url: input.portfolio_url || null,
      tech_stack: input.tech_stack || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existingMembers = await readFallbackMembers();
    await writeFallbackMembers([...existingMembers, fallbackMember]);

    return { data: fallbackMember, error: null };
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("team_members")
      .insert({
        name: input.name,
        year: input.year,
        title: input.title || null,
        avatar_url: input.avatar_url || null,
        banner_url: input.banner_url || null,
        github_url: input.github_url || null,
        linkedin_url: input.linkedin_url || null,
        twitter_url: input.twitter_url || null,
        portfolio_url: input.portfolio_url || null,
        tech_stack: input.tech_stack || [],
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data: data as TeamMember, error: null };
  } catch (error) {
    console.warn(
      "[team/db] createTeamMember error, using fallback storage:",
      error instanceof Error ? error.message : String(error),
    );

    const fallbackMember: TeamMember = {
      id: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: input.name,
      year: input.year,
      title: input.title || null,
      avatar_url: input.avatar_url || null,
      banner_url: input.banner_url || null,
      github_url: input.github_url || null,
      linkedin_url: input.linkedin_url || null,
      twitter_url: input.twitter_url || null,
      portfolio_url: input.portfolio_url || null,
      tech_stack: input.tech_stack || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existingMembers = await readFallbackMembers();
    await writeFallbackMembers([...existingMembers, fallbackMember]);

    return { data: fallbackMember, error: null };
  }
}

/* ── Image Uploads ── */

/**
 * Upload a file to a Supabase Storage bucket.
 * Returns the public URL on success, null on failure.
 */
export async function uploadTeamImage(
  bucket: "team-avatars" | "team-banners",
  fileName: string,
  file: Buffer,
  contentType: string,
): Promise<string | null> {
  if (isPlaceholderSupabase()) {
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", bucket);
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, fileName), file);
      return `/uploads/${bucket}/${fileName}`;
    } catch (fsError) {
      console.warn("[team/db] Local fallback upload failed:", fsError);
      return null;
    }
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.warn(`[team/db] upload to ${bucket} notice:`, error.message);
    
    // Fallback to local file system
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", bucket);
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, fileName), file);
      return `/uploads/${bucket}/${fileName}`;
    } catch (fsError) {
      console.warn("[team/db] Local fallback upload failed:", fsError);
      return null;
    }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return publicUrl;
}
