"use client";

import { Container } from "@/components/layout/Container";

export function CVHivePromo() {
  return (
    <section className="py-6 sm:py-8">
      <Container>
        <a
          href="https://cvhive.net"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all duration-300 animate-slide-up"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 90% 0%, var(--color-accent), transparent 60%)",
              opacity: 0.08,
            }}
            aria-hidden="true"
          />

          <div className="relative px-5 sm:px-8 py-6 sm:py-7">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse"
                aria-hidden="true"
              />
              Recomandare
            </div>

            <div className="flex items-start gap-4 sm:gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/figures/cvhive-mark.svg"
                alt=""
                aria-hidden="true"
                className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0"
              />

              <div className="min-w-0 flex-1">
                <h2
                  className="text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-[var(--color-text-primary)] leading-[1.1] mb-2"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
                >
                  Ai nevoie de un{" "}
                  <span className="text-[var(--color-accent)]">CV</span>?
                </h2>
                <p className="text-sm sm:text-[15px] text-[var(--color-text-secondary)] leading-relaxed mb-4 max-w-xl">
                  Un CV Enhancer cu AI care iti rescrie descrierile si iti da sfaturi
                  personalizate. Pentru internshipuri sau primul job, fara batai de cap.{" "}
                  <span className="text-[var(--color-text-tertiary)]">
                    Gratuit, fara card.
                  </span>
                </p>

                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold text-sm transition-all duration-200 group-hover:bg-[var(--color-accent-hover)] group-hover:shadow-[0_0_25px_rgba(232,166,49,0.25)] group-active:scale-[0.98]"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
                >
                  Incearca CVHive
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </div>

              </div>
            </div>
          </div>
        </a>
      </Container>
    </section>
  );
}
