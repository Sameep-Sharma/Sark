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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
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
    <main className="admin-login-page relative z-[100] pointer-events-auto flex items-center justify-center min-h-screen">
      <section className="admin-login-panel relative z-[100] pointer-events-auto">
        <Image className="quiz-logo pointer-events-auto" src="/SARK-LOGO.png" alt="SARK" width={220} height={80} priority />
        <div>
          <p>Admin access</p>
          <h1>Quiz control room</h1>
          <span>Authenticate to view the leaderboard and submission metrics.</span>
        </div>

        <form className="admin-login-form pointer-events-auto" onSubmit={submitLogin}>
          <label className="pointer-events-auto block">
            <span>Username</span>
            <div className="relative flex items-center mt-1.5 pointer-events-auto">
              <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#ff6675] pointer-events-none z-20" />
              <input
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/15 border-l-2 border-l-[#e11d2e] rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#ff263a] focus:ring-2 focus:ring-[#e11d2e]/30 transition-all text-sm pointer-events-auto cursor-text relative z-10"
              />
            </div>
          </label>

          <label className="pointer-events-auto block">
            <span>Password</span>
            <div className="relative flex items-center mt-1.5 pointer-events-auto">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#ff6675] pointer-events-none z-20" />
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/15 border-l-2 border-l-[#e11d2e] rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#ff263a] focus:ring-2 focus:ring-[#e11d2e]/30 transition-all text-sm pointer-events-auto cursor-text relative z-10"
              />
            </div>
          </label>

          {message ? <p className="text-red-400 text-sm mt-1">{message}</p> : null}

          <button
            type="submit"
            className="quiz-primary-button w-full h-12 mt-2 rounded-lg bg-[#e11d2e] hover:bg-[#c91827] text-white font-bold flex items-center justify-center gap-2 transition-colors pointer-events-auto cursor-pointer relative z-10"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Enter dashboard"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>
    </main>
  );
}
