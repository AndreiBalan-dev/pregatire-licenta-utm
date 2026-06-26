import type { Standing } from "@/lib/realtime/events";

export interface PlayerRow {
  id: number;
  name: string;
  score: number;
  correctCount: number;
  answeredCount: number;
  totalTimeMs: number;
  finishedAt: string | null;
}

/** Sort players into ranked standings: score desc, then total time asc. Ties on
 *  both share a rank (standard competition ranking: 1,1,3). Output is ordered. */
export function rankPlayers(players: PlayerRow[], totalQuestions: number): Standing[] {
  const sorted = [...players].sort(
    (a, b) => b.score - a.score || a.totalTimeMs - b.totalTimeMs,
  );

  let lastKey = "";
  let lastRank = 0;
  return sorted.map((pl, i) => {
    const key = `${pl.score}:${pl.totalTimeMs}`;
    const rank = key === lastKey ? lastRank : i + 1;
    lastKey = key;
    lastRank = rank;
    return {
      playerId: pl.id,
      name: pl.name,
      score: pl.score,
      correctCount: pl.correctCount,
      answeredCount: pl.answeredCount,
      totalQuestions,
      progress: totalQuestions > 0 ? pl.answeredCount / totalQuestions : 0,
      finished: pl.finishedAt !== null,
      rank,
    };
  });
}
