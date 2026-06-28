# Provocare Lobby Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a simple, ephemeral, real-time text chat to the Provocare waiting room (lobby only, before the host starts).

**Architecture:** Messages round-trip through a new server route (Pusher client events are OFF), which validates + rate-limits + authenticates the sender, then publishes a `CHAT_MESSAGE` to the lobby's existing presence channel. The client `useChallengeChannel` hook accumulates messages in memory and exposes a `sendMessage` callback; a new `LobbyChat` component renders an inline panel inside `WaitingRoom`. Nothing is persisted.

**Tech Stack:** Next.js 16 (App Router, node-runtime route handlers), React 19, Pusher Channels (via the existing `src/lib/realtime` adapter), Neon HTTP (read-only here, via `loadPlayerByToken`), Tailwind v4 with the project's CSS-variable design tokens.

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-06-28-provocare-lobby-chat-design.md`.
- **No DB migration, no schema change, no CSP change.** This feature is ephemeral and reuses the existing presence channel.
- **Ephemeral only:** messages live in client memory; no persistence, no scrollback after refresh or for late joiners.
- **Lobby-only:** enforced in the UI (chat only renders in the waiting room) AND server-side (reject when `lobby.status !== "lobby"`).
- **Trusted identity:** the server stamps `playerId`/`name` from the token lookup; never trust a client-sent name/id.
- **Copy style:** Romanian UI strings, no em/en dashes anywhere (use commas or "-"). Romanian diacritics in user-facing strings are fine and match existing copy.
- **Rate limit:** `challengeChat` = 30 requests / 60s, keyed by hashed token.
- **Message cap:** `MAX_MESSAGE_LENGTH` = 200 chars.
- **Verification reality:** this repo unit-tests only pure logic, via standalone Node scripts run with an alias loader (`node --import ./scripts/register-alias.mjs scripts/<x>.test.mjs`). There is NO React/route test harness, and we are NOT adding one. So `validateChatMessage` gets real TDD; the route, hook, component, and wiring are verified with `npx tsc --noEmit`, `npm run lint`, a production build with a dummy `DATABASE_URL`, and manual two-browser testing.
- **Git:** commit per task directly to `main` (solo project, no branches, no push). End every commit message with the co-author trailer shown in the steps.
- **Build needs a DB URL:** `npm run build` throws without `DATABASE_URL`; pass a dummy Neon URL (tsc/lint/tests do not need it).

---

### Task 1: Realtime event + payload type + constants

**Files:**
- Modify: `src/lib/realtime/events.ts`
- Modify: `src/lib/constants.ts`

**Interfaces:**
- Consumes: nothing (foundational).
- Produces:
  - `EVENTS.CHAT_MESSAGE` (string `"chat-message"`).
  - `interface ChatMessage { id: string; playerId: number; name: string; text: string; at: number }`.
  - `CHALLENGE.MAX_MESSAGE_LENGTH = 200`.
  - `RATE_LIMITS.challengeChat = { windowMs: 60000, maxRequests: 30 }`.

- [ ] **Step 1: Add the event name and payload type to `events.ts`**

In `src/lib/realtime/events.ts`, add `CHAT_MESSAGE` to the `EVENTS` object:

```ts
export const EVENTS = {
  ROUND_STARTED: "round-started",
  LEADERBOARD: "leaderboard",
  MILESTONE: "milestone",
  ROUND_FINISHED: "round-finished",
  CHAT_MESSAGE: "chat-message",
} as const;
```

Then add this interface at the end of the file (after `RoundFinishedPayload`):

```ts
// A single lobby chat message. Ephemeral - never stored; the server stamps id/at
// and the trusted playerId/name from the sender's token.
export interface ChatMessage {
  id: string;       // server-generated (crypto.randomUUID) - React key + dedupe
  playerId: number;
  name: string;
  text: string;     // validated + whitespace-normalized
  at: number;       // server epoch ms
}
```

- [ ] **Step 2: Add the message-length constant in `constants.ts`**

In `src/lib/constants.ts`, inside the `CHALLENGE` object, add the line after `MAX_NAME_LENGTH: 20,`:

```ts
  MAX_MESSAGE_LENGTH: 200,
