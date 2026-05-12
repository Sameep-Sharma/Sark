import { NextResponse } from "next/server";

import { getQuizPayload } from "@/lib/quiz/data";

export async function GET() {
  const payload = await getQuizPayload();

  return NextResponse.json(payload);
}
