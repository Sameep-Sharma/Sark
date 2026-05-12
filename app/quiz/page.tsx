import type { Metadata } from "next";

import { QuizExperience } from "@/components/quiz/QuizExperience";

export const metadata: Metadata = {
  title: "Quiz",
  description: "SARK quiz interface.",
};

export default function QuizPage() {
  return <QuizExperience />;
}
