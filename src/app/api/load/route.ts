import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateSaveKey } from "@/lib/validation";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
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
      .select()
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
    });
  } catch (error) {
    console.error("Load error:", error);
    return NextResponse.json(
      { error: "Eroare la încărcare." },
      { status: 500 }
    );
  }
}
