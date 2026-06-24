"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { HIGHLIGHTER_STORAGE_KEY, resolveInitialHighlighter } from "@/lib/highlighter";

/**
 * Global "highlighter" toggle. When on, questions that are easy to confuse with another
 * (near-identical stem/code, or two near-identical answer options that differ by a tiny token
 * like < vs >) show a small hint chip and mark the tiny difference once the answer is revealed.
 * ON by default for first-time visitors; persisted per visitor afterwards.
 *
 * Provided once at the app root (layout) so the navbar toggle and the question cards share state.
 */

interface HighlighterContextValue {
  on: boolean;
  toggle: () => void;
}

const HighlighterContext = createContext<HighlighterContextValue>({
  on: false,
  toggle: () => {},
});

export function HighlighterProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);

  // Read the saved preference after mount (SSR renders off; html has suppressHydrationWarning).
  // First-time visitors (no stored value) default ON; afterwards we honor their explicit choice.
  useEffect(() => {
    try {
      setOn(resolveInitialHighlighter(localStorage.getItem(HIGHLIGHTER_STORAGE_KEY))); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      setOn(true); // localStorage unavailable - treat as a first-time visitor (on) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(HIGHLIGHTER_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return (
    <HighlighterContext.Provider value={{ on, toggle }}>
      {children}
    </HighlighterContext.Provider>
  );
}

export function useHighlighter() {
  return useContext(HighlighterContext);
}
