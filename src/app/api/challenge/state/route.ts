import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeAnswers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loadPlayerByToken, expireIfStale, buildStandings } from "@/lib/challenge/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = (url.searchParams.get("code") ?? "").trim();
  const token = url.searchParams.get("token") ?? "";
  if (!code || !token) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });

  const found = await loadPlayerByToken(code, token);
  if (!found) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
  const { lobby, player } = found;
  await expireIfStale(lobby);

  // Which questions this player already answered, and with what letter, so the UI
  // can render the locked state and resume at the first unanswered question.
  const answers = await db.select({
    questionId: challengeAnswers.questionId,
    selected: challengeAnswers.selected,
    isCorrect: challengeAnswers.isCorrect,
  }).from(challengeAnswers).where(eq(challengeAnswers.playerId, player.id));

  return NextResponse.json({
    status: lobby.status,
    mode: lobby.mode,
    config: lobby.config,
    questionIds: lobby.questionIds ?? null,
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
