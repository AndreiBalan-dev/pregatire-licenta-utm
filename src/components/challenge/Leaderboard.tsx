"use client";

import type { Standing } from "@/lib/realtime/events";
import type { GraceState } from "@/hooks/usePresenceGrace";
import { PlayerAvatar } from "./PlayerAvatar";
import { formatClock } from "@/lib/challenge/timing";
import { computeScore } from "@/lib/exam";
import { cn } from "@/lib/utils";

export type ScoreMode = "points" | "nota";

// Gold / silver / bronze for ranks 1-3; everyone else gets the muted text colour.
const MEDAL = ["#FFD24A", "#C9D1DA", "#E0935A"];

export function Leaderboard({
  standings,
  meId,
  dense = false,
  showStats = false,
  scoreMode = "points",
  connection,
}: {
  standings: Standing[];
  meId?: number;
  dense?: boolean;
  /** Final-results mode: show correct count + completion time instead of the live progress bar. */
  showStats?: boolean;
  /** "nota" (Simulare) shows the 1-10 grade derived from the correct count; "points" shows raw Kahoot score. */
  scoreMode?: ScoreMode;
  /** Per-player connection state; disconnected players are greyed with a reconnect countdown. */
  connection?: Map<number, GraceState>;
}) {
  return (
    <ol className="space-y-1.5">
      {standings.map((s) => {
        const isMe = s.playerId === meId;
        const medal = s.rank <= 3 ? MEDAL[s.rank - 1] : null;
        const conn = connection?.get(s.playerId);
        const away = !!conn && !conn.connected;
        return (
          <li
            key={s.playerId}
            className={cn(
              "flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 rounded-[var(--radius-md)] border transition-colors",
              isMe
                ? "bg-[var(--color-accent-muted)] border-[var(--color-accent)]"
                : "bg-[var(--color-bg-secondary)] border-[var(--color-border)]",
            )}
          >
            <span
              className="w-5 sm:w-6 text-center font-bold tabular-nums flex-shrink-0 text-sm"
              style={{ fontFamily: "var(--font-display)", color: medal ?? "var(--color-text-tertiary)" }}
            >
              {s.rank}
            </span>
            {!dense && <PlayerAvatar name={s.name} size={30} className={cn(away && "opacity-40 grayscale")} />}
            <div className={cn("min-w-0 flex-1", away && "opacity-50")}>
              <div className="flex items-center gap-1.5">
                <span className={cn("text-sm font-medium truncate", isMe ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]")}>
                  {s.name}
                </span>
                {isMe && <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] flex-shrink-0">tu</span>}
                {conn && !conn.connected && (
                  <span
                    className="inline-flex items-center gap-1 flex-shrink-0 text-[10px] font-semibold"
                    style={{ color: conn.secondsLeft > 0 ? "var(--color-accent)" : "var(--color-wrong)" }}
                    title={conn.secondsLeft > 0 ? "Deconectat - are timp să revină" : "Deconectat"}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 1l22 22" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.58 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                    {conn.secondsLeft > 0 ? `revine ${conn.secondsLeft}s` : "deconectat"}
                  </span>
                )}
                {s.finished && <span className="flex-shrink-0" aria-label="A terminat" title="A terminat">🏁</span>}
              </div>
              {showStats ? (
                <div className="mt-0.5 flex items-center gap-2 text-[11px] tabular-nums text-[var(--color-text-tertiary)]">
                  <span>{s.correctCount}/{s.totalQuestions} corecte</span>
                  <span className="w-px h-2.5 bg-[var(--color-border)]" />
                  <span aria-label="Timp total">⏱ {formatClock(Math.round(s.totalTimeMs / 1000))}</span>
                </div>
              ) : (
                <div className="mt-1 h-1 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                  <div className="h-full rounded-full progress-bar-fill" style={{ width: `${Math.round(s.progress * 100)}%` }} />
                </div>
              )}
            </div>
            <span
              className={cn("text-base font-bold tabular-nums flex-shrink-0 text-[var(--color-text-primary)]", away && "opacity-50")}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {scoreMode === "nota" ? computeScore(s.correctCount).toFixed(2) : s.score}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
