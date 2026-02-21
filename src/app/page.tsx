"use client";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { HeroSection } from "@/components/home/HeroSection";
import { ModuleGrid } from "@/components/home/ModuleGrid";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function HomePage() {
  const { isLoaded, hasExistingSession, getOverallStats } = useSession();
  const { toasts, removeToast } = useToast();

  const stats = getOverallStats();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>
        <HeroSection
          hasExistingSession={hasExistingSession}
          totalAnswered={stats.totalAnswered}
          accuracy={stats.accuracy}
        />
        <ModuleGrid />

        {/* Keyboard shortcuts hint */}
        <section className="py-8 border-t border-[var(--color-border)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--color-text-tertiary)]">
              <span className="uppercase tracking-wider font-medium text-[var(--color-text-secondary)]" style={{ fontFamily: "var(--font-display)" }}>
                Scurtături tastatură
              </span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] font-mono">1-4</kbd> Selectează răspuns</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] font-mono">→</kbd> Următoarea</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] font-mono">←</kbd> Anterioara</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] font-mono">S</kbd> Marchează</span>
            </div>
          </div>
        </section>
      </main>
      <MobileNav />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
