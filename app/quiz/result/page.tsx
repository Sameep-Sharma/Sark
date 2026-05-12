import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, MessageCircle, Sparkles } from "lucide-react";

import { getQuizPayload } from "@/lib/quiz/data";

export const metadata: Metadata = {
  title: "Quiz Submitted",
  description: "SARK quiz submission confirmation.",
};

export default async function QuizResultPage() {
  const quiz = await getQuizPayload();
  const invite = quiz.resultInvite;

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

        <div className="quiz-result__signal" aria-hidden="true">
          <Sparkles />
          <span>Locked in</span>
        </div>

        {invite.image ? (
          <aside className="quiz-result__invite">
            <div>
              <MessageCircle />
              <h2>{invite.title}</h2>
              <p>{invite.description}</p>
            </div>
            <Image src={invite.image} alt={invite.title} width={240} height={240} />
          </aside>
        ) : null}
      </section>
    </main>
  );
}
