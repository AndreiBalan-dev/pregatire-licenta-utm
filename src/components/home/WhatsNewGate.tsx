"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { WhatsNewModal } from "./WhatsNewModal";

const WHATSNEW_KEY = "utm-whatsnew-v250";

/**
 * Shows the one-time "what's new" popup to returning users (those with saved
 * data) on whatever page they land on - not just the homepage. Mounted once in
 * the root layout so it triggers app-wide; gated per visitor via localStorage.
 */
export function WhatsNewGate() {
  const { session, isLoaded } = useSession();
  const [open, setOpen] = useState(false);

  // "Used the site before" - has practice answers or a finished simulator.
  const hasData =
    isLoaded &&
    (Object.keys(session.answers).length > 0 ||
      (session.examHistory?.length ?? 0) > 0 ||
      !!session.currentExam?.submittedAt);

  useEffect(() => {
    if (!isLoaded || !hasData) return;
    try {
      if (localStorage.getItem(WHATSNEW_KEY)) return;
      setOpen(true); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      // ignore storage access errors
    }
  }, [isLoaded, hasData]);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(WHATSNEW_KEY, "1");
    } catch {
      // ignore
    }
  };

  // The voting details live on the homepage (#vot). Scroll there if we're on it,
  // otherwise navigate home to the anchor.
  const seeDetails = () => {
    close();
    setTimeout(() => {
      if (window.location.pathname === "/") {
        document.getElementById("vot")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.href = "/#vot";
      }
    }, 120);
  };

  return <WhatsNewModal open={open} onClose={close} onSeeDetails={seeDetails} />;
}
