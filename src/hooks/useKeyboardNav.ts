"use client";

import { useEffect } from "react";

interface KeyboardNavOptions {
  onSelectOption?: (option: "a" | "b" | "c" | "d") => void;
  onNext?: () => void;
  onPrev?: () => void;
  onBookmark?: () => void;
  enabled?: boolean;
}

export function useKeyboardNav({
  onSelectOption,
  onNext,
  onPrev,
  onBookmark,
  enabled = true,
}: KeyboardNavOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "1":
        case "a":
        case "A":
          e.preventDefault();
          onSelectOption?.("a");
          break;
        case "2":
        case "b":
        case "B":
          e.preventDefault();
          onSelectOption?.("b");
          break;
        case "3":
        case "c":
        case "C":
          e.preventDefault();
          onSelectOption?.("c");
          break;
        case "4":
        case "d":
        case "D":
          e.preventDefault();
          onSelectOption?.("d");
          break;
        case "ArrowRight":
        case "Enter":
          e.preventDefault();
          onNext?.();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onPrev?.();
          break;
        case "s":
        case "S":
          e.preventDefault();
          onBookmark?.();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelectOption, onNext, onPrev, onBookmark, enabled]);
}
