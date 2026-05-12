"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clock3, Loader2, Play } from "lucide-react";

import type { QuizPayload } from "@/lib/quiz/types";

export function QuizExperience() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [showUnattendedWarning, setShowUnattendedWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let shouldUpdate = true;

    async function loadQuiz() {
      try {
        const response = await fetch("/api/quiz", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Quiz data request failed.");
        }

        const payload = (await response.json()) as QuizPayload;

        if (shouldUpdate) {
          setQuiz(payload);
          setLoadError(null);
        }
      } catch {
        if (shouldUpdate) {
          setLoadError("Unable to load quiz data.");
        }
      }
    }

    loadQuiz();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  const totalQuestions = quiz?.questions.length ?? 0;
  const activeQuestion = quiz?.questions[activeIndex];
  const selectedOption = activeQuestion ? answers[activeQuestion.id] : undefined;

  const canGoBack = activeIndex > 0;
  const canGoNext = activeIndex < totalQuestions - 1;
  const unansweredCount = quiz ? quiz.questions.filter((question) => !answers[question.id]).length : 0;

  const submitQuiz = useCallback(async () => {
    if (!quiz || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setShowUnattendedWarning(false);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error("Quiz submission failed.");
      }

      router.push("/quiz/result");
    } catch {
      setSubmitError("Unable to submit right now. Please try again.");
      setIsSubmitting(false);
    }
  }, [answers, isSubmitting, quiz, router]);

  useEffect(() => {
    if (!quiz || !hasStarted || !startedAt || isSubmitting) {
      return;
    }

    const quizStartedAt = startedAt;

    function updateRemainingTime() {
      const duration = quiz?.config.durationSeconds ?? 0;
      const elapsedSeconds = Math.floor((Date.now() - quizStartedAt) / 1000);
      const nextRemainingSeconds = Math.max(0, duration - elapsedSeconds);

      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds <= 0) {
        void submitQuiz();
      }
    }

    updateRemainingTime();
    const interval = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(interval);
  }, [hasStarted, isSubmitting, quiz, startedAt, submitQuiz]);

  function selectOption(optionId: string) {
    if (!activeQuestion) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [activeQuestion.id]: optionId,
    }));
  }

  function startQuiz() {
    setHasStarted(true);
    setActiveIndex(0);
    setStartedAt(Date.now());
    setRemainingSeconds(quiz?.config.durationSeconds ?? null);
  }

  function goBack() {
    setActiveIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setActiveIndex((current) => Math.min(totalQuestions - 1, current + 1));
  }

  function finishQuiz() {
    if (unansweredCount > 0) {
      setShowUnattendedWarning(true);
      return;
    }

    void submitQuiz();
  }

  return (
    <main className="quiz-app">
      <header className="quiz-chrome">
        <Image
          className="quiz-logo"
          src="/SARK-LOGO.png"
          alt="SARK"
          width={220}
          height={80}
          priority
        />

      </header>

      {quiz && hasStarted ? (
        <>
          <QuizTimer remainingSeconds={remainingSeconds ?? quiz.config.durationSeconds} totalSeconds={quiz.config.durationSeconds} />
          <VerticalProgress
            activeIndex={activeIndex}
            answers={answers}
            questions={quiz.questions}
            totalQuestions={totalQuestions}
          />
        </>
      ) : null}

      {!quiz ? (
        <QuizLoading message={loadError ?? "Loading quiz data"} />
      ) : !hasStarted ? (
        <section className="quiz-start">
          <div className="quiz-start__intro">
            <p>{quiz.config.startsAt}</p>
            <h1>{quiz.config.title}</h1>
            <span>{quiz.config.description}</span>
          </div>

          <div className="quiz-start__details">
            <div className="quiz-start__meta">
              <span>Questions</span>
              <strong>{totalQuestions}</strong>
            </div>
            <div className="quiz-start__meta">
              <span>Duration</span>
              <strong>{quiz.config.duration}</strong>
            </div>
            <div className="quiz-start__meta">
              <span>Passing</span>
              <strong>{quiz.config.passingScore}</strong>
            </div>
            <div className="quiz-start__meta">
              <span>Mode</span>
              <strong>{quiz.config.mode}</strong>
            </div>
          </div>

          <div className="quiz-start__lower">
            <div className="quiz-start__highlights">
              {quiz.config.highlights.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="quiz-rules">
              {quiz.config.rules.map((rule, index) => (
                <p key={rule}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {rule}
                </p>
              ))}
            </div>
          </div>

          <button type="button" className="quiz-primary-button quiz-start__button" onClick={startQuiz}>
            <Play />
            Start quiz
          </button>
        </section>
      ) : activeQuestion ? (
        <section className="quiz-room" style={{ "--question-index": activeIndex } as CSSProperties}>
          <div className="quiz-question-stack">
            <article className="quiz-question">
              <div className="quiz-question__number">
                <span>Question</span>
                <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
              </div>

              <div className="quiz-question__body">
                <h2>{activeQuestion.prompt}</h2>
                {activeQuestion.description ? <p>{activeQuestion.description}</p> : null}
              </div>
            </article>

            <div className="quiz-options">
              {activeQuestion.options.map((option, index) => {
                const isSelected = selectedOption === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`quiz-option ${isSelected ? "is-selected" : ""}`}
                    onClick={() => selectOption(option.id)}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    <strong>{option.label}</strong>
                    <i>{isSelected ? <Check /> : null}</i>
                  </button>
                );
              })}
            </div>

            <div className="quiz-controls">
              <button type="button" className="quiz-secondary-button" onClick={goBack} disabled={!canGoBack}>
                <ArrowLeft />
                Back
              </button>
              <button
                type="button"
                className="quiz-primary-button"
                onClick={canGoNext ? goNext : finishQuiz}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="quiz-spin" /> : null}
                {canGoNext ? "Next" : "Finish"}
                {!isSubmitting ? <ArrowRight /> : null}
              </button>
            </div>

            {submitError ? <p className="quiz-submit-error">{submitError}</p> : null}
          </div>

          {showUnattendedWarning ? (
            <div className="quiz-warning" role="alertdialog" aria-modal="true" aria-labelledby="quiz-warning-title">
              <div className="quiz-warning__panel">
                <span>
                  <AlertTriangle />
                </span>
                <div>
                  <p>{unansweredCount} unattended question{unansweredCount === 1 ? "" : "s"}</p>
                  <h3 id="quiz-warning-title">Submit without answering everything?</h3>
                </div>
                <div className="quiz-warning__actions">
                  <button type="button" className="quiz-secondary-button" onClick={() => setShowUnattendedWarning(false)}>
                    Back
                  </button>
                  <button type="button" className="quiz-primary-button" onClick={() => void submitQuiz()} disabled={isSubmitting}>
                    Submit anyway
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <QuizLoading message="Preparing question" />
      )}
    </main>
  );
}

