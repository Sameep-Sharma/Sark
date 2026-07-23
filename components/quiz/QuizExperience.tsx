"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clock3, Loader2, Play } from "lucide-react";

import type { QuizPayload } from "@/lib/quiz/types";
import { LumaSpin } from "@/components/ui/luma-spin";

type StoredQuizAttempt = {
  hasStarted: boolean;
  activeIndex: number;
  answers: Record<string, string>;
  startedAt: number;
};

export function QuizExperience({ attemptStorageKey }: { attemptStorageKey: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasRestoredAttempt, setHasRestoredAttempt] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [showUnattendedWarning, setShowUnattendedWarning] = useState(false);
  const [showAlreadySubmitted, setShowAlreadySubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let shouldUpdate = true;

    async function loadQuiz() {
      try {
        const response = await fetch("/api/quiz", { cache: "no-store" });

        if (!response.ok) {
          const result = (await response.json().catch(() => null)) as { message?: string } | null;

          throw new Error(result?.message ?? "Quiz data request failed.");
        }

        const payload = (await response.json()) as QuizPayload;

        if (shouldUpdate) {
          setQuiz(payload);
          setLoadError(null);
        }
      } catch (error) {
        if (shouldUpdate) {
          setLoadError(error instanceof Error ? error.message : "Unable to load quiz data.");
        }
      }
    }

    loadQuiz();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  useEffect(() => {
    if (!quiz || hasRestoredAttempt) {
      return;
    }

    setHasRestoredAttempt(true);

    try {
      const stored = window.localStorage.getItem(attemptStorageKey);

      if (!stored) {
        return;
      }

      const attempt = JSON.parse(stored) as Partial<StoredQuizAttempt>;
      const startedAtValue = typeof attempt.startedAt === "number" ? attempt.startedAt : null;
      const activeIndexValue = typeof attempt.activeIndex === "number" ? attempt.activeIndex : 0;
      const answersValue =
        attempt.answers && typeof attempt.answers === "object" && !Array.isArray(attempt.answers) ? attempt.answers : {};

      if (!attempt.hasStarted || !startedAtValue) {
        return;
      }

      const elapsedSeconds = Math.floor((Date.now() - startedAtValue) / 1000);

      setHasStarted(true);
      setStartedAt(startedAtValue);
      setActiveIndex(Math.max(0, Math.min(quiz.questions.length - 1, activeIndexValue)));
      setAnswers(answersValue);
      setRemainingSeconds(Math.max(0, quiz.config.durationSeconds - elapsedSeconds));
    } catch {
      window.localStorage.removeItem(attemptStorageKey);
    }
  }, [attemptStorageKey, hasRestoredAttempt, quiz]);

  useEffect(() => {
    if (!quiz || !hasStarted || !startedAt) {
      return;
    }

    const attempt: StoredQuizAttempt = {
      hasStarted,
      activeIndex,
      answers,
      startedAt,
    };

    window.localStorage.setItem(attemptStorageKey, JSON.stringify(attempt));
  }, [activeIndex, answers, attemptStorageKey, hasStarted, quiz, startedAt]);

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
        body: JSON.stringify({ answers, startedAt, quizId: quiz.id }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          window.localStorage.removeItem(attemptStorageKey);
          setShowAlreadySubmitted(true);
          return;
        }

        throw new Error("Quiz submission failed.");
      }

      window.localStorage.removeItem(attemptStorageKey);
      router.push("/quiz/result");
    } catch {
      setSubmitError("Unable to submit right now. Please try again.");
      setIsSubmitting(false);
    }
  }, [answers, attemptStorageKey, isSubmitting, quiz, router]);

  useEffect(() => {
    if (!showAlreadySubmitted) {
      return;
    }

    const timeout = window.setTimeout(() => {
      router.replace("/");
    }, 20_000);

    return () => window.clearTimeout(timeout);
  }, [router, showAlreadySubmitted]);

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
    const nextStartedAt = Date.now();

    setHasStarted(true);
    setActiveIndex(0);
    setStartedAt(nextStartedAt);
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

      {showAlreadySubmitted ? <QuizAlreadySubmittedOverlay /> : null}

      {!quiz || !hasRestoredAttempt ? (
        <QuizLoading message={loadError ?? "Loading quiz data"} />
      ) : !hasStarted ? (
        <section className="quiz-start">
          <div className="quiz-start__intro">
            <p>{formatStartTime(quiz.config.startsAt)}</p>
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
          </div>

          <div className="quiz-start__lower">
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

export function QuizAlreadySubmitted({ score, quizName, message }: { score?: number; quizName?: string; message?: string }) {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace("/");
    }, 20_000);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <main className="quiz-app">
      <header className="quiz-chrome">
        <Image className="quiz-logo" src="/SARK-LOGO.png" alt="SARK" width={220} height={80} priority />
      </header>
      <QuizAlreadySubmittedOverlay score={score} quizName={quizName} message={message} />
    </main>
  );
}

function QuizAlreadySubmittedOverlay({ score, quizName, message }: { score?: number; quizName?: string; message?: string }) {
  return (
    <div className="quiz-attempt-toast" role="alert" aria-live="assertive">
      <div className="quiz-attempt-toast__panel">
        <span>
          <Check />
        </span>
        <p>{message ? "Quiz unavailable" : "Attempt already submitted"}</p>
        <h2>{message ?? "You cannot retake this quiz."}</h2>
        <strong>
          {typeof score === "number"
            ? `Recorded score: ${score}%${quizName ? ` for ${quizName}` : ""}`
            : message
              ? "Please check back after an admin activates a quiz."
              : "Your recorded result is already saved."}
        </strong>
        <em>Redirecting to home in 20 seconds.</em>
      </div>
    </div>
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
    <section className="quiz-loading flex flex-col items-center justify-center gap-4 py-12">
      <LumaSpin />
      <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">{message}</span>
    </section>
  );
}

function formatStartTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `Started ${date.toLocaleString()}`;
}
