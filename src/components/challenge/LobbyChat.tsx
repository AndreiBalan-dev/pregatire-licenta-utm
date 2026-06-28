"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { PlayerAvatar } from "./PlayerAvatar";
import { cn } from "@/lib/utils";
import { CHALLENGE } from "@/lib/constants";
import type { ChatMessage } from "@/lib/realtime/events";

// Auto-scroll to the newest message only when the user is already pinned near the
// bottom, so we don't yank them while they're reading older messages.
const NEAR_BOTTOM_PX = 80;

export function LobbyChat({
  messages,
  meId,
  onSend,
}: {
  messages: ChatMessage[];
  meId?: number;
  onSend: (text: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  };

  useEffect(() => {
    const el = listRef.current;
    if (el && nearBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError(null);
    const res = await onSend(value);
    setSending(false);
    if (res.ok) {
      setText("");                  // the Pusher echo will render the message
      nearBottomRef.current = true; // make sure our own message scrolls into view
    } else {
      setError(res.error ?? "Eroare."); // keep the typed text so they can retry
    }
  }

  const remaining = CHALLENGE.MAX_MESSAGE_LENGTH - text.length;

  return (
    <section className="mt-8 border-t border-[var(--color-border)] pt-5">
      <span
        className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Chat
      </span>

      <div
        ref={listRef}
        onScroll={onScroll}
        aria-live="polite"
        className="mt-3 max-h-[40vh] min-h-[88px] overflow-y-auto pr-1"
      >
        {messages.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-[var(--color-text-tertiary)]">Niciun mesaj încă.</p>
            <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">Salută-i pe ceilalți cât așteptați.</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = meId != null && m.playerId === meId;
            const grouped = i > 0 && messages[i - 1].playerId === m.playerId;
            return (
              <div key={m.id} className={cn("flex gap-2.5", grouped ? "mt-0.5" : "mt-2.5 first:mt-0")}>
                <div className="w-7 flex-shrink-0">
                  {!grouped && (
                    <PlayerAvatar name={m.name} size={28} className={mine ? "ring-2 ring-[var(--color-accent)]" : undefined} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {!grouped && (
                    <span
                      className={cn(
                        "block text-xs font-medium leading-none mb-1",
                        mine ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]",
                      )}
                    >
                      {m.name}
                      {mine ? " (tu)" : ""}
                    </span>
                  )}
                  <p className="text-sm text-[var(--color-text-primary)] break-words whitespace-pre-wrap leading-snug">
                    {m.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && <p className="mt-2 text-xs text-[var(--color-wrong)]">{error}</p>}

      <form onSubmit={submit} className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={CHALLENGE.MAX_MESSAGE_LENGTH}
            placeholder="Scrie un mesaj..."
            aria-label="Scrie un mesaj"
            className={cn(
              "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none transition-colors",
              remaining <= 40 && "pr-10",
            )}
          />
          {remaining <= 40 && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums text-[var(--color-text-tertiary)]">
              {remaining}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Trimite mesajul"
          className="flex-shrink-0 grid place-items-center w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[#0C0C0E] hover:bg-[var(--color-accent-hover)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </section>
  );
}