```

- [ ] **Step 3: Add the rate-limit bucket in `constants.ts`**

In `src/lib/constants.ts`, inside the `RATE_LIMITS` object, add after the `challengeStart` line:

```ts
  // Lobby chat: keyed by token (like challengeState) so classmates on one IP
  // don't throttle each other. 30/min is generous for banter, caps floods.
  challengeChat: { windowMs: 60 * 1000, maxRequests: 30 },
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/realtime/events.ts src/lib/constants.ts
git commit -m "feat(provocare): add chat event, payload type, and constants" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `validateChatMessage` (TDD)

**Files:**
- Modify: `src/lib/challenge/validation.ts`
- Test: `scripts/challenge-validation.test.mjs`

**Interfaces:**
- Consumes: `CHALLENGE.MAX_MESSAGE_LENGTH` (Task 1). `validation.ts` already imports `CHALLENGE` from `@/lib/constants`, so no new import is needed.
- Produces: `validateChatMessage(raw: unknown): { ok: true; text: string } | { ok: false; error: string }`.

- [ ] **Step 1: Write the failing tests**

In `scripts/challenge-validation.test.mjs`, change the import on line 3 to add `validateChatMessage`:

```js
import { validateName, validateCreateConfig, validateChatMessage } from "../src/lib/challenge/validation.ts";
```

Then add these checks just before the final `if (failures > 0)` block at the bottom of the file:

```js
check("chat: trims and accepts a normal message", () => {
  const r = validateChatMessage("  hai mai repede ");
  assert.equal(r.ok, true);
  assert.equal(r.text, "hai mai repede");
});

check("chat: collapses internal whitespace and newlines to single spaces", () => {
  const r = validateChatMessage("gata\n\n  acum");
  assert.equal(r.ok, true);
  assert.equal(r.text, "gata acum");
});

check("chat: rejects empty and whitespace-only messages", () => {
  assert.equal(validateChatMessage("").ok, false);
  assert.equal(validateChatMessage("    ").ok, false);
  assert.equal(validateChatMessage("\n\t").ok, false);
});

check("chat: accepts exactly 200 chars, rejects 201", () => {
  assert.equal(validateChatMessage("x".repeat(200)).ok, true);
  assert.equal(validateChatMessage("x".repeat(201)).ok, false);
});

check("chat: rejects angle brackets and control chars", () => {
  assert.equal(validateChatMessage("<b>hi</b>").ok, false);
  assert.equal(validateChatMessage("a\x00b").ok, false);
});

check("chat: rejects non-string input", () => {
  assert.equal(validateChatMessage(123).ok, false);
  assert.equal(validateChatMessage(null).ok, false);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-validation.test.mjs`
Expected: FAIL - the run errors at module load with something like `does not provide an export named 'validateChatMessage'` (the function does not exist yet).

- [ ] **Step 3: Implement `validateChatMessage`**

In `src/lib/challenge/validation.ts`, add this function after `validateName` (it reuses the already-imported `CHALLENGE`):

```ts
export function validateChatMessage(raw: unknown): { ok: true; text: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "Mesaj invalid." };
  // Collapse all whitespace runs (incl. pasted newlines/tabs) to single spaces so a
  // multi-line paste becomes a normal one-line message instead of tripping the
  // control-char check below.
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length === 0) return { ok: false, error: "Mesaj gol." };
  if (text.length > CHALLENGE.MAX_MESSAGE_LENGTH) return { ok: false, error: `Mesaj prea lung (max ${CHALLENGE.MAX_MESSAGE_LENGTH}).` };
  if (/[\x00-\x1f\x7f]/.test(text)) return { ok: false, error: "Mesaj invalid." };
  if (/<[^>]*>/.test(text)) return { ok: false, error: "Mesaj invalid." };
  return { ok: true, text };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --import ./scripts/register-alias.mjs scripts/challenge-validation.test.mjs`
