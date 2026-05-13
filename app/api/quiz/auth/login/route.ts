import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth/password";
import { createQuizSession } from "@/lib/auth/session";
import { findQuizUserByEmail, normalizeEmail } from "@/lib/auth/users";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "Email and password are required." }, { status: 400 });
    }

    const user = await findQuizUserByEmail(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ ok: false, message: "Invalid email or password." }, { status: 401 });
    }

    await createQuizSession(user);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Quiz login failed", error);

    return NextResponse.json({ ok: false, message: "Unable to log in." }, { status: 500 });
  }
}
