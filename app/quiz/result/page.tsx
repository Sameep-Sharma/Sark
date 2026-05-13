import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { getQuizSession } from "@/lib/auth/session";
import { findQuizUserById } from "@/lib/auth/users";
import { getQuizSubmissionsCollection, findQuizById } from "@/lib/quiz/db";

export const metadata: Metadata = {
  title: "Quiz Submitted",
  description: "SARK quiz submission confirmation.",
};

export default async function QuizResultPage() {
  const session = await getQuizSession();

  if (!session) {
    redirect("/quiz/login");
  }

  const user = await findQuizUserById(session.userId);

  if (!user) {
    redirect("/quiz/login");
  }

  const submissions = await getQuizSubmissionsCollection();
  const submission = await submissions.findOne({ userId: user._id }, { sort: { submittedAt: -1 } });
  const quiz = submission ? await findQuizById(submission.quizId.toString()) : null;
  const invite = quiz?.resultInvite;

  return (
    <main className="quiz-result-page">
      <Image className="quiz-logo" src="/SARK-LOGO.png" alt="SARK" width={220} height={80} priority />

      <section className="quiz-result">
        <div className="quiz-result__mark" aria-hidden="true">
          <CheckCircle2 />
        </div>

        <div className="quiz-result__copy">
          <p>Submission received</p>
          <h1>Thank you for taking the quiz.</h1>
          <span>Your responses have been submitted. The SARK team will review the attempt and continue the process from here.</span>
        </div>

        {invite && (invite.title || invite.description || invite.image) ? (
          <aside className="quiz-result__invite">
            <div>
              <MessageCircle />
              <h2>{invite.title}</h2>
              <p>{invite.description}</p>
            </div>
            {invite.image ? <Image src={invite.image} alt={invite.title || "Result invite"} width={240} height={240} unoptimized /> : null}
          </aside>
        ) : null}
      </section>
    </main>
  );
}
