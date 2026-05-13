import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { QuizAuth } from "@/components/quiz/QuizAuth";
import { getQuizSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Quiz Login",
  description: "Sign in or sign up for the SARK quiz.",
};

export default async function QuizLoginPage() {
  const session = await getQuizSession();

  if (session) {
    redirect("/quiz");
  }

  return <QuizAuth />;
}
