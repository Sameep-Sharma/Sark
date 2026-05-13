import { NextResponse } from "next/server";
import { MongoServerError } from "mongodb";

import { hashPassword } from "@/lib/auth/password";
import { createQuizSession } from "@/lib/auth/session";
import { ensureQuizUserIndexes, getQuizUsersCollection, normalizeEmail, normalizeUsn } from "@/lib/auth/users";

type SignupBody = {
  name?: string;
  usn?: string;
  email?: string;
  phone?: string;
  password?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  return /^[0-9+\-\s()]{7,18}$/.test(phone);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const name = body.name?.trim() ?? "";
    const usn = normalizeUsn(body.usn ?? "");
    const email = normalizeEmail(body.email ?? "");
    const phone = body.phone?.trim() ?? "";
    const password = body.password ?? "";

    if (!name || !usn || !email || !phone || !password) {
      return NextResponse.json({ ok: false, message: "All fields are required." }, { status: 400 });
    }

    if (name.length < 2) {
      return NextResponse.json({ ok: false, message: "Enter your full name." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ ok: false, message: "Enter a valid phone number." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ ok: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }

    await ensureQuizUserIndexes();
    const users = await getQuizUsersCollection();
    const now = new Date();
    const result = await users.insertOne({
      name,
      usn,
      email,
      phone,
      passwordHash: hashPassword(password),
      score: null,
      timetaken: null,
      createdAt: now,
      updatedAt: now,
    });

    await createQuizSession({ _id: result.insertedId, email });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json({ ok: false, message: "A user with this email or USN already exists." }, { status: 409 });
    }

    console.error("Quiz signup failed", error);

    return NextResponse.json({ ok: false, message: "Unable to create account." }, { status: 500 });
  }
}
