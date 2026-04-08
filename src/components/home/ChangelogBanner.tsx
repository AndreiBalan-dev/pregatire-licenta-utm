"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";

const recentChanges = [
  "Figuri adaugate la intrebarile care necesita imagini",
  "Pagina Noutati cu istoricul tuturor actualizarilor",
  "Design nou pe pagina de sesiune practica",
];

export function ChangelogBanner() {
  return (
    <section className="pt-2 sm:pt-4 pb-24 md:pb-12">
      <Container>
        <Link
          href="/noutati"
          className="group block rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden hover:border-[var(--color-border-strong)] transition-all duration-200 animate-slide-up"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--color-accent)]"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <span
                  className="text-sm font-bold text-[var(--color-text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Noutati
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                >
                  v1.3.1
                </span>
              </div>
              <span className="text-xs text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] transition-colors flex items-center gap-1">
                Vezi tot
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </div>

            <div className="space-y-1.5">
              {recentChanges.map((change, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[var(--color-accent)] flex-shrink-0" />
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Link>
      </Container>
    </section>
  );
}
