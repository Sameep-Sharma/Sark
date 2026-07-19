import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const QUIZ_SESSION_COOKIE = "sark_quiz_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 6;

type SessionPayload = {
  userId: string;
  email: string;
  expiresAt: number;
};

function getSessionSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "sark-quiz-dev-secret";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function createSessionToken(payload: SessionPayload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function readSessionToken(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;

    if (!payload.userId || !payload.email || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createQuizSession(user: { id: string; email: string }) {
  const cookieStore = await cookies();
  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });

  cookieStore.set(QUIZ_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearQuizSession() {
  const cookieStore = await cookies();

  cookieStore.delete(QUIZ_SESSION_COOKIE);
}

export async function getQuizSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(QUIZ_SESSION_COOKIE)?.value;

  return token ? readSessionToken(token) : null;
}
