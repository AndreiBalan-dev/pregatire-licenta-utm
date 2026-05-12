"use client";

import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { ExamRepeatBadge } from "@/components/exam/ExamRepeatBadge";
import {
  EXAM_MAX_SCORE,
  EXAM_MIN_SCORE,
  OFFICIO_POINTS,
  scoreGradientCss,
  scorePositionPct,
  scoreToColor,
} from "@/lib/exam";

interface ExamScoreProps {
  score: number;
  correctCount: number;
  total: number;
  durationMs: number | null;
  isRepeat?: boolean;
  repeatShuffled?: boolean;
}

function formatDuration(ms: number | null): string {
  if (!ms) return "-";
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  if (hours > 0) return `${hours}h ${min}m`;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
}

export function ExamScore({ score, correctCount, total, durationMs, isRepeat, repeatShuffled }: ExamScoreProps) {
  const theme = useResolvedTheme();
  const color = scoreToColor(score, theme);
  const positionPct = scorePositionPct(score);
  const gradient = scoreGradientCss(theme);
  const displayScore = score.toFixed(2);

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      {/* Ambient glow matching the score color */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 75% 60% at 50% 30%, ${color}, transparent 70%)`,
          opacity: 0.13,
        }}
      />

      <div className="relative px-6 py-10 sm:py-14 text-center">
        {/* Repeat badge */}
        {isRepeat && (
          <div className="flex justify-center mb-3">
            <ExamRepeatBadge shuffled={repeatShuffled} />
          </div>
        )}

        {/* Eyebrow label */}
        <span
          className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-text-tertiary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Nota finală
        </span>

        {/* The big score */}
        <div className="mt-4 sm:mt-5 flex items-baseline justify-center gap-1.5">
          <span
            className="leading-none tabular-nums transition-colors duration-700"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(80px, 18vw, 168px)",
              letterSpacing: "-0.04em",
              color,
              textShadow: `0 0 40px ${color}55`,
            }}
          >
            {displayScore}
          </span>
          <span
            className="text-2xl sm:text-3xl font-bold text-[var(--color-text-tertiary)] tabular-nums"
            style={{ fontFamily: "var(--font-display)" }}
          >
            / 10
          </span>
        </div>

        {/* Gradient bar */}
        <div className="relative mt-8 sm:mt-10 mx-auto max-w-xs sm:max-w-md">
          <div
            className="h-2.5 rounded-full overflow-hidden border border-[var(--color-border)]"
            style={{ background: gradient }}
            aria-hidden="true"
          />
          {/* Marker triangle pointing up to score */}
          <div
            className="absolute -top-1 transition-all duration-700"
            style={{
              left: `${positionPct}%`,
              transform: "translate(-50%, -100%)",
            }}
            aria-hidden="true"
          >
            <div
              className="w-0 h-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `8px solid ${color}`,
                filter: `drop-shadow(0 1px 4px ${color}AA)`,
              }}
            />
          </div>
          {/* Scale endpoints */}
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-tertiary)] tabular-nums">
            <span>{EXAM_MIN_SCORE.toFixed(2)}</span>
            <span>{EXAM_MAX_SCORE.toFixed(2)}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-correct)]" aria-hidden="true" />
            <span>
              <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">{correctCount}</span>
              <span className="text-[var(--color-text-tertiary)]">/</span>
              <span className="tabular-nums">{total}</span>
              <span className="ml-1">corecte</span>
            </span>
          </span>
          <span className="text-[var(--color-text-tertiary)] hidden sm:inline" aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-mono tabular-nums">{formatDuration(durationMs)}</span>
          </span>
          <span className="text-[var(--color-text-tertiary)] hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-[var(--color-text-tertiary)]">
            {OFFICIO_POINTS.toFixed(2)}p din oficiu
          </span>
        </div>
      </div>
    </div>
  );
}
