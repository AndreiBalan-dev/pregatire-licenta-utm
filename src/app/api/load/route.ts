import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateSaveKey } from "@/lib/validation";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  // IP resolution - only trust x-real-ip (set by Vercel edge, not spoofable)
  const ip = request.headers.get("x-real-ip") || "unknown";
  if (ip === "unknown" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  const ipHashed = hashIp(ip);

  const rateCheck = checkRateLimit(`load:${ipHashed}`, RATE_LIMITS.load);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Prea multe cereri. Încearcă din nou mai târziu." },
      { status: 429 }
    );
  }

  // Parse body
  let body: { key?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key.trim() : "";

  if (!validateSaveKey(key)) {
    return NextResponse.json({ error: "Cheie invalidă." }, { status: 400 });
  }

  // Lookup
  try {
    const result = await db
      .select({
        displayName: savedSessions.displayName,
        sessionData: savedSessions.sessionData,
        totalAnswered: savedSessions.totalAnswered,
        totalCorrect: savedSessions.totalCorrect,
        createdAt: savedSessions.createdAt,
      })
      .from(savedSessions)
      .where(eq(savedSessions.key, key))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Sesiunea nu a fost găsită." },
        { status: 404 }
      );
    }

    const session = result[0];

    return NextResponse.json({
      displayName: session.displayName,
      sessionData: session.sessionData,
      totalAnswered: session.totalAnswered,
      totalCorrect: session.totalCorrect,
      savedAt: session.createdAt,
    }, {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Load error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Eroare la încărcare." },
      { status: 500 }
    );
  }
}
