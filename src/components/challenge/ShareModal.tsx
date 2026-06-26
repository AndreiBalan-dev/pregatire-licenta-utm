"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ShareModalProps {
  open: boolean;
  code: string;
  url: string;
  /** Closing the dialog (X, Esc, backdrop, or the button) enters the lobby. */
  onEnter: () => void;
}

export function ShareModal({ open, code, url, onEnter }: ShareModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // On open: pre-select the link and copy it to the clipboard for them.
  useEffect(() => {
    if (!open) return;
    setCopied(false); // eslint-disable-line react-hooks/set-state-in-effect
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    navigator.clipboard?.writeText(url).then(() => setCopied(true)).catch(() => {});
    return () => cancelAnimationFrame(id);
  }, [open, url]);

  const copy = () => {
    inputRef.current?.select();
    navigator.clipboard?.writeText(url).then(() => setCopied(true)).catch(() => {});
  };

  const share = async () => {
    try {
      // Embed the link in the message text so it travels to every target
      // (WhatsApp, etc.) as one ready-to-send message.
      await navigator.share({
        title: "Provocare UTMLearn",
        text: `Intră în lobby-ul meu pe UTMLearn: ${url}`,
      });
    } catch {
      /* dismissed - ignore */
    }
  };

  return (
    <Modal open={open} onClose={onEnter} title="Provocarea e gata" className="max-w-md">
      <p className="text-sm text-[var(--color-text-secondary)] -mt-1 mb-5">
        Trimite linkul prietenilor. Intră pe rând, fără cont.
      </p>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 mb-4 text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]" style={{ fontFamily: "var(--font-display)" }}>
          Cod provocare
        </span>
        <div
          className="mt-1.5 text-3xl font-bold tracking-[0.25em] text-[var(--color-accent)] break-all"
          style={{ fontFamily: "var(--font-code)", paddingLeft: "0.25em" }}
        >
          {code}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Link provocare"
          className="flex-1 min-w-0 px-3 py-2.5 rounded-[var(--radius-md)] text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <Button variant={copied ? "accent" : "secondary"} onClick={copy} className="flex-shrink-0">
          {copied ? "Copiat!" : "Copiază"}
        </Button>
      </div>

      {canNativeShare && (
        <Button variant="secondary" onClick={share} className="w-full mt-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Trimite prin aplicație
        </Button>
      )}

      <Button onClick={onEnter} className="w-full mt-3" size="lg">
        Intră în lobby
      </Button>
    </Modal>
  );
}
