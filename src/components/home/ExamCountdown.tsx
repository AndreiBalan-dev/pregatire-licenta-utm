"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { EXAM_PROBA1_START, EXAM_PROBA1_END } from "@/lib/site-config";

const START = new Date(EXAM_PROBA1_START).getTime();
const END = new Date(EXAM_PROBA1_END).getTime();

// Remembered client-side so a visitor who hides the countdown keeps it hidden on
// later visits too (it becomes moot once the exam passes).
const COUNTDOWN_HIDDEN_KEY = "utm-exam-countdown-hidden";

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function remainingFrom(now: number): Remaining | null {
  const ms = START - now;
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

const pad = (n: number) => n.toString().padStart(2, "0");

function unitLabel(value: number, plural: string, singular: string) {
  return value === 1 ? singular : plural;
}

/**
 * Live countdown to Proba 1 (proba scrisa) of the licenta exam, on the homepage.
 * Day-dominant scale with hairline dividers (not the boxed four-tile template);
 * the seconds tile is gold to read as the live element. Renders a stable
 * placeholder until mounted to avoid a hydration mismatch and layout shift.
 */
export function ExamCountdown() {
  const [now, setNow] = useState<number | null>(null);
  // This component only ever renders client-side (the homepage gates on a loaded
  // session), so reading localStorage in the initializer is safe and avoids a
  // flash of the countdown for visitors who already hid it.
  const [hidden, setHidden] = useState<boolean>(() => {
    try { return localStorage.getItem(COUNTDOWN_HIDDEN_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    setNow(Date.now()); // eslint-disable-line react-hooks/set-state-in-effect -- seed the live clock on mount (post-hydration) so the first paint is a stable placeholder
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem(COUNTDOWN_HIDDEN_KEY, "1"); } catch { /* ignore storage errors */ }
  };

  if (hidden) return null;

  const remaining = now === null ? undefined : remainingFrom(now);
  const inProgress = now !== null && now >= START && now < END;
  const isOver = now !== null && now >= END;

  const tiles: { value: number | null; label: string }[] = remaining
    ? [
        { value: remaining.days, label: unitLabel(remaining.days, "zile", "zi") },
        { value: remaining.hours, label: unitLabel(remaining.hours, "ore", "oră") },
        { value: remaining.minutes, label: "min" },
        { value: remaining.seconds, label: "sec" },
      ]
    : [
        { value: null, label: "zile" },
        { value: null, label: "ore" },
        { value: null, label: "min" },
        { value: null, label: "sec" },
      ];

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] animate-slide-up">
          {/* Top-center gold glow + faint grid, consistent with the site's surfaces */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 70% 85% at 50% -15%, var(--color-accent), transparent 60%)",
              opacity: 0.09,
            }}
          />
          <div aria-hidden="true" className="absolute inset-0 grid-pattern opacity-30" />

          {/* Dismiss: hide the countdown (remembered) until the exam, for anyone it distracts. */}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Ascunde numărătoarea până la examen"
            title="Ascunde numărătoarea"
            className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="relative p-5 sm:p-8">
            {/* Eyebrow: live status dot + which probe this is */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-5 sm:mb-6 pr-8">
              <div className="inline-flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                </span>
                <span
                  className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Proba 1 · Proba scrisă
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)] uppercase tracking-[0.15em]">
                Examen de licență
              </span>
            </div>

            {isOver ? (
              <p
                className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
              >
                Proba scrisă s-a încheiat. Mult succes la susținerea lucrării!
              </p>
            ) : inProgress ? (
              <p
                className="text-2xl sm:text-3xl font-extrabold text-[var(--color-accent)] leading-tight"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
              >
                Proba scrisă este în desfășurare. Mult succes!
              </p>
            ) : (
              <>
                <h2
                  className="text-lg sm:text-2xl font-extrabold text-[var(--color-text-primary)] mb-5 sm:mb-7 leading-tight"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
                >
                  Timp rămas până la proba scrisă
                </h2>

                <div className="flex items-stretch">
                  {tiles.map((tile, i) => (
                    <div key={tile.label} className="flex items-stretch flex-1 sm:flex-none">
                      {i > 0 && (
                        <div
                          aria-hidden="true"
                          className="w-px self-stretch mx-1.5 sm:mx-5 bg-gradient-to-b from-transparent via-[var(--color-border-strong)] to-transparent"
                        />
                      )}
                      <div className="flex flex-col items-center sm:items-start min-w-[58px] sm:min-w-[92px]">
                        <span
                          className={
                            "tabular-nums font-extrabold leading-none text-[2.75rem] sm:text-7xl " +
                            (tile.label === "sec"
                              ? "text-[var(--color-accent)]"
                              : "text-[var(--color-text-primary)]")
                          }
                          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}
                        >
                          {tile.value === null ? "--" : tile.label === "zile" || tile.label === "zi" ? tile.value : pad(tile.value)}
                        </span>
                        <span className="mt-2 sm:mt-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
                          {tile.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Schedule footer: exact date, time window, and what the probe covers */}
            <div className="mt-6 sm:mt-8 pt-5 border-t border-[var(--color-border)] flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13px] sm:text-sm text-[var(--color-text-secondary)]">
              <span className="inline-flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="font-semibold text-[var(--color-text-primary)]">Marți, 30 Iunie 2026</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="tabular-nums">09:00–11:00</span>
              </span>
              <span className="text-[var(--color-text-tertiary)] basis-full sm:basis-auto">
                Evaluarea cunoștințelor fundamentale și de specialitate
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
