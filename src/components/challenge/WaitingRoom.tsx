"use client";

import { useEffect, useRef, useState } from "react";
import { PlayerAvatar } from "./PlayerAvatar";
import { SoundToggle } from "./SoundToggle";
import { useProvocareSound } from "@/hooks/useProvocareSound";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
}

export function WaitingRoom({
  code,
  members,
  isHost,
  capacity,
  meId,
  onStart,
  starting,
}: {
  code: string;
  members: Member[];
  isHost: boolean;
  capacity: number;
  meId?: number;
  onStart: () => void;
  starting: boolean;
}) {
  const { play } = useProvocareSound();
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/provocare/${code}` : "";

  // The host's row is the first one created, so it has the smallest id.
  const hostId = members.length
    ? String(members.reduce((min, m) => Math.min(min, Number(m.id)), Infinity))
    : null;

  // A little blip whenever someone new drops in.
  const prevCount = useRef(members.length);
  useEffect(() => {
    if (members.length > prevCount.current) play("join");
    prevCount.current = members.length;
  }, [members.length, play]);

  const emptySlots = Math.max(0, capacity - members.length);

  const copy = () => {
    navigator.clipboard?.writeText(shareUrl).then(() => setCopied(true)).catch(() => {});
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
      <div className="relative max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]" style={{ fontFamily: "var(--font-display)" }}>
            Sala de așteptare
          </span>
          <SoundToggle />
        </div>

        <div className="flex items-baseline justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
            {members.length}
            <span className="text-[var(--color-text-tertiary)]">/{capacity}</span>{" "}
            <span className="text-base font-medium text-[var(--color-text-secondary)]">jucători</span>
          </h1>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            title="Copiază codul"
          >
            <span className="tracking-[0.2em] font-bold" style={{ fontFamily: "var(--font-code)" }}>{code}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {members.map((m) => {
            const mine = String(meId) === m.id;
            return (
              <div
                key={m.id}
                className={cn(
                  "animate-roster-pop flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border bg-[var(--color-bg-secondary)]",
                  mine ? "border-[var(--color-accent)]" : "border-[var(--color-border)]",
                )}
              >
                <PlayerAvatar name={m.name} size={48} isHost={m.id === hostId} />
                <span className={cn("text-xs font-medium truncate max-w-full text-center", mine ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]")}>
                  {m.name}
                  {mine ? " (tu)" : ""}
                </span>
              </div>
            );
          })}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] opacity-50">
              <div className="w-12 h-12 rounded-full border border-dashed border-[var(--color-border-strong)] flex items-center justify-center text-[var(--color-text-tertiary)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </div>
              <span className="text-[10px] text-[var(--color-text-tertiary)]">liber</span>
            </div>
          ))}
        </div>

        <button
          onClick={copy}
          className="w-full mb-6 flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] text-sm text-left hover:border-[var(--color-accent)] transition-colors cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[var(--color-text-tertiary)]" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
          <span className="truncate flex-1 text-[var(--color-text-secondary)]">{shareUrl}</span>
          <span className={cn("font-medium flex-shrink-0", copied ? "text-[var(--color-correct)]" : "text-[var(--color-accent)]")}>
            {copied ? "Copiat!" : "Copiază"}
          </span>
        </button>

        {isHost ? (
          <>
            <button
              onClick={() => { play("select"); onStart(); }}
              disabled={starting || members.length < 1}
              className="w-full py-4 rounded-[var(--radius-lg)] text-base font-bold flex items-center justify-center gap-2.5 bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] shadow-[0_0_30px_rgba(232,166,49,0.15)] hover:shadow-[0_0_40px_rgba(232,166,49,0.25)] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
            >
              {starting ? "Se pornește..." : "Începe provocarea"}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </button>
            {members.length < 2 && (
              <p className="mt-3 text-center text-[11px] text-[var(--color-text-tertiary)]">
                Poți începe și singur, dar e mai distractiv cu prieteni.
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-sm text-[var(--color-text-secondary)] animate-breathe">
            Așteptăm ca gazda să înceapă...
          </p>
        )}
      </div>
    </main>
  );
}
