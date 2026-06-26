import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeLobbies, challengePlayers } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { generateToken, hashToken, hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";
import { validateName } from "@/lib/challenge/validation";
import { loadLobby, expireIfStale, getClientIp, buildStandings } from "@/lib/challenge/server";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`ch:join:${hashIp(ip)}`, RATE_LIMITS.challengeJoin);
  if (!rl.allowed) return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });

  let body: { code?: unknown; name?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Date invalide." }, { status: 400 }); }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code) return NextResponse.json({ error: "Cod invalid." }, { status: 400 });

  const nameCheck = validateName(body.name);
  if (!nameCheck.ok) return NextResponse.json({ error: nameCheck.error }, { status: 400 });

  const lobby = await loadLobby(code);
  if (!lobby) return NextResponse.json({ error: "Camera nu există." }, { status: 404 });
  if (await expireIfStale(lobby)) return NextResponse.json({ error: "Camera a expirat." }, { status: 410 });
  if (lobby.status !== "lobby") return NextResponse.json({ error: "Provocarea a început deja." }, { status: 409 });

  const cfg = lobby.config as { capacity: number };
  const [{ n }] = await db.select({ n: count() }).from(challengePlayers).where(eq(challengePlayers.lobbyCode, code));
  if (n >= cfg.capacity) return NextResponse.json({ error: "Camera este plină." }, { status: 409 });

  const playerToken = generateToken();
  let playerId: number;
  try {
    const inserted = await db.insert(challengePlayers).values({
      lobbyCode: code,
      playerTokenHash: hashToken(playerToken),
      name: nameCheck.name,
    }).returning({ id: challengePlayers.id });
    playerId = inserted[0].id;
  } catch (err) {
    // Unique(lobbyCode, name) violation -> name already taken in this room.
    console.error("challenge join error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Numele este deja folosit în această cameră." }, { status: 409 });
  }

  const snapshot = { status: lobby.status, mode: lobby.mode, config: lobby.config, standings: await buildStandings(code) };
  return NextResponse.json({ playerToken, playerId, name: nameCheck.name, snapshot }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
