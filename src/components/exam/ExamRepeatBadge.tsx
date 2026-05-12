"use client";

import { cn } from "@/lib/utils";

interface ExamRepeatBadgeProps {
  shuffled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ExamRepeatBadge({ shuffled, size = "md", className }: ExamRepeatBadgeProps) {
  const isSm = size === "sm";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-[0.15em]",
        "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)] border-opacity-40",
        isSm ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
        className,
      )}
      style={{ fontFamily: "var(--font-display)" }}
      title={shuffled ? "Aceleași grile, ordine nouă" : "Aceleași grile, aceeași ordine"}
    >
      <svg
        width={isSm ? "10" : "11"}
        height={isSm ? "10" : "11"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
      Sesiune repetată
      {shuffled && (
        <span className="opacity-70 normal-case tracking-normal font-medium">
          · ordine nouă
        </span>
      )}
    </span>
  );
}
