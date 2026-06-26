import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeLobbies, challengePlayers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/crypto";
import { questionsBySubject, getQuestion } from "@/data";
import { buildOptionOrders } from "@/lib/practice";
import { pickChallengeQuestionIds, buildPlayerOrder } from "@/lib/challenge/select";
import { loadLobby } from "@/lib/challenge/server";
import { publishToLobby } from "@/lib/realtime/pusher-server";
import { EVENTS, type RoundStartedPayload } from "@/lib/realtime/events";
import type { ChallengeConfig } from "@/lib/challenge/types";

export async function POST(request: NextRequest) {
  let body: { code?: unknown; hostToken?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Date invalide." }, { status: 400 }); }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const hostToken = typeof body.hostToken === "string" ? body.hostToken : "";
  if (!code || !hostToken) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });

  const lobby = await loadLobby(code);
  if (!lobby) return NextResponse.json({ error: "Camera nu există." }, { status: 404 });
  if (lobby.hostTokenHash !== hashToken(hostToken)) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  if (lobby.status !== "lobby") return NextResponse.json({ error: "Deja pornită." }, { status: 409 });

  const config = lobby.config as ChallengeConfig;

  // Build the canonical question set from the chosen subjects.
  const pool = config.subjectIds.flatMap((s) => questionsBySubject[s] ?? []);
  const questionIds = pickChallengeQuestionIds(pool, config.questionCount, config.shuffleOrder);
  if (questionIds.length === 0) return NextResponse.json({ error: "Nu există întrebări." }, { status: 400 });

  // Per-player order + option order.
  const players = await db.select().from(challengePlayers).where(eq(challengePlayers.lobbyCode, code));
  if (players.length === 0) {
    return NextResponse.json({ error: "Nu sunt jucători în cameră." }, { status: 400 });
  }
  const setQuestions = questionIds.map((id) => getQuestion(id)!).filter(Boolean);

  // Neon's HTTP driver has no transaction support, so we write sequentially.
  // Players are updated first and the lobby is flipped to "running" last, so a
  // partial failure leaves the lobby joinable (status stays "lobby") and the
  // host can press Start again.
  for (const p of players) {
    const order = buildPlayerOrder(questionIds, config.shuffleOrder);
    const optionOrder = config.shuffleOptions ? buildOptionOrders(setQuestions) : {};
    await db.update(challengePlayers)
      .set({ questionOrder: order, optionOrder })
      .where(eq(challengePlayers.id, p.id));
  }

  await db.update(challengeLobbies)
    .set({ questionIds, status: "running", startedAt: new Date(), updatedAt: new Date() })
    .where(eq(challengeLobbies.code, code));

  const payload: RoundStartedPayload = { totalQuestions: questionIds.length };
  await publishToLobby(code, EVENTS.ROUND_STARTED, payload);

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
