import { getAlumniMembersGroupedByYear } from "@/lib/team/db";
import AlumniGrid from "./alumni-grid";

export const dynamic = "force-dynamic";

export default async function AlumniPage() {
  const grouped = await getAlumniMembersGroupedByYear();

  return <AlumniGrid grouped={grouped} />;
}
