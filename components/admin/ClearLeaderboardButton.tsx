"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export function ClearLeaderboardButton({ quizId, quizName }: { quizId: string; quizName: string }) {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  async function clearLeaderboard() {
    if (!window.confirm(`Clear all leaderboard entries for "${quizName}"?`)) {
      return;
    }

    setIsClearing(true);

    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}/submissions`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Unable to clear leaderboard.");
      }

      router.refresh();
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <button type="button" className="admin-danger-action" onClick={() => void clearLeaderboard()} disabled={isClearing}>
      <Trash2 />
      {isClearing ? "Clearing" : "Delete all users"}
    </button>
  );
}