Expected: PASS - ends with `All tests passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/challenge/validation.ts scripts/challenge-validation.test.mjs
git commit -m "feat(provocare): add validateChatMessage with tests" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `POST /api/challenge/chat` route

**Files:**
- Create: `src/app/api/challenge/chat/route.ts`

**Interfaces:**
- Consumes:
  - `validateChatMessage` (Task 2).
  - `EVENTS.CHAT_MESSAGE`, `ChatMessage` (Task 1).
  - `RATE_LIMITS.challengeChat` (Task 1).
  - Existing helpers: `hashToken` from `@/lib/crypto`; `checkRateLimit` from `@/lib/rate-limit`; `loadPlayerByToken` from `@/lib/challenge/server` (returns `{ lobby, player } | null`, where `lobby.status` is a string and `player` has `id: number` and `name: string`); `publishToLobby` from `@/lib/realtime/pusher-server`.
- Produces: a POST endpoint accepting `{ code, token, text }`, returning `{ ok: true }` or `{ error }` with an HTTP status.

- [ ] **Step 1: Create the route**

Create `src/app/api/challenge/chat/route.ts` with exactly:

```ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { hashToken } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";
import { validateChatMessage } from "@/lib/challenge/validation";
import { loadPlayerByToken } from "@/lib/challenge/server";
import { publishToLobby } from "@/lib/realtime/pusher-server";
import { EVENTS, type ChatMessage } from "@/lib/realtime/events";

export async function POST(request: NextRequest) {
  let body: { code?: unknown; token?: unknown; text?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Date invalide." }, { status: 400 }); }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const token = typeof body.token === "string" ? body.token : "";
  if (!code || !token) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });

  // Rate limit per player (hashed token), like /state, so classmates on one IP
  // don't throttle each other.
  const rl = checkRateLimit(`ch:chat:${hashToken(token)}`, RATE_LIMITS.challengeChat);
  if (!rl.allowed) return NextResponse.json({ error: "Prea multe mesaje. Așteaptă puțin." }, { status: 429 });

  const check = validateChatMessage(body.text);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

  const found = await loadPlayerByToken(code, token);
  if (!found) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });

  // Lobby-only: no chat once the round has started or finished.
  if (found.lobby.status !== "lobby") {
    return NextResponse.json({ error: "Provocarea a început deja." }, { status: 409 });
  }

  const message: ChatMessage = {
    id: randomUUID(),
    playerId: found.player.id,
    name: found.player.name,
    text: check.text,
    at: Date.now(),
  };
  await publishToLobby(code, EVENTS.CHAT_MESSAGE, message);

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors or warnings.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/challenge/chat/route.ts
git commit -m "feat(provocare): add chat send endpoint" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: `useChallengeChannel` - receive + send

**Files:**
- Modify: `src/hooks/useChallengeChannel.ts`

