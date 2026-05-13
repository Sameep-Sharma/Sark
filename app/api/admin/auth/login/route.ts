import { NextResponse } from "next/server";

import { createAdminSession } from "@/lib/auth/admin-session";

const ADMIN_USERNAME = "sarktech";
const ADMIN_PASSWORD = "nrhs123";

type AdminLoginBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AdminLoginBody;
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, message: "Invalid admin credentials." }, { status: 401 });
  }

  await createAdminSession();

  return NextResponse.json({ ok: true });
}
