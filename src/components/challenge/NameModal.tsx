"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PlayerAvatar } from "./PlayerAvatar";

interface NameModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  submitLabel: string;
  busy?: boolean;
  error?: string | null;
  defaultName?: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function NameModal({
  open,
  title,
  subtitle,
  submitLabel,
  busy = false,
  error,
  defaultName = "",
  onSubmit,
  onClose,
}: NameModalProps) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(defaultName); // eslint-disable-line react-hooks/set-state-in-effect
    // Full focus on the name field as soon as the dialog lands.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, defaultName]);

  const trimmed = name.trim();
  const submit = () => {
    if (trimmed.length === 0 || busy) return;
    onSubmit(trimmed);
  };

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <PlayerAvatar name={trimmed || "?"} size={48} />
        <div className="min-w-0">
          {subtitle && (
            <p className="text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        placeholder="Numele tău"
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        aria-label="Numele tău"
        className="w-full px-4 py-3.5 rounded-[var(--radius-md)] text-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-all focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
        style={{ fontFamily: "var(--font-display)" }}
      />

      <div className="mt-1.5 flex items-center justify-between min-h-[18px]">
        <span className="text-xs text-[var(--color-wrong)]">{error}</span>
        <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">{name.length}/20</span>
      </div>

      <Button onClick={submit} disabled={busy || trimmed.length === 0} className="w-full mt-3" size="lg">
        {busy ? "Un moment..." : submitLabel}
      </Button>
    </Modal>
  );
}