**Interfaces:**
- Consumes: `EVENTS.CHAT_MESSAGE`, `ChatMessage` (Task 1); the `POST /api/challenge/chat` route (Task 3).
- Produces (added to the hook's return object):
  - `messages: ChatMessage[]`.
  - `sendMessage(text: string): Promise<{ ok: boolean; error?: string }>`.

- [ ] **Step 1: Import `useCallback` and the `ChatMessage` type**

In `src/hooks/useChallengeChannel.ts`, change the React import:

```ts
import { useCallback, useEffect, useState } from "react";
```

and extend the events import to include `ChatMessage`:

```ts
import { CHANNELS, EVENTS, type Standing, type MilestoneEvent, type ChatMessage } from "@/lib/realtime/events";
```

- [ ] **Step 2: Add the `messages` state**

After the existing `const [connected, setConnected] = useState(true);` line, add:

```ts
  const [messages, setMessages] = useState<ChatMessage[]>([]);
```

- [ ] **Step 3: Reset messages on re-subscribe and bind the event**

In the subscribe effect, add `setMessages([]);` to the reset group (right after `setStatus(null);`). Then, alongside the other `channel.bind(...)` calls, add:

```ts
    channel.bind(EVENTS.CHAT_MESSAGE, (m: ChatMessage) => {
      // Dedupe by server id (in case of redelivery) and cap memory at the last 100.
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m].slice(-100)));
    });
```

- [ ] **Step 4: Add the `sendMessage` callback**

After the subscribe effect (before the `return` statement), add:

```ts
  const sendMessage = useCallback(
    async (text: string): Promise<{ ok: boolean; error?: string }> => {
      if (!code || !token) return { ok: false, error: "Indisponibil." };
      try {
        const res = await fetch("/api/challenge/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code, token, text }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { ok: false, error: data.error ?? "Eroare." };
        }
        return { ok: true };
      } catch {
        return { ok: false, error: "Conexiune eșuată." };
      }
    },
    [code, token],
  );
```

- [ ] **Step 5: Return the new values**

Change the final return to:

```ts
  return { members, standings, lastMilestone, status, connected, messages, sendMessage };
```

- [ ] **Step 6: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm run lint`
Expected: no errors or warnings. (Note: the existing reset group already calls several setState in the effect without per-line disables, so adding `setMessages([])` there is consistent and lint-clean.)

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useChallengeChannel.ts
git commit -m "feat(provocare): receive and send lobby chat in channel hook" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: `LobbyChat` component

**Files:**
- Create: `src/components/challenge/LobbyChat.tsx`

**Interfaces:**
- Consumes: `ChatMessage` (Task 1); `PlayerAvatar` from `./PlayerAvatar` (props: `name: string`, `size?: number`, `isHost?: boolean`, `className?: string`); `CHALLENGE.MAX_MESSAGE_LENGTH` (Task 1); `cn` from `@/lib/utils`.
- Produces: `LobbyChat` component with props `{ messages: ChatMessage[]; meId?: number; onSend: (text: string) => Promise<{ ok: boolean; error?: string }> }` (the `onSend` signature matches `sendMessage` from Task 4).

- [ ] **Step 1: Create the component**

Create `src/components/challenge/LobbyChat.tsx` with exactly:

```tsx
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
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm run lint`
Expected: no errors or warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/challenge/LobbyChat.tsx
git commit -m "feat(provocare): add LobbyChat inline panel component" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Wire chat into WaitingRoom + lobby page, then verify end-to-end

**Files:**
- Modify: `src/components/challenge/WaitingRoom.tsx`
- Modify: `src/app/provocare/[code]/page.tsx`

**Interfaces:**
- Consumes: `LobbyChat` (Task 5); `messages` + `sendMessage` from `useChallengeChannel` (Task 4); `ChatMessage` (Task 1).
- Produces: the rendered, working lobby chat.

- [ ] **Step 1: Add imports to `WaitingRoom.tsx`**

In `src/components/challenge/WaitingRoom.tsx`, add after the existing component imports (near the top):

```tsx
import { LobbyChat } from "./LobbyChat";
import type { ChatMessage } from "@/lib/realtime/events";
```

- [ ] **Step 2: Extend `WaitingRoom`'s props**

Add the two new props to the destructured parameter list and to its type. The function signature becomes:

```tsx
export function WaitingRoom({
  code,
  members,
  isHost,
  capacity,
  meId,
  onStart,
  starting,
  messages,
  onSendMessage,
}: {
  code: string;
  members: Member[];
  isHost: boolean;
  capacity: number;
  meId?: number;
  onStart: () => void;
  starting: boolean;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<{ ok: boolean; error?: string }>;
}) {
```

- [ ] **Step 3: Render `LobbyChat` at the bottom of the waiting room**

In `WaitingRoom.tsx`, the host/guest call-to-action is wrapped by `{isHost ? ( ... ) : ( ... )}`. Immediately AFTER that closing `)}` and BEFORE the closing `</div>` of `<div className="relative max-w-xl mx-auto px-4 py-8">`, add:

```tsx
        <LobbyChat messages={messages} meId={meId} onSend={onSendMessage} />
```

- [ ] **Step 4: Pass the new values from the lobby page**

In `src/app/provocare/[code]/page.tsx`, update the hook destructure to include `messages` and `sendMessage`:

```tsx
  const { members, standings, lastMilestone, status, connected, messages, sendMessage } = useChallengeChannel(code, token ?? hostToken);
