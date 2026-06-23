"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Global "highlighter" toggle. When on, questions that are easy to confuse with another
 * (near-identical stem/code, or two near-identical answer options that differ by a tiny token
 * like < vs >) show a small hint chip in their header. Off by default; persisted per visitor.
 *
 * Provided once at the app root (layout) so the navbar toggle and the question cards share state.
 */
const STORAGE_KEY = "utm-highlighter";

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
  useEffect(() => {
    try {
      setOn(localStorage.getItem(STORAGE_KEY) === "1"); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      // localStorage unavailable - keep default off
    }
  }, []);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
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
