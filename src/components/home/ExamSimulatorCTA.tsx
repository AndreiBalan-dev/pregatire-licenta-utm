"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import {
  EXAM_MAX_SCORE,
  EXAM_MIN_SCORE,
  scoreGradientCss,
  scorePositionPct,
  scoreToColor,
} from "@/lib/exam";

const DEMO_SCORES = [4.5, 6.25, 7.75, 9.25, 5.5, 8.5, 7.0, 6.0, 8.75, 5.25];
const DEMO_INTERVAL_MS = 2200;

export function ExamSimulatorCTA() {
  const theme = useResolvedTheme();
  const gradient = scoreGradientCss(theme);
  const [demoIdx, setDemoIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setDemoIdx((i) => (i + 1) % DEMO_SCORES.length);
    }, DEMO_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const demoScore = DEMO_SCORES[demoIdx];
  const demoColor = scoreToColor(demoScore, theme);
  const demoPos = scorePositionPct(demoScore);

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <Link
          href="/simulator"
          className="group relative block overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-all duration-300 hover:border-[var(--color-accent)] animate-slide-up"
        >
          {/* Live atmospheric glow — shifts with demo score color */}
          <div
            className="absolute inset-0 pointer-events-none transition-all"
            style={{
              background: `radial-gradient(ellipse 70% 50% at 20% 0%, var(--color-accent), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 100%, ${demoColor}, transparent 60%)`,
              opacity: 0.09,
              transitionDuration: `${DEMO_INTERVAL_MS}ms`,
              transitionTimingFunction: "ease-in-out",
            }}
            aria-hidden="true"
          />

          <div className="relative px-5 sm:px-8 py-6 sm:py-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" aria-hidden="true" />
              Nou
            </div>

            {/* Headline */}
            <h2
              className="text-2xl sm:text-3xl md:text-[2.5rem] font-extrabold text-[var(--color-text-primary)] leading-[1.05] mb-2.5 sm:mb-3"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}
            >
              Simulator <span className="text-[var(--color-accent)]">Examen Licență</span>
            </h2>

            {/* Tagline */}
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-md mb-5 sm:mb-6">
              36 de grile, sistem oficial de notare.
            </p>

            {/* CTA button */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold text-sm transition-all duration-200 group-hover:bg-[var(--color-accent-hover)] group-hover:shadow-[0_0_30px_rgba(232,166,49,0.3)] group-active:scale-[0.98]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
            >
              Pornește Simulatorul
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            {/* Live demo strip */}
            <div className="mt-7 sm:mt-8 pt-6 sm:pt-7 border-t border-[var(--color-border)]">
              {/* Label + cycling score */}
              <div className="flex items-baseline justify-between gap-3 mb-3.5">
                <span
                  className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Aici ai putea ajunge
                </span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span
                    className="text-2xl sm:text-3xl font-extrabold leading-none transition-colors duration-[1500ms] ease-in-out"
                    style={{
                      fontFamily: "var(--font-display)",
                      letterSpacing: "-0.03em",
                      color: demoColor,
                      textShadow: `0 0 20px ${demoColor}55`,
                    }}
                  >
                    {demoScore.toFixed(2)}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[var(--color-text-tertiary)]">/10</span>
                </div>
              </div>

              {/* Gradient bar with animated marker */}
              <div className="relative">
                <div
                  className="h-2 sm:h-2.5 rounded-full overflow-hidden border border-[var(--color-border)]"
                  style={{ background: gradient }}
                  aria-hidden="true"
                />
                <div
                  className="absolute top-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full"
                  style={{
                    left: `${demoPos}%`,
                    transform: "translate(-50%, -50%)",
                    background: demoColor,
                    boxShadow: `0 0 0 3px var(--color-bg-secondary), 0 0 12px ${demoColor}AA`,
                    transition: `left ${DEMO_INTERVAL_MS - 200}ms cubic-bezier(0.4, 0, 0.2, 1), background ${DEMO_INTERVAL_MS - 200}ms ease, box-shadow ${DEMO_INTERVAL_MS - 200}ms ease`,
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Scale endpoints */}
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-tertiary)] tabular-nums">
                <span>{EXAM_MIN_SCORE.toFixed(2)}</span>
                <span className="text-[var(--color-text-tertiary)]">scala 1 — 10</span>
                <span>{EXAM_MAX_SCORE.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Link>
      </Container>
    </section>
  );
}
