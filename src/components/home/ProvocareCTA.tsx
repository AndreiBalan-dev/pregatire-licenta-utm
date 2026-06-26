"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";

export function ProvocareCTA() {
  return (
    <section className="py-6 sm:py-8">
      <Container>
        <Link
          href="/provocare"
          className="group relative block overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-all duration-300 hover:border-[var(--color-accent)] animate-slide-up"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 20% 0%, var(--color-accent), transparent 60%), radial-gradient(ellipse 60% 60% at 90% 100%, var(--color-wrong), transparent 60%)",
              opacity: 0.08,
            }}
            aria-hidden="true"
          />
          <div className="relative px-5 sm:px-8 py-6 sm:py-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-30">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" aria-hidden="true" />
              Nou
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-[2.5rem] font-extrabold text-[var(--color-text-primary)] leading-[1.05] mb-2.5 sm:mb-3"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}
            >
              Provocare <span className="text-[var(--color-accent)]">Multiplayer</span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-md mb-5 sm:mb-6">
              Creezi o sesiune, distribui linkul, jucați împreună. Fără cont, fără instalare.
            </p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] font-semibold text-sm transition-all duration-200 group-hover:bg-[var(--color-accent-hover)] group-hover:shadow-[0_0_30px_rgba(232,166,49,0.3)] group-active:scale-[0.98]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
            >
              Creează Provocarea
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </Link>
      </Container>
    </section>
  );
}
