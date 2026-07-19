import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdmin } from "@/lib/db/supabase";

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { quizId } = await context.params;

  if (!quizId) {
    return NextResponse.json({ ok: false, message: "Invalid quiz id." }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("quiz_submissions")
    .delete()
    .eq("quiz_id", quizId)
    .select("id");

  if (error) {
    return NextResponse.json({ ok: false, message: "Failed to delete submissions." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deletedCount: data?.length || 0 });
}
