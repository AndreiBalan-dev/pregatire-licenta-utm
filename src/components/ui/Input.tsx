"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-3 rounded-[var(--radius-md)]",
            "bg-[var(--color-bg-secondary)] border border-[var(--color-border)]",
            "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]",
            "transition-all duration-200",
            "focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]",
            error && "border-[var(--color-wrong)] focus:border-[var(--color-wrong)] focus:ring-[var(--color-wrong)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--color-wrong)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
