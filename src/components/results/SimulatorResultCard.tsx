"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { ExamRepeatBadge } from "@/components/exam/ExamRepeatBadge";
import { modules } from "@/data/modules";
import {
  EXAM_TOTAL_QUESTIONS,
  scoreGradientCss,
  scorePositionPct,
  scoreToColor,
} from "@/lib/exam";
import type { ExamState } from "@/lib/session-types";

interface ExamSummary {
  score: number;
  correctCount: number;
  total: number;
  durationMs: number | null;
  perModule: Record<string, { correct: number; total: number }>;
}

interface SimulatorResultCardProps {
  exam: ExamState | null;
  summary: ExamSummary | null;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "acum câteva secunde";
  if (min < 60) return `acum ${min} ${min === 1 ? "minut" : "minute"}`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `acum ${hours} ${hours === 1 ? "oră" : "ore"}`;
  const days = Math.floor(hours / 24);
  return `acum ${days} ${days === 1 ? "zi" : "zile"}`;
}

function formatDuration(ms: number | null): string {
  if (!ms || ms <= 0) return "-";
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  if (hours > 0) return `${hours}h ${min}m`;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
}

type InsightTone = "success" | "info" | "warning";

interface Insight {
  tone: InsightTone;
  text: ReactNode;
}

interface ModuleStat {
  mod: { id: string; name: string; color: string };
  correct: number;
  total: number;
  pct: number;
}

function buildInsight(moduleStats: ModuleStat[], totalCorrect: number, total: number): Insight | null {
  if (moduleStats.length === 0 || total === 0) return null;

  // PERFECT: all correct
  if (totalCorrect === total) {
    return { tone: "success", text: <>Toate cele {total} corecte. Performanță maximă!</> };
  }

  // ZERO: nothing correct
  if (totalCorrect === 0) {
    return {
      tone: "warning",
      text: <>Niciun răspuns corect de data asta. Începe cu Practică pe orice modul ca să prinzi conceptele - primul examen e mereu cel mai greu.</>,
    };
  }

  const sorted = [...moduleStats].sort((a, b) => b.pct - a.pct);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // SINGLE MODULE: no comparison possible
  if (moduleStats.length === 1) {
    return {
      tone: best.pct === 100 ? "success" : "info",
      text: <>{best.correct} din {best.total} la <span className="font-semibold" style={{ color: best.mod.color }}>{best.mod.name}</span>.</>,
    };
  }

  // ALL TIED at same pct
  if (best.pct === worst.pct) {
    if (best.pct === 100) {
      return { tone: "success", text: <>Toate modulele la maximum. Felicitări!</> };
    }
    return {
      tone: "info",
      text: <>Stat egal pe toate modulele ({Math.round(best.pct)}%). Continuă cu Practică pe materiile preferate.</>,
    };
  }

  const overallPct = (totalCorrect / total) * 100;
  const variance = best.pct - worst.pct;

  // LOW OVERALL (under 25%): focus on what to study, not what's "best"
  if (overallPct < 25) {
    if (worst.pct === 0) {
      return {
        tone: "warning",
        text: <>Multe greșeli per total. Începe cu <span className="font-semibold" style={{ color: worst.mod.color }}>{worst.mod.name}</span> - n-ai răspuns corect la nimic acolo.</>,
      };
    }
    return {
      tone: "warning",
      text: <>Cele mai multe greșeli la <span className="font-semibold" style={{ color: worst.mod.color }}>{worst.mod.name}</span>. Începe practica de acolo.</>,
    };
  }

  // BALANCED: small variance (<15 pp) - no clear weak point
  if (variance < 15) {
    return {
      tone: "info",
      text: <>Stat echilibrat - între {Math.round(worst.pct)}% și {Math.round(best.pct)}% pe module. Exersează puțin la toate.</>,
    };
  }

  // VERY HIGH (>= 90%): celebrate but suggest the finishing touch
  if (overallPct >= 90) {
    return {
      tone: "success",
      text: <>Aproape perfect! Mai exersează <span className="font-semibold" style={{ color: worst.mod.color }}>{worst.mod.name}</span> ca să prinzi maximul.</>,
    };
  }

  // WORST AT 0%: emphasize that module as priority
  if (worst.pct === 0) {
    return {
      tone: "warning",
      text: <>Bun la <span className="font-semibold" style={{ color: best.mod.color }}>{best.mod.name}</span>. La <span className="font-semibold" style={{ color: worst.mod.color }}>{worst.mod.name}</span> n-ai răspuns corect la nimic - e prima prioritate.</>,
    };
  }

  // NORMAL: best vs worst with clear gap
  return {
    tone: "info",
    text: <>Cel mai bine la <span className="font-semibold" style={{ color: best.mod.color }}>{best.mod.name}</span>. Pentru cea mai mare creștere de punctaj, concentrează-te pe <span className="font-semibold" style={{ color: worst.mod.color }}>{worst.mod.name}</span>.</>,
  };
}

