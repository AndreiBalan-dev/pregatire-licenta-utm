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
