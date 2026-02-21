import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedSessions } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { generateSaveKey, hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateSessionData } from "@/lib/validation";
import { RATE_LIMITS, MAX_SESSIONS_PER_IP } from "@/lib/constants";

export async function POST(request: NextRequest) {
  // IP resolution — only trust x-real-ip (set by Vercel edge, not spoofable)
  const ip = request.headers.get("x-real-ip") || "unknown";
  if (ip === "unknown" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  const ipHashed = hashIp(ip);

  const rateCheck = checkRateLimit(`save:${ipHashed}`, RATE_LIMITS.save);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Prea multe cereri. Încearcă din nou mai târziu." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // Require Content-Length and reject oversized payloads
  const clHeader = request.headers.get("content-length");
  if (!clHeader) {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 411 });
  }
  const contentLength = parseInt(clHeader, 10);
  if (isNaN(contentLength) || contentLength > 600_000) {
    return NextResponse.json({ error: "Datele sunt prea mari." }, { status: 413 });
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  // Validate
  const validation = validateSessionData(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { displayName, sessionData, totalAnswered, totalCorrect } = validation.data!;

  // Check max sessions per IP to prevent abuse
  try {
    const [{ sessionCount }] = await db
      .select({ sessionCount: count() })
      .from(savedSessions)
      .where(eq(savedSessions.ipHash, ipHashed));

    if (sessionCount >= MAX_SESSIONS_PER_IP) {
      return NextResponse.json(
        { error: "Ai atins limita maximă de sesiuni salvate." },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error("Session count check error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Eroare internă." }, { status: 500 });
  }

  // Generate unique key
  const key = generateSaveKey();

  // Insert
  try {
    await db.insert(savedSessions).values({
      key,
      displayName: displayName || null,
      sessionData,
      totalAnswered,
      totalCorrect,
      ipHash: ipHashed,
    });
  } catch (error) {
    console.error("Save error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Eroare la salvare. Încearcă din nou." },
      { status: 500 }
    );
  }

  return NextResponse.json({ key }, {
    status: 201,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
