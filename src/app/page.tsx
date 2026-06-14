"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { HeroSection } from "@/components/home/HeroSection";
import { VoteCTA } from "@/components/home/VoteCTA";
import { ExamSimulatorCTA } from "@/components/home/ExamSimulatorCTA";
import { ModuleGrid } from "@/components/home/ModuleGrid";
import { CVHivePromo } from "@/components/home/CVHivePromo";
import { ChangelogBanner } from "@/components/home/ChangelogBanner";
import { WhatsNewModal } from "@/components/home/WhatsNewModal";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

const WHATSNEW_KEY = "utm-whatsnew-v150";

export default function HomePage() {
  const { session, isLoaded, hasExistingSession, getOverallStats } = useSession();
  const { toasts, removeToast } = useToast();
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  const stats = getOverallStats();

  // "Used the site before" — has practice answers or a finished simulator. New users
  // (no data) won't see the popup until after they complete their first session.
  const hasData =
    isLoaded &&
    (Object.keys(session.answers).length > 0 ||
      (session.examHistory?.length ?? 0) > 0 ||
      !!session.currentExam?.submittedAt);

  useEffect(() => {
    if (!isLoaded || !hasData) return;
    try {
      if (localStorage.getItem(WHATSNEW_KEY)) return;
      setWhatsNewOpen(true); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      // ignore storage access errors
    }
  }, [isLoaded, hasData]);

  const closeWhatsNew = () => {
    setWhatsNewOpen(false);
    try {
      localStorage.setItem(WHATSNEW_KEY, "1");
    } catch {
      // ignore
    }
  };

  const handleSeeDetails = () => {
    closeWhatsNew();
    setTimeout(() => {
      document.getElementById("vot")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

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
        <VoteCTA />
        <ExamSimulatorCTA />
        <ModuleGrid />
        <CVHivePromo />
        <ChangelogBanner />
      </main>
      <MobileNav />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <WhatsNewModal open={whatsNewOpen} onClose={closeWhatsNew} onSeeDetails={handleSeeDetails} />
    </>
  );
}
