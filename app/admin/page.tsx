import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BarChart3, LayoutDashboard, ListChecks, Trophy } from "lucide-react";

import { ClearLeaderboardButton } from "@/components/admin/ClearLeaderboardButton";
import { QuizPanel } from "@/components/admin/QuizPanel";
import { getAdminSession } from "@/lib/auth/admin-session";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import { listQuizzes, listQuizSummaries } from "@/lib/quiz/db";

export const metadata: Metadata = {
  title: "Admin",
  description: "SARK quiz admin dashboard.",
};

type LeaderboardUser = {
  name: string;
  usn: string;
  email: string;
  phone: string;
  quizName: string;
  score: number;
  timetaken: number;
};

function formatTime(seconds: number | null) {
  if (seconds === null) {
    return "Pending";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

type AdminPageProps = {
  searchParams: Promise<{ panel?: string; quizId?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { panel, quizId } = await searchParams;
  const activePanel = panel === "quiz" ? "quiz" : "leaderboard";
  const hasSelectedQuizParam = Boolean(quizId);
  const fullQuizzes = activePanel === "quiz" ? await listQuizzes() : [];
  const quizSummaries = activePanel === "leaderboard" ? await listQuizSummaries() : fullQuizzes;
  const selectedQuiz = quizSummaries.find((quiz) => quiz.id === quizId) ?? quizSummaries.find((quiz) => quiz.isActive) ?? quizSummaries[0];
  let leaderboard: LeaderboardUser[] = [];

  if (activePanel === "leaderboard" && selectedQuiz) {
    const db = getSupabaseAdmin();
    const { data: selectedSubmissions } = await db
      .from("quiz_submissions")
      .select("*")
      .eq("quiz_id", selectedQuiz.id)
      .order("score", { ascending: false })
      .order("timetaken", { ascending: true });

    if (selectedSubmissions && selectedSubmissions.length > 0) {
      const userIds = selectedSubmissions.map((submission) => submission.user_id);
      
      const { data: leaderboardUsers } = await db
        .from("quiz_users")
        .select("*")
        .in("id", userIds);

      const usersById = new Map((leaderboardUsers || []).map((user) => [user.id, user]));

      leaderboard = selectedSubmissions
        .map((submission) => {
          const user = usersById.get(submission.user_id);

          return user
            ? {
                name: user.name,
                usn: user.usn,
                email: user.email,
                phone: user.phone,
                quizName: submission.quiz_name,
                score: submission.score,
                timetaken: submission.timetaken,
              }
            : null;
        })
        .filter((user): user is LeaderboardUser => user !== null);
    }
  }

  const serializedQuizzes =
    activePanel === "quiz"
      ? fullQuizzes.map((quiz) => ({
          id: quiz.id,
          name: quiz.name,
          config: quiz.config,
          questions: quiz.questions,
          resultInvite: quiz.resultInvite,
          isActive: quiz.isActive,
        }))
      : [];

  const topScore = leaderboard[0]?.score ?? 0;
  const fastest = leaderboard.reduce<number | null>((best, user) => {
    if (user.timetaken === null) {
      return best;
    }

    return best === null ? user.timetaken : Math.min(best, user.timetaken);
  }, null);

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <Image className="quiz-logo" src="/SARK-LOGO.png" alt="SARK" width={220} height={80} priority />
        <nav aria-label="Admin navigation">
          <a className={activePanel === "quiz" ? "is-active" : ""} href="/admin?panel=quiz">
            <ListChecks />
            Quiz panel
          </a>
          <a className={activePanel === "leaderboard" ? "is-active" : ""} href="/admin?panel=leaderboard">
            <Trophy />
            Leaderboard
          </a>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-content__header">
          <div>
            <p>Admin dashboard</p>
            <h1>{activePanel === "quiz" ? "Quiz panel" : "Leaderboard"}</h1>
            <span>
              {activePanel === "quiz"
                ? "Create, edit, delete, and activate database-backed quizzes."
                : "Ranked by score first, then by lower time taken for ties."}
            </span>
          </div>
          <LayoutDashboard />
        </header>

        {activePanel === "quiz" ? <QuizPanel initialQuizzes={serializedQuizzes} /> : null}

        {activePanel === "leaderboard" ? (
          <>
            <div className="admin-metrics">
              <div>
                <span>Submitted</span>
                <strong>{leaderboard.length}</strong>
              </div>
              <div>
                <span>Top score</span>
                <strong>{topScore}%</strong>
              </div>
              <div>
                <span>Fastest time</span>
                <strong>{formatTime(fastest)}</strong>
              </div>
            </div>

            <div className="admin-table-wrap">
              <div className="admin-table-title">
                <BarChart3 />
                <h2>Quiz submissions</h2>
                <form className="admin-leaderboard-filter">
                  <input type="hidden" name="panel" value="leaderboard" />
                  <select name="quizId" defaultValue={selectedQuiz?.id ?? ""}>
                    {quizSummaries.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.name}
                        {quiz.isActive ? " (active)" : ""}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="quiz-secondary-button">View</button>
                </form>
                {hasSelectedQuizParam && selectedQuiz ? (
                  <ClearLeaderboardButton quizId={selectedQuiz.id} quizName={selectedQuiz.name} />
                ) : null}
              </div>
              <table className="admin-leaderboard">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>USN</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Time taken</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length > 0 ? (
                    leaderboard.map((user, index) => (
                      <tr key={`${user.usn}-${user.email}`}>
                        <td>#{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.usn}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.quizName}</td>
                        <td>{user.score}%</td>
                        <td>{formatTime(user.timetaken)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8}>No quiz submissions yet for this quiz.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
