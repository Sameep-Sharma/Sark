"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { SmoothInput } from "@/components/ui/smooth-input";

type AuthMode = "login" | "signup";

type AuthResponse = {
  ok: boolean;
  message?: string;
};

const signupFields = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  { name: "usn", label: "USN", type: "text", autoComplete: "off" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
];

export function QuizAuth() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const endpoint = mode === "login" ? "/api/quiz/auth/login" : "/api/quiz/auth/signup";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as AuthResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Authentication failed.");
      }

      router.replace("/quiz");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="quiz-auth-page">
      <header className="quiz-auth-header">
        <Image className="quiz-logo" src="/SARK-LOGO.png" alt="SARK" width={220} height={180} priority />
      </header>

      <section className="quiz-auth-shell">
        <div className="quiz-auth-hero">
          <div className="quiz-auth-hero__badge">
            <ShieldCheck />
            Technical screening
          </div>
          <h1>Enter the SARK quiz grid.</h1>
          <p>
            Verify your identity, lock your attempt, and start the timed screening with your result tied to your
            registered profile.
          </p>
        </div>

        <form className="quiz-auth-card" onSubmit={submitAuth}>
          <div className="quiz-auth-switch" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === "login" ? "is-active" : ""}
              onClick={() => {
                setMode("login");
                setMessage(null);
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === "signup" ? "is-active" : ""}
              onClick={() => {
                setMode("signup");
                setMessage(null);
              }}
            >
              Sign up
            </button>
          </div>

          <div className="quiz-auth-card__title">
            <LockKeyhole />
            <div>
              <p>{mode === "login" ? "Returning candidate" : "New candidate"}</p>
              <h2>{mode === "login" ? "Unlock your attempt" : "Create quiz profile"}</h2>
            </div>
          </div>

          <div className="quiz-auth-fields">
            {mode === "signup" ? (
              signupFields.map((field) => (
                <label key={field.name}>
                  <span>{field.label}</span>
                  <SmoothInput
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    required
                    minLength={field.name === "password" ? 8 : undefined}
                  />
                </label>
              ))
            ) : (
              <>
                <label>
                  <span>Email</span>
                  <div className="quiz-auth-input">
                    <Mail />
                    <SmoothInput name="email" type="email" autoComplete="email" required />
                  </div>
                </label>
                <label>
                  <span>Password</span>
                  <div className="quiz-auth-input">
                    <LockKeyhole />
                    <SmoothInput name="password" type="password" autoComplete="current-password" required />
                  </div>
                </label>
              </>
            )}
          </div>

          {message ? <p className="quiz-auth-error">{message}</p> : null}

          <button type="submit" className="quiz-primary-button quiz-auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Checking" : mode === "login" ? "Login and start" : "Create account"}
            <ArrowRight />
          </button>
        </form>
      </section>
    </main>
  );
}
