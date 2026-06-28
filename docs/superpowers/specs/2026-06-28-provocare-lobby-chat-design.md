# Provocare Lobby Chat - Design Spec

Date: 2026-06-28
Status: Approved (pre-approved by user, ready for implementation planning)
Supersedes: the "Chat" non-goal in `2026-06-26-challenge-mode-design.md`, but only for the
lobby. Chat during a running round remains out of scope.

## 1. Summary

A simple text chat inside the Provocare waiting room (lobby), available only before the
host starts the round. Friends join a lobby by link and trickle in over a minute or two;
the chat lets them say hello and coordinate ("hai mai repede", "gata?") while they wait.
The moment the host starts, the waiting room unmounts and chat is gone for the rest of the
game.

Messages are ephemeral and live-only: they appear in real time for everyone currently in
the lobby, but there is no scrollback. A page refresh clears them, and someone who joins
later only sees messages sent after they arrived. This matches how most live lobby chats
feel and needs no database.

## 2. Goals and non-goals

### Goals
- Real-time text chat for everyone in a lobby, host and joiners alike.
- Server-authoritative identity: the sender's name and id come from their token, never
  from the client payload.
- Lobby-only, enforced both in the UI (only rendered in the waiting room) and server-side
  (rejected once the lobby status is no longer "lobby").
- Reuse the existing realtime adapter, validation style, rate-limit utility, avatar
  component, and design tokens. No new infrastructure.
- A polished, on-brand inline panel that fits the existing waiting-room aesthetic.

### Non-goals (YAGNI for v1)
- Persistence / scrollback that survives a refresh or is visible to late joiners.
- Chat during the running round or on the results screen.
- Typing indicators, read receipts, emoji reactions, edit/delete.
- System "X joined / left" lines, per-message timestamps.
- A new sound cue on incoming messages (visual only; easy to add later).
- Optimistic local rendering (see decision 3 below).

## 3. Foundational decisions (settled during brainstorming)

1. **Ephemeral, live-only.** No DB table, no migration. Messages exist only in the client
   hook's in-memory state for the life of the lobby view. Chosen for simplicity over
   refresh-survival / late-joiner scrollback.

2. **Inline panel form factor.** An always-visible panel at the bottom of the waiting
   room (a height-bounded scrollable message list plus an input row), under the Start
   button. Most discoverable and social, simplest to build. (Alternatives considered and
   rejected: a collapsible dock and a floating bubble + sheet.)

3. **Echo-only rendering, not optimistic.** The send path round-trips through the server
   (Pusher client events are OFF, so clients cannot publish directly, and a server hop is
   the secure path anyway). The sender sees their own message when Pusher echoes it back,
   the same as everyone else. This keeps message ordering server-authoritative and dedupe
   trivial (by server-generated id), with zero reconciliation logic. The tradeoff is a
   small delay (~100-200ms) before your own message appears. Optimistic rendering is a
   clean follow-up if it ever feels sluggish.

### Architectural keystone
This rides entirely on the existing realtime layer. The flow:

```
type + Enter  ->  POST /api/challenge/chat  ->  rate-limit + validate + auth (loadPlayerByToken)
              ->  publishToLobby(code, CHAT_MESSAGE, msg)  ->  Pusher presence channel
              ->  every client's useChallengeChannel appends it  ->  LobbyChat renders
```

Nothing is stored. The `useChallengeChannel` hook lives at page level, so its message
state survives the waiting room's re-renders (but not a hard refresh, by design).

## 4. Data shape

In `src/lib/realtime/events.ts`:

```ts
// add to EVENTS
CHAT_MESSAGE: "chat-message"

// new payload type
export interface ChatMessage {
  id: string;       // server-generated (crypto.randomUUID) - React key + dedupe
  playerId: number; // trusted, from the token lookup
  name: string;     // trusted, from the player row (client-sent name is ignored)
  text: string;     // validated + whitespace-normalized
  at: number;       // server epoch ms
}
```

## 5. Endpoint: `POST /api/challenge/chat`

New file `src/app/api/challenge/chat/route.ts`. Body `{ code, token, text }`. Steps, in
order (mirrors the structure of the existing challenge routes):

1. **Rate limit** `checkRateLimit("ch:chat:" + hashToken(token), RATE_LIMITS.challengeChat)`
   -> 429 on exceed. Proposed limit: **30 requests / 60s** per player (keyed by hashed
   token, like `/state`, so classmates on one IP do not throttle each other).
2. **Parse + validate** `validateChatMessage(text)` -> 400 on failure.
3. **Authenticate** `loadPlayerByToken(code, token)` -> 403 if not found. This both
   verifies the sender and yields the trusted `player.id` / `player.name`.
