import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { QuizAlreadySubmitted, QuizExperience } from "@/components/quiz/QuizExperience";
import { getQuizSession } from "@/lib/auth/session";
import { findQuizUserById } from "@/lib/auth/users";
import { findQuizSubmission } from "@/lib/quiz/data";
import { getActiveQuiz } from "@/lib/quiz/db";

export const metadata: Metadata = {
  title: "Quiz",
  description: "SARK quiz interface.",
};

export default async function QuizPage() {
  const session = await getQuizSession();

  if (!session) {
    redirect("/quiz/login");
  }

  const user = await findQuizUserById(session.userId);

  if (!user) {
    redirect("/quiz/login");
  }

  const activeQuiz = await getActiveQuiz();

  if (!activeQuiz) {
    return <QuizAlreadySubmitted message="No quiz is active right now." />;
  }

  const submission = await findQuizSubmission(user._id, activeQuiz._id);

  if (submission) {
    return <QuizAlreadySubmitted score={submission.score} quizName={submission.quizName} />;
  }

  return <QuizExperience attemptStorageKey={`sark-quiz-attempt:${session.userId}:${activeQuiz._id.toString()}`} />;
}
