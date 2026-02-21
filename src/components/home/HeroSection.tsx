"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

interface HeroSectionProps {
  hasExistingSession: boolean;
  totalAnswered: number;
  accuracy: number;
}

export function HeroSection({ hasExistingSession, totalAnswered, accuracy }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
      {/* Grid background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      <Container className="relative">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[var(--color-correct)] animate-pulse" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Sesiunea 2026
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6 animate-fade-in stagger-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-[var(--color-text-primary)]">Pregătire </span>
            <span className="text-[var(--color-accent)]">Licență</span>
            <br />
            <span className="text-[var(--color-text-primary)]">UTM</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-xl leading-relaxed animate-fade-in stagger-2">
            Exerciții grilă din toate disciplinele de examen. Programare, baze de date, rețele și tehnologii web, totul într-un singur loc.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-4 animate-fade-in stagger-3">
            <Link href="/practica">
              <Button size="lg">
                {hasExistingSession ? "Continuă Practica" : "Începe Practica"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Button>
            </Link>
            <Link href="/incarca">
              <Button variant="secondary" size="lg">
                Încarcă Sesiune
              </Button>
            </Link>
          </div>

          {/* Quick stats if existing session */}
          {hasExistingSession && (
            <div className="mt-10 flex items-center gap-6 text-sm animate-fade-in stagger-4">
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-tertiary)]">Rezolvate:</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{totalAnswered}</span>
              </div>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-tertiary)]">Acuratețe:</span>
                <span className="font-semibold text-[var(--color-accent)]">{accuracy}%</span>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
