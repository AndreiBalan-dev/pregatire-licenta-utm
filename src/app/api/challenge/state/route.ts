import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeAnswers, challengePlayers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";
import { hashToken } from "@/lib/crypto";
import { loadPlayerByToken, expireIfStale, maybeFinishRunning, buildStandings } from "@/lib/challenge/server";
import { getTimer, totalRemainingSeconds } from "@/lib/challenge/timing";
import type { TimerConfig } from "@/lib/challenge/types";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = (url.searchParams.get("code") ?? "").trim();
  // The token is a bearer credential - read it from a header, never the query
  // string (URLs leak via history, Referer and proxy/edge logs). `code` is not
  // a secret, so it stays in the query.
  const token = request.headers.get("x-challenge-token") ?? "";
  if (!code || !token) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });

  const rl = checkRateLimit(`ch:state:${hashToken(token)}`, RATE_LIMITS.challengeState);
  if (!rl.allowed) return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });

  const found = await loadPlayerByToken(code, token);
  if (!found) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  const { lobby, player } = found;

  // Heartbeat: this player is connected right now, which keeps their grace window
  // open (so they don't get treated as "gone" while still on the page).
  await db.update(challengePlayers).set({ lastSeenAt: new Date() }).where(eq(challengePlayers.id, player.id));

  const expired = await expireIfStale(lobby);
  const justFinished = await maybeFinishRunning(lobby);
  const status = expired ? "expired" : justFinished ? "finished" : lobby.status;

  const timer = getTimer(lobby.config as { timer?: TimerConfig });

  // Which questions this player already answered, so the UI can resume at the
  // first unanswered question.
  const answers = await db.select({
    questionId: challengeAnswers.questionId,
    selected: challengeAnswers.selected,
    isCorrect: challengeAnswers.isCorrect,
  }).from(challengeAnswers).where(eq(challengeAnswers.playerId, player.id));

  return NextResponse.json({
    status,
    mode: lobby.mode,
    config: lobby.config,
    questionIds: lobby.questionIds ?? null,
    totalRemainingSeconds: status === "running" ? totalRemainingSeconds(timer, lobby.startedAt, Date.now()) : null,
    me: {
      playerId: player.id,
      name: player.name,
      isHost: player.isHost,
      questionOrder: player.questionOrder ?? null,
      optionOrder: player.optionOrder ?? null,
      answers,
    },
    standings: await buildStandings(code),
  }, { headers: { "Cache-Control": "no-store" } });
}
