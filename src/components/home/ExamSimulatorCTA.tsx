"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { scoreGradientCss, scoreToColor } from "@/lib/exam";

export function ExamSimulatorCTA() {
  const theme = useResolvedTheme();
  const gradient = scoreGradientCss(theme);
  const sampleScore = 7.25;
  const sampleColor = scoreToColor(sampleScore, theme);

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <Link
          href="/simulator"
          className="group relative block overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-all duration-300 hover:border-[var(--color-accent)] animate-slide-up"
        >
          {/* Atmospheric glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 20% 0%, var(--color-accent), transparent 60%), radial-gradient(ellipse 50% 50% at 80% 100%, var(--color-correct), transparent 60%)",
              opacity: 0.07,
            }}
            aria-hidden="true"
          />

          <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 sm:gap-8 p-5 sm:p-8 items-center">
            {/* Left: copy */}
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" aria-hidden="true" />
                Nou
              </div>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] leading-[1.1] mb-3"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                Simulator <span className="text-[var(--color-accent)]">Examen</span>
                <br className="hidden sm:inline" />
                <span className="sm:hidden"> </span>
                Licență
              </h2>

              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-md mb-5">
                36 grile balansate, sistem oficial de notare (1p din oficiu + 0.25p / corect),
                notă pe scala 1-10. Vezi cum stai.
              </p>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold text-sm transition-all duration-200 group-hover:bg-[var(--color-accent-hover)] group-hover:shadow-[0_0_30px_rgba(232,166,49,0.25)] group-active:scale-[0.98]"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
              >
                Pornește Simulatorul
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>

            {/* Right: sample score visual */}
            <div className="relative flex-shrink-0 self-stretch flex items-center justify-center md:min-w-[200px]">
              <div className="relative w-full max-w-[200px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 transition-all duration-300 group-hover:border-[var(--color-border-strong)]">
                {/* Score */}
                <div className="text-center mb-3">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Nota ta
                  </span>
                  <div className="mt-1 flex items-baseline justify-center gap-1">
                    <span
                      className="text-4xl sm:text-5xl font-extrabold leading-none tabular-nums transition-colors"
                      style={{
                        fontFamily: "var(--font-display)",
                        letterSpacing: "-0.03em",
                        color: sampleColor,
                        textShadow: `0 0 20px ${sampleColor}50`,
                      }}
                    >
                      {sampleScore.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-[var(--color-text-tertiary)]">/10</span>
                  </div>
                </div>

                {/* Gradient bar */}
                <div className="relative">
                  <div
                    className="h-1.5 rounded-full overflow-hidden border border-[var(--color-border)]"
                    style={{ background: gradient }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute -top-0.5 w-2 h-2 rounded-full"
                    style={{
                      left: `${((sampleScore - 1) / 9) * 100}%`,
                      transform: "translate(-50%, -50%)",
                      background: sampleColor,
                      boxShadow: `0 0 0 2px var(--color-bg-primary), 0 0 8px ${sampleColor}AA`,
                    }}
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-2 flex justify-between text-[9px] font-mono text-[var(--color-text-tertiary)] tabular-nums">
                  <span>1.00</span>
                  <span>10.00</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </Container>
    </section>
  );
}