export function SimulatorResultCard({ exam, summary }: SimulatorResultCardProps) {
  const theme = useResolvedTheme();

  // === Empty state: no exam at all ===
  if (!exam) {
    return (
      <Link
        href="/simulator"
        className="group relative block overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-all duration-200 hover:border-[var(--color-accent)] hover:shadow-[0_0_28px_rgba(232,166,49,0.1)]"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 0% 50%, var(--color-accent), transparent 60%)",
            opacity: 0.07,
          }}
          aria-hidden="true"
        />
        <div className="relative p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Visual mini-gradient hint */}
          <div className="flex-shrink-0 w-full sm:w-32">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-accent)] block mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Simulator
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-tertiary)] tabular-nums"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                ?.??
              </span>
              <span className="text-sm font-bold text-[var(--color-text-tertiary)]">/10</span>
            </div>
            <div className="mt-2 relative">
              <div
                className="h-1.5 rounded-full overflow-hidden border border-[var(--color-border)] opacity-40"
                style={{ background: scoreGradientCss(theme) }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Text + CTA */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-1.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Curios cât ai lua la examen?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4 max-w-md">
              Dă un simulator complet - {EXAM_TOTAL_QUESTIONS} de grile, balansate ca la examenul real, și află nota ta pe scala 1-10.
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-bold text-sm transition-all duration-200 group-hover:bg-[var(--color-accent-hover)] group-hover:shadow-[0_0_22px_rgba(232,166,49,0.3)]" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}>
              Pornește Simulatorul
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  const isActive = exam.submittedAt === null;
  const isSubmitted = exam.submittedAt !== null;

  // === Active state: exam in progress ===
  if (isActive) {
    const answeredCount = Object.keys(exam.answers).length;
    const progressPct = (answeredCount / EXAM_TOTAL_QUESTIONS) * 100;
    return (
      <Link
        href={`/simulator/${exam.examId}`}
        className="group relative block overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-bg-secondary)] transition-all duration-200"
        style={{ borderColor: "rgba(232, 166, 49, 0.4)", borderWidth: 1, borderStyle: "solid" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 0%, var(--color-accent), transparent 60%)",
            opacity: 0.1,
          }}
          aria-hidden="true"
        />
        <div className="relative p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>
              Simulator în progres
            </span>
            {exam.isRepeat && <ExamRepeatBadge size="sm" shuffled={exam.repeatShuffled} />}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Continuă examenul de unde ai rămas
          </h3>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)] tabular-nums" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              {answeredCount}
            </span>
            <span className="text-sm sm:text-base text-[var(--color-text-tertiary)] tabular-nums">/{EXAM_TOTAL_QUESTIONS} răspunse</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))",
                boxShadow: progressPct > 0 ? "0 0 12px rgba(232, 166, 49, 0.25)" : undefined,
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap text-xs sm:text-sm">
            <span className="text-[var(--color-text-tertiary)]">început {timeAgo(exam.startedAt)}</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--color-accent)] group-hover:gap-2 transition-all" style={{ fontFamily: "var(--font-display)" }}>
              Continuă
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // === Submitted state: full stats dashboard ===
  if (isSubmitted && summary) {
    const color = scoreToColor(summary.score, theme);

    // Find best and worst modules
    const moduleStats = modules
      .map((mod) => {
        const s = summary.perModule[mod.id] || { correct: 0, total: 0 };
        const pct = s.total > 0 ? (s.correct / s.total) * 100 : 0;
        return { mod, ...s, pct };
      })
      .filter((m) => m.total > 0);

    const insight = buildInsight(moduleStats, summary.correctCount, summary.total);
    const insightColor =
      insight?.tone === "success"
        ? "var(--color-correct)"
        : insight?.tone === "warning"
          ? "var(--color-wrong)"
          : "var(--color-accent)";
    const insightBg =
      insight?.tone === "success"
        ? "var(--color-correct-bg)"
        : insight?.tone === "warning"
          ? "var(--color-wrong-bg)"
          : "var(--color-bg-primary)";
    const insightBorder =
      insight?.tone === "success"
        ? "var(--color-correct-border)"
        : insight?.tone === "warning"
          ? "var(--color-wrong-border)"
          : "var(--color-border)";

    return (
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${color}, transparent 60%)`,
            opacity: 0.1,
          }}
          aria-hidden="true"
        />

        <div className="relative p-5 sm:p-6">
          {/* Top: label + date + repeat badge */}
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ultimul Simulator
              </span>
              {exam.isRepeat && <ExamRepeatBadge size="sm" shuffled={exam.repeatShuffled} />}
            </div>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {timeAgo(exam.submittedAt!)}
            </span>
          </div>

          {/* Score + gradient bar */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-5 sm:mb-6">
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-5xl sm:text-6xl font-extrabold leading-none tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.03em",
                  color,
                  textShadow: `0 0 28px ${color}55`,
                }}
              >
                {summary.score.toFixed(2)}
              </span>
              <span className="text-lg sm:text-xl font-bold text-[var(--color-text-tertiary)]">/10</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="relative">
                <div
                  className="h-2 rounded-full overflow-hidden border border-[var(--color-border)]"
                  style={{ background: scoreGradientCss(theme) }}
                  aria-hidden="true"
                />
                <div
                  className="absolute top-1/2 w-3.5 h-3.5 rounded-full"
                  style={{
                    left: `${scorePositionPct(summary.score)}%`,
                    transform: "translate(-50%, -50%)",
                    background: color,
                    boxShadow: `0 0 0 2px var(--color-bg-secondary), 0 0 10px ${color}AA`,
                  }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-mono text-[var(--color-text-tertiary)] tabular-nums">
                <span>1.00</span>
                <span>10.00</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
            <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-correct)]" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Corecte</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                {summary.correctCount}
                <span className="text-sm text-[var(--color-text-tertiary)] font-normal">/{summary.total}</span>
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Timp</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] font-mono tabular-nums">
                {formatDuration(summary.durationMs)}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Acuratețe</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                {summary.total > 0 ? Math.round((summary.correctCount / summary.total) * 100) : 0}
                <span className="text-sm text-[var(--color-text-tertiary)] font-normal">%</span>
              </div>
            </div>
          </div>

          {/* Per-module mini bars */}
          {moduleStats.length > 0 && (
            <div className="mb-5 sm:mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] mb-2.5 block" style={{ fontFamily: "var(--font-display)" }}>
                Cum ai stat pe module
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {moduleStats.map((m) => (
                  <div key={m.mod.id} className="rounded-[var(--radius-md)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
                      <span
                        className="w-1 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: m.mod.color }}
                        aria-hidden="true"
                      />
                      <span className="text-[10px] sm:text-[11px] font-medium text-[var(--color-text-secondary)] truncate">
                        {m.mod.name}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-1 mb-1.5">
                      <span className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                        {m.correct}<span className="text-[var(--color-text-tertiary)] font-normal">/{m.total}</span>
                      </span>
                      <span
                        className="text-[10px] font-semibold tabular-nums"
                        style={{
                          color: m.pct >= 70 ? "var(--color-correct)" : m.pct >= 40 ? "var(--color-accent)" : "var(--color-wrong)",
                        }}
                      >
                        {Math.round(m.pct)}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${m.pct}%`,
                          background: m.mod.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insight callout - context-aware */}
          {insight && (
            <div
              className="flex items-start gap-2 mb-4 sm:mb-5 px-3 py-2.5 rounded-[var(--radius-md)] border"
              style={{ background: insightBg, borderColor: insightBorder }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={insightColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                {insight.tone === "success" ? (
                  <>
                    <polyline points="20 6 9 17 4 12" />
                  </>
                ) : insight.tone === "warning" ? (
                  <>
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  </>
                ) : (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </>
                )}
              </svg>
              <p className="text-[11px] sm:text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {insight.text}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link
              href={`/simulator/${exam.examId}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold text-sm transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_22px_rgba(232,166,49,0.25)] active:scale-[0.97]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
            >
              Vezi review complet
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </Link>
            <Link
              href="/simulator"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)] font-medium text-sm transition-all duration-200 active:scale-[0.97]"
            >
              Mai dă unul
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
