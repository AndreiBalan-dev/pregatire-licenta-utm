// Pure timer + Kahoot-scoring math, shared by the answer/state routes and the
// runtime. No server-only imports so the client can reuse it.
import { CHALLENGE_TIMER } from "@/lib/constants";
import type { TimerConfig } from "./types";

const DEFAULT_TIMER: TimerConfig = {
  mode: "total",
  totalSeconds: CHALLENGE_TIMER.TOTAL_DEFAULT_SECONDS,
  perQuestionSeconds: CHALLENGE_TIMER.PER_QUESTION_DEFAULT,
};

/** Read the timer from a (possibly older) config, falling back to the default
 *  so lobbies created before timers existed never crash. */
export function getTimer(config: { timer?: TimerConfig } | null | undefined): TimerConfig {
  return config?.timer ?? DEFAULT_TIMER;
}

/** Kahoot-style points: MAX_POINTS answered instantly, sliding to
 *  MIN_CORRECT_POINTS at the budget; 0 for a wrong or timed-out answer. */
export function answerPoints(correct: boolean, responseMs: number, budgetMs: number): number {
  if (!correct) return 0;
  const span = CHALLENGE_TIMER.MAX_POINTS - CHALLENGE_TIMER.MIN_CORRECT_POINTS;
  const ratio = Math.min(1, Math.max(0, responseMs / Math.max(1, budgetMs)));
  return Math.round((CHALLENGE_TIMER.MAX_POINTS - span * ratio) / 10) * 10;
}

/** Per-question time budget used for scoring (ms). */
export function scoringBudgetMs(timer: TimerConfig): number {
  return timer.mode === "per_question"
    ? timer.perQuestionSeconds * 1000
    : CHALLENGE_TIMER.SCORE_REFERENCE_MS;
}

/** Absolute end time (ms epoch) for a total-timer game, or null otherwise. */
export function totalDeadlineMs(timer: TimerConfig, startedAt: Date | null): number | null {
  if (timer.mode !== "total" || !startedAt) return null;
  return startedAt.getTime() + timer.totalSeconds * 1000;
}

/** Seconds left on the total timer (>= 0), or null when there is no total timer. */
export function totalRemainingSeconds(timer: TimerConfig, startedAt: Date | null, now: number): number | null {
  const deadline = totalDeadlineMs(timer, startedAt);
  if (deadline === null) return null;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

/** Format a non-negative second count as "m:ss" (e.g. 65 -> "1:05", 9 -> "0:09"). */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, "0")}`;
}
