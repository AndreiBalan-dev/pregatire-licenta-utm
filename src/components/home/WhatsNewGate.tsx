"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { WhatsNewModal } from "./WhatsNewModal";

const WHATSNEW_KEY = "utm-whatsnew-v300-provocare";

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

  return <WhatsNewModal open={open} onClose={close} />;
}