function QuizTimer({ remainingSeconds, totalSeconds }: { remainingSeconds: number; totalSeconds: number }) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 0;
  const isUrgent = remainingSeconds <= 60;

  return (
    <div className={`quiz-timer ${isUrgent ? "is-urgent" : ""}`} style={{ "--timer-progress": progress } as CSSProperties}>
      <span>
        <Clock3 />
      </span>
      <div>
        <p>Time left</p>
        <strong>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </strong>
      </div>
    </div>
  );
}

function VerticalProgress({
  activeIndex,
  answers,
  questions,
  totalQuestions,
}: {
  activeIndex: number;
  answers: Record<string, string>;
  questions: QuizPayload["questions"];
  totalQuestions: number;
}) {
  const lineProgress =
    totalQuestions <= 1 ? 0 : Math.min(100, Math.max(0, (activeIndex / (totalQuestions - 1)) * 100));

  return (
    <div className="quiz-vertical-progress" aria-label="Quiz progress">
      <div className="quiz-vertical-progress__line" aria-hidden="true">
        <span style={{ height: `${lineProgress}%` }} />
      </div>

      {questions.map((question, index) => {
        const isReached = index <= activeIndex;
        const isActive = index === activeIndex;
        const isAnswered = Boolean(answers[question.id]);

        return (
          <div
            key={question.id}
            className={[
              "quiz-diamond",
              isReached ? "is-reached" : "",
              isActive ? "is-active" : "",
              isAnswered ? "is-answered" : "",
            ].join(" ")}
            aria-label={`Question ${index + 1}${isAnswered ? ", answered" : ", unanswered"}`}
          >
            <span>{index + 1}</span>
          </div>
        );
      })}
    </div>
  );
}

function QuizLoading({ message }: { message: string }) {
  return (
    <section className="quiz-loading">
      <span>{message}</span>
      <div aria-hidden="true" />
    </section>
  );
}
