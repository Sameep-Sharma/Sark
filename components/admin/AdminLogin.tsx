"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";

type AdminAuthResponse = {
  ok: boolean;
  message?: string;
};

export function AdminLogin() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = (await response.json()) as AdminAuthResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to authenticate.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to authenticate.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel">
        <Image className="quiz-logo" src="/SARK-LOGO.png" alt="SARK" width={220} height={80} priority />
        <div>
          <p>Admin access</p>
          <h1>Quiz control room</h1>
          <span>Authenticate to view the leaderboard and submission metrics.</span>
        </div>

        <form className="admin-login-form" onSubmit={submitLogin}>
          <label>
            <span>Username</span>
            <div>
              <UserRound />
              <input name="username" type="text" autoComplete="username" required />
            </div>
          </label>
          <label>
            <span>Password</span>
            <div>
              <LockKeyhole />
              <input name="password" type="password" autoComplete="current-password" required />
            </div>
          </label>

          {message ? <p>{message}</p> : null}

          <button type="submit" className="quiz-primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Verifying" : "Enter dashboard"}
            <ArrowRight />
          </button>
        </form>
      </section>
    </main>
  );
}
