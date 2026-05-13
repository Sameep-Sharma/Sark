import { NextResponse } from "next/server";

import { clearQuizSession } from "@/lib/auth/session";

export async function POST() {
  await clearQuizSession();

  return NextResponse.json({ ok: true });
}
