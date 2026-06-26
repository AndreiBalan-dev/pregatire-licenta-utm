"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { KEYBOARD_NAV_STORAGE_KEY, resolveInitialKeyboardNav } from "@/lib/keyboard-nav";
import { KeyboardHintPopup } from "@/components/ui/KeyboardHintPopup";

interface KeyboardNavContextValue {
  on: boolean;
  toggle: () => void;
  showHint: () => void;
  dismissHint: () => void;
  hintVisible: boolean;
  hintNonce: number;
}

const KeyboardNavContext = createContext<KeyboardNavContextValue>({
  on: true, toggle: () => {}, showHint: () => {}, dismissHint: () => {}, hintVisible: false, hintNonce: 0,
});

function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 768px)").matches;
}

/**
 * Global keyboard-navigation preference (on by default, persisted) plus the
 * transient command-hint popup. Provided once at the app root so the navbar
 * toggle, the question cards, and the popup share state. Mirrors HighlighterProvider.
 */
export function KeyboardNavProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(true);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintNonce, setHintNonce] = useState(0);

  useEffect(() => {
    try {
      setOn(resolveInitialKeyboardNav(localStorage.getItem(KEYBOARD_NAV_STORAGE_KEY))); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      setOn(true);
    }
  }, []);

  const showHint = useCallback(() => {
    if (!isDesktop()) return;
    setHintNonce((n) => n + 1);
    setHintVisible(true);
  }, []);

  const dismissHint = useCallback(() => setHintVisible(false), []);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try { localStorage.setItem(KEYBOARD_NAV_STORAGE_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      if (next) showHint();
      else setHintVisible(false);
      return next;
    });
  }, [showHint]);

  return (
    <KeyboardNavContext.Provider value={{ on, toggle, showHint, dismissHint, hintVisible, hintNonce }}>
      {children}
      <KeyboardHintPopup visible={hintVisible} nonce={hintNonce} onDismiss={dismissHint} />
    </KeyboardNavContext.Provider>
  );
}

export function useKeyboardNav() {
  return useContext(KeyboardNavContext);
}
