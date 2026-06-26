"use client";
import type { Standing } from "@/lib/realtime/events";

export function Leaderboard({ standings, meId }: { standings: Standing[]; meId?: number }) {
  return (
    <ol className="space-y-1.5">
      {standings.map((s) => (
        <li key={s.playerId}
          className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${s.playerId === meId ? "bg-[var(--color-accent-muted)] border border-[var(--color-accent)]" : "bg-[var(--color-bg-secondary)]"}`}>
          <span className="flex items-center gap-2 min-w-0">
            <span className="w-5 text-[var(--color-text-tertiary)]">{s.rank}</span>
            <span className="truncate">{s.name}</span>
            {s.finished && <span aria-hidden>🏁</span>}
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[var(--color-text-tertiary)] text-xs">{Math.round(s.progress * 100)}%</span>
            <span className="font-semibold tabular-nums">{s.score}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