```

Then update the `<WaitingRoom .../>` render (near the end of the file) to pass them:

```tsx
      <WaitingRoom code={code} members={members} isHost={!!hostToken} capacity={snapshot.config.capacity} meId={snapshot.me?.playerId} onStart={onStart} starting={starting} messages={messages} onSendMessage={sendMessage} />
```

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm run lint`
Expected: no errors or warnings.

- [ ] **Step 6: Run the full unit-test suite**

Run: `npm test`
Expected: every script prints `All tests passed`; the command exits 0.

- [ ] **Step 7: Production build with a dummy DB URL**

Run (Git Bash):

```bash
DATABASE_URL="postgresql://u:p@ep-dummy-123.us-east-2.aws.neon.tech/neondb?sslmode=require" npm run build
```

(PowerShell equivalent: `$env:DATABASE_URL="postgresql://u:p@ep-dummy-123.us-east-2.aws.neon.tech/neondb?sslmode=require"; npm run build`)
Expected: build completes successfully, no type or lint errors, the `/provocare/[code]` and `/api/challenge/chat` routes appear in the build output.

- [ ] **Step 8: Manual two-browser smoke test**

Run `npm run dev` (needs a real or working `DATABASE_URL` + Pusher env keys). In two browser windows:
- Create a lobby in window A (host), join with the link in window B.
- Send a message from each side; confirm both appear in both windows, with the sender's own message styled as "you" (accent name + avatar ring) and consecutive messages grouped.
- Confirm the empty state shows before any message, and the character counter appears only near 200.
- Confirm that after the host presses Start, the chat is gone (waiting room unmounts) and the server rejects a late chat POST with 409 (optional: verify via devtools/network).
- Optional: hammer send to confirm the 429 path shows the inline "Prea multe mesaje" error and keeps the typed text.

- [ ] **Step 9: Commit**

```bash
git add src/components/challenge/WaitingRoom.tsx "src/app/provocare/[code]/page.tsx"
git commit -m "feat(provocare): wire lobby chat into waiting room" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage:**
- Ephemeral / live-only -> no DB anywhere; messages held only in the hook (Task 4). Covered.
- Echo-only rendering -> `sendMessage` does not optimistically insert; the bound `CHAT_MESSAGE` handler is the only writer (Task 4). Covered.
- Send path round-trip + trusted identity -> Task 3 route stamps `playerId`/`name` from `loadPlayerByToken`. Covered.
- Rate limit 30/60s by hashed token -> Task 1 constant + Task 3 usage. Covered.
- `validateChatMessage` (normalize, empty, length, control chars, HTML) -> Task 2 with TDD. Covered.
- Lobby-only (server) -> Task 3 `status !== "lobby"` -> 409. Lobby-only (UI) -> `LobbyChat` only rendered in `WaitingRoom` (Task 6). Covered.
- Inline panel UI (grouping, own-message styling, empty state, auto-scroll, char counter, error handling) -> Task 5. Covered.
- `ChatMessage` shape -> Task 1. Covered.
- Tests + build + manual -> Task 2 (unit) and Task 6 (suite/build/manual). Covered.
- Files list (2 new + 7 edited) -> Tasks 1-6 touch exactly: events.ts, constants.ts (T1); validation.ts, challenge-validation.test.mjs (T2); chat/route.ts (T3); useChallengeChannel.ts (T4); LobbyChat.tsx (T5); WaitingRoom.tsx, [code]/page.tsx (T6). Matches.

**2. Placeholder scan:** No TBD/TODO; every code step shows complete code; every command has expected output. Clean.

**3. Type consistency:** `ChatMessage` (id/playerId/name/text/at) identical across Tasks 1, 3, 4, 5. `sendMessage` / `onSend` / `onSendMessage` all typed `(text: string) => Promise<{ ok: boolean; error?: string }>` across Tasks 4, 5, 6. `validateChatMessage` returns `{ ok: true; text } | { ok: false; error }` and Task 3 reads `check.text` / `check.error` accordingly. `loadPlayerByToken` returns `{ lobby, player }` and Task 3 reads `found.lobby.status` / `found.player.id` / `found.player.name`, matching `server.ts`. Consistent.

No issues found.
