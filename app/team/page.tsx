import { getTeamMembersGroupedByYear } from "@/lib/team/db";
import TeamGrid from "./team-grid";

export const dynamic = "force-dynamic"; // Always fetch fresh data

export default async function TeamPage() {
  const grouped = await getTeamMembersGroupedByYear();

  return <TeamGrid grouped={grouped} />;
}
