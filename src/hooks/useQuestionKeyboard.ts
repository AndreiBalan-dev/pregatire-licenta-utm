"use client";

import { useEffect } from "react";
import { nextFocusIndex } from "@/lib/keyboard-nav";

interface QuestionKeyboardArgs {
  /** Feature on AND this card is the live, interactive one AND no modal is open. */
  active: boolean;
  optionCount: number;
  focusedIndex: number | null;
  onFocusChange: (index: number) => void;
  /** Confirm the focused option (same effect as clicking it). */
  onConfirm: () => void;
  /** False once the answer is locked / feedback is shown. */
  confirmEnabled: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

function isTextEntry(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function isButtonLike(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === "BUTTON" || el.tagName === "A" || el.getAttribute("role") === "button";
}

/**
 * Window-level keyboard control for a question card. Up/Down move the focus
 * cursor, Space confirms it, Left/Right navigate. Inert on mobile, inside text
 * fields, while a modifier is held, or when a focused button should own Space.
 */
export function useQuestionKeyboard({
  active, optionCount, focusedIndex, onFocusChange, onConfirm, confirmEnabled, onNext, onPrev,
}: QuestionKeyboardArgs) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (!window.matchMedia("(min-width: 768px)").matches) return; // desktop only
      const ae = document.activeElement;
      if (isTextEntry(e.target) || isTextEntry(ae)) return;

      switch (e.key) {
        case "ArrowDown":
          if (!confirmEnabled) return;
          e.preventDefault();
          onFocusChange(nextFocusIndex(focusedIndex, 1, optionCount));
          break;
        case "ArrowUp":
          if (!confirmEnabled) return;
          e.preventDefault();
          onFocusChange(nextFocusIndex(focusedIndex, -1, optionCount));
          break;
        case " ":
        case "Spacebar": // older browsers
          if (isButtonLike(ae)) return; // let a focused control handle Space natively
          if (!confirmEnabled || focusedIndex === null) return;
          e.preventDefault();
          onConfirm();
          break;
        case "ArrowRight":
          if (!onNext) return;
          e.preventDefault();
          onNext();
          break;
        case "ArrowLeft":
          if (!onPrev) return;
          e.preventDefault();
          onPrev();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, optionCount, focusedIndex, onFocusChange, onConfirm, confirmEnabled, onNext, onPrev]);
}