4. **Lobby-only guard:** if `lobby.status !== "lobby"` -> 409 ("Provocarea a inceput
   deja."). Chat is impossible once the round starts, enforced server-side.
5. **Build + publish:** construct the `ChatMessage` (server-stamped `id`, `at`; trusted
   `playerId`, `name`; validated `text`), `publishToLobby(code, EVENTS.CHAT_MESSAGE, msg)`,
   return `{ ok: true }`.

The route never trusts a client-sent name or id. `Date.now()` and `crypto.randomUUID()`
are used server-side in the route handler (fine here; this is not a workflow script).

## 6. Validation: `validateChatMessage`

New function in `src/lib/challenge/validation.ts`, mirroring `validateName`:

- Reject non-string -> "Mesaj invalid."
- Normalize whitespace: `text.replace(/\s+/g, " ").trim()` (so a pasted newline becomes a
  space instead of failing the control-char check).
- Reject empty after trim -> "Mesaj gol."
- Reject length > `CHALLENGE.MAX_MESSAGE_LENGTH` (200) -> "Mesaj prea lung (max 200)."
- Reject control chars `/[\x00-\x1f\x7f]/` -> "Mesaj invalid." (after normalization this
  should not trigger for normal input, but it is a backstop).
- Reject HTML-ish `/<[^>]*>/` -> "Mesaj invalid." React escapes on render, so this is
  defense in depth, not the only guard.
- On success return `{ ok: true, text }` with the normalized text.

## 7. Constants

In `src/lib/constants.ts`:

- `CHALLENGE.MAX_MESSAGE_LENGTH = 200`
- `RATE_LIMITS.challengeChat = { windowMs: 60 * 1000, maxRequests: 30 }`

## 8. Client hook: `useChallengeChannel`

In `src/hooks/useChallengeChannel.ts`:

- Add `messages: ChatMessage[]` state; reset it (alongside the existing resets) when the
  channel re-subscribes.
- Bind `EVENTS.CHAT_MESSAGE`: append, dedupe by `id` (guard against double delivery), and
  cap the array to the most recent ~100 to bound memory:
  `setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg].slice(-100))`.
- Add a `sendMessage(text: string)` callback that POSTs to `/api/challenge/chat` with the
  hook's `code` + `token`. It returns a small result so the UI can react to a 429
  (`{ ok: boolean; error?: string }`); on a non-ok HTTP status it surfaces the server
  error text.
- Return `messages` and `sendMessage` alongside the existing values.

Because the lobby page calls the hook with `token ?? hostToken` and the host always has a
player token in Phase 1 (hostPlays is always true and the create flow saves both tokens),
`loadPlayerByToken` resolves host and joiner uniformly. No host special-casing.

## 9. UI component: `LobbyChat`

New file `src/components/challenge/LobbyChat.tsx`.

Props: `{ messages: ChatMessage[]; meId?: number; onSend: (text: string) => Promise<{ ok: boolean; error?: string }> }`.

Layout (Discord-style grouped chat, which scales to up to 10 senders better than
left/right bubbles):

```
----------  CHAT  ----------
 (av) Ana
      hai mai repede
 (av) Tu                  <- own name in accent, avatar gets the accent ring
      2 min :)
      si eu sunt gata     <- consecutive msgs from same person grouped (no repeated header)
 +-------------------------+
 | Scrie un mesaj...   [>] |  <- Enter to send; send btn accent, disabled when empty
 +-------------------------+
```

Details:
- **Section header:** a thin top border + a small uppercase "CHAT" micro-label, matching
  the existing "SALA DE ASTEPTARE" label styling (`--font-display`, accent, tracking).
- **Message list:** height-bounded (~40vh), `overflow-y-auto`, `aria-live="polite"`,
  `break-words` for long text. Auto-scroll to bottom on a new message **only if the user
  is already near the bottom** (within ~80px), so it does not yank someone reading
  scrollback.
- **Message row:** `PlayerAvatar` reused at ~28px + a column of (name line, text). Own
  messages: name in `--color-accent` and the avatar gets an accent ring, echoing how the
  roster highlights "you". Others: name in `--color-text-secondary`.
- **Grouping:** consecutive messages from the same `playerId` omit the repeated
  avatar/name and indent the text to align under the first.
- **Empty state:** centered, friendly: a short "Niciun mesaj inca." plus
  "Saluta-i pe ceilalti cat asteptati." in tertiary text.
- **Input:** `maxLength={200}`; a subtle character counter appears only near the limit
  (e.g. when length > 160). Enter submits (Shift+Enter is not needed; single-line).
  On a successful send, clear the input immediately. On a 429 / error, keep the typed
  text and show a small inline message ("Prea multe mesaje, asteapta putin.") so the user
  can retry.
- **Styling:** uses the existing tokens only (`--color-bg-secondary`, `--color-border`,
  radius tokens, accent), so it reads as part of the waiting room.
- **No sound** on incoming messages.

## 10. Wiring

- `src/components/challenge/WaitingRoom.tsx`: accept two new props
  (`messages: ChatMessage[]`, `onSendMessage: (text) => Promise<...>`) and render
  `<LobbyChat messages={messages} meId={meId} onSend={onSendMessage} />` at the bottom of
  the existing `max-w-xl` column, under the Start button / "asteptam gazda" text.
- `src/app/provocare/[code]/page.tsx`: destructure `messages` and `sendMessage` from
  `useChallengeChannel` and pass them into `<WaitingRoom>`.

## 11. Testing

- **Unit:** add `validateChatMessage` cases to `scripts/challenge-validation.test.mjs`:
  empty, whitespace-only, too long (> 200), control chars, HTML tag, whitespace
  normalization (newline -> space, collapsed runs), and a valid message.
- **Manual:** two browsers in one lobby; send both directions and confirm host + joiner
  both work; confirm the lobby-only guard returns 409 after Start; confirm the 429 path
  shows the inline error and keeps the text.
- **Gate before done:** `tsc`, lint, the challenge test scripts, and a build with a dummy
  `DATABASE_URL` (per the project's build requirement).

## 12. Files

**New (2):**
- `src/app/api/challenge/chat/route.ts`
- `src/components/challenge/LobbyChat.tsx`

**Edited (7):**
- `src/lib/realtime/events.ts`
- `src/lib/challenge/validation.ts`
- `src/lib/constants.ts`
- `src/hooks/useChallengeChannel.ts`
- `src/components/challenge/WaitingRoom.tsx`
- `src/app/provocare/[code]/page.tsx`
- `scripts/challenge-validation.test.mjs`

No DB migration, no schema change, no CSP change (the presence channel and `*.pusher.com`
allowance already exist).
