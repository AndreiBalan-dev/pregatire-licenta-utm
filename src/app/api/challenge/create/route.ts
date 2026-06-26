import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challengeLobbies, challengePlayers } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { generateChallengeCode, generateToken, hashToken, hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS, CHALLENGE } from "@/lib/constants";
import { validateCreateConfig, validateName } from "@/lib/challenge/validation";
import { questionsBySubject } from "@/data";
import { getClientIp, isUniqueViolation } from "@/lib/challenge/server";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (ip === "unknown" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  const ipHashed = hashIp(ip);

  const rl = checkRateLimit(`ch:create:${ipHashed}`, RATE_LIMITS.challengeCreate);
  if (!rl.allowed) return NextResponse.json({ error: "Prea multe cereri." }, { status: 429 });

  let body: { config?: unknown; hostName?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Date invalide." }, { status: 400 }); }

  const validSubjects = new Set(Object.keys(questionsBySubject));
  const cfg = validateCreateConfig(body.config, validSubjects);
  if (!cfg.ok) return NextResponse.json({ error: cfg.error }, { status: 400 });

  // Phase 1 ships self-paced only.
  if (cfg.config.mode !== "self_paced") {
    return NextResponse.json({ error: "Modul live va fi disponibil în curând." }, { status: 400 });
  }

  if (!cfg.config.hostPlays) {
    return NextResponse.json({ error: "Gazda trebuie să participe la această versiune." }, { status: 400 });
  }

  // Ensure the chosen subjects actually have enough questions for the count.
  const poolSize = cfg.config.subjectIds.reduce((n, s) => n + (questionsBySubject[s]?.length ?? 0), 0);
  if (poolSize === 0) return NextResponse.json({ error: "Materiile alese nu au întrebări." }, { status: 400 });

  const [{ n }] = await db.select({ n: count() }).from(challengeLobbies).where(eq(challengeLobbies.ipHash, ipHashed));
  if (n >= CHALLENGE.MAX_LOBBIES_PER_IP) {
    return NextResponse.json({ error: "Ai atins limita de camere create." }, { status: 429 });
  }

  // Validate the host name before creating anything, so an invalid name cannot
  // leave an orphan lobby that still counts against the per-IP quota.
  let hostName: string | null = null;
  if (cfg.config.hostPlays) {
    const nameCheck = validateName(body.hostName);
    if (!nameCheck.ok) return NextResponse.json({ error: nameCheck.error }, { status: 400 });
    hostName = nameCheck.name;
  }

  const hostToken = generateToken();

  try {
    // Short shareable code; retry on the rare PK collision (no transaction needed).
    let code = "";
    let lobbyInserted = false;
    for (let attempt = 0; attempt < 8 && !lobbyInserted; attempt++) {
      code = generateChallengeCode();
      try {
        await db.insert(challengeLobbies).values({
          code,
          hostTokenHash: hashToken(hostToken),
          mode: cfg.config.mode,
          status: "lobby",
          config: cfg.config,
          ipHash: ipHashed,
        });
        lobbyInserted = true;
      } catch (e: unknown) {
        if (isUniqueViolation(e)) continue; // code taken, try another
        throw e;
      }
    }
    if (!lobbyInserted) {
      return NextResponse.json({ error: "Eroare la creare. Mai încearcă." }, { status: 500 });
    }

    let playerToken: string | null = null;
    if (hostName) {
      playerToken = generateToken();
      await db.insert(challengePlayers).values({
        lobbyCode: code,
        playerTokenHash: hashToken(playerToken),
        name: hostName,
        isHost: true,
      });
    }

    return NextResponse.json({ code, hostToken, playerToken }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("challenge create error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Eroare la creare." }, { status: 500 });
  }
}
