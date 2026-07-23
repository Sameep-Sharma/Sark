import { NextRequest, NextResponse } from "next/server";
import {
  createTeamMember,
  uploadTeamImage,
  getAllTeamMembers,
} from "@/lib/team/db";

/**
 * GET /api/team — Returns all team members as JSON.
 */
export async function GET() {
  const members = await getAllTeamMembers();
  return NextResponse.json({ members });
}

/**
 * POST /api/team — Create a new team member profile.
 * Accepts multipart/form-data with fields:
 *   name (required), year (required), title,
 *   profilePicture (file), bannerImage (file),
 *   github, linkedin, twitter, portfolio,
 *   techStack (comma-separated or JSON array string)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // ── Required fields ──
    const name = formData.get("name") as string | null;
    const year = formData.get("year") as string | null;

    if (!name || !year) {
      return NextResponse.json(
        { error: "Name and year are required." },
        { status: 400 }
      );
    }

    const validYears = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    if (!validYears.includes(year)) {
      return NextResponse.json(
        { error: "Invalid year. Must be 1st Year, 2nd Year, 3rd Year, or 4th Year." },
        { status: 400 }
      );
    }

    // ── Optional text fields ──
    const title = (formData.get("title") as string) || undefined;
    const github = (formData.get("github") as string) || undefined;
    const linkedin = (formData.get("linkedin") as string) || undefined;
    const twitter = (formData.get("twitter") as string) || undefined;
    const portfolio = (formData.get("portfolio") as string) || undefined;

    // ── Tech stack (sent as JSON array string) ──
    let techStack: string[] = [];
    const techStackRaw = formData.get("techStack") as string | null;
    if (techStackRaw) {
      try {
        techStack = JSON.parse(techStackRaw);
      } catch {
        techStack = techStackRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    // ── File uploads ──
    const profileFile = formData.get("profilePicture") as File | null;
    const bannerFile = formData.get("bannerImage") as File | null;

    const timestamp = Date.now();
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

    let avatarUrl: string | undefined;
    if (profileFile && profileFile.size > 0) {
      const ext = profileFile.name.split(".").pop() || "jpg";
      const fileName = `${safeName}-${timestamp}.${ext}`;
      const buffer = Buffer.from(await profileFile.arrayBuffer());
      const url = await uploadTeamImage(
        "team-avatars",
        fileName,
        buffer,
        profileFile.type
      );
      if (url) avatarUrl = url;
    }

    let bannerUrl: string | undefined;
    if (bannerFile && bannerFile.size > 0) {
      const ext = bannerFile.name.split(".").pop() || "jpg";
      const fileName = `${safeName}-banner-${timestamp}.${ext}`;
      const buffer = Buffer.from(await bannerFile.arrayBuffer());
      const url = await uploadTeamImage(
        "team-banners",
        fileName,
        buffer,
        bannerFile.type
      );
      if (url) bannerUrl = url;
    }

    // ── Insert into DB ──
    const { data, error } = await createTeamMember({
      name,
      year,
      title,
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
      github_url: github,
      linkedin_url: linkedin,
      twitter_url: twitter,
      portfolio_url: portfolio,
      tech_stack: techStack,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: data }, { status: 201 });
  } catch (err) {
    console.error("[api/team] POST error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
