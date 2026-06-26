"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Leaderboard } from "./Leaderboard";
import { PlayerAvatar } from "./PlayerAvatar";
import { Confetti } from "./Confetti";
import { SoundToggle } from "./SoundToggle";
import { useProvocareSound } from "@/hooks/useProvocareSound";
import { formatClock } from "@/lib/challenge/timing";
import type { Standing } from "@/lib/realtime/events";
import { cn } from "@/lib/utils";

const PODIUM_HEIGHT: Record<number, string> = {
  1: "h-28 sm:h-32",
  2: "h-20 sm:h-24",
  3: "h-16 sm:h-20",
};

export function ResultsScreen({ standings, meId }: { standings: Standing[]; meId?: number }) {
  const { play } = useProvocareSound();
  const winner = standings[0];
  const me = standings.find((s) => s.playerId === meId);
  const iWon = !!me && me.rank === 1;

  useEffect(() => {
    play(iWon ? "win" : "finish");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Classic podium ordering: 2nd, 1st, 3rd.
  const top3 = standings.slice(0, 3);
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean) as Standing[];

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
      {iWon && <Confetti />}
      <div className="relative max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>
            Final
          </span>
          <SoundToggle />
        </div>

        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          {iWon ? "Ai câștigat!" : me ? `Locul ${me.rank}` : "Rezultate finale"}
        </h1>
        {winner && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-8">
            Câștigător: <span className="text-[var(--color-accent)] font-semibold">{winner.name}</span> cu {winner.score} {winner.score === 1 ? "punct" : "puncte"}
            <span className="text-[var(--color-text-tertiary)]"> · {winner.correctCount}/{winner.totalQuestions} corecte · {formatClock(Math.round(winner.totalTimeMs / 1000))}</span>
          </p>
        )}

        {podium.length > 0 && (
          <div className="flex items-end justify-center gap-2 sm:gap-3 mb-8">
            {podium.map((s) => (
              <div key={s.playerId} className="flex flex-col items-center flex-1 max-w-[120px]">
                <PlayerAvatar name={s.name} size={s.rank === 1 ? 56 : 44} className={s.rank === 1 ? "animate-roster-pop" : ""} />
                <span className="mt-2 text-xs font-medium text-[var(--color-text-primary)] truncate max-w-full">{s.name}</span>
                <span className="text-sm font-bold tabular-nums text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>{s.score}</span>
                <span className="text-[10px] tabular-nums text-[var(--color-text-tertiary)]">⏱ {formatClock(Math.round(s.totalTimeMs / 1000))}</span>
                <div
                  className={cn("w-full mt-2 rounded-t-[var(--radius-md)] border border-b-0 border-[var(--color-border)] animate-podium-rise flex items-start justify-center pt-1.5", PODIUM_HEIGHT[s.rank])}
                  style={{ background: s.rank === 1 ? "linear-gradient(180deg, var(--color-accent-muted), transparent)" : "var(--color-bg-secondary)" }}
                >
                  <span className="text-lg font-extrabold" style={{ fontFamily: "var(--font-display)", color: s.rank === 1 ? "var(--color-accent)" : "var(--color-text-tertiary)" }}>{s.rank}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8">
          <Leaderboard standings={standings} meId={meId} showStats />
        </div>

        <div className="flex gap-3">
          <Link
            href="/provocare"
            className="flex-1 text-center px-5 py-3 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold transition-colors hover:bg-[var(--color-accent-hover)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Provocare nouă
          </Link>
          <Link
            href="/"
            className="flex-1 text-center px-5 py-3 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium transition-colors hover:bg-[var(--color-bg-hover)]"
          >
            Acasă
          </Link>
        </div>
      </div>
    </main>
  );
}
