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

      </main>
      <MobileNav />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
