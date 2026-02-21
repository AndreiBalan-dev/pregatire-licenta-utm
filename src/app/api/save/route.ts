import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedSessions } from "@/db/schema";
import { generateSaveKey, hashIp } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateSessionData } from "@/lib/validation";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
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
    console.error("Save error:", error);
    return NextResponse.json(
      { error: "Eroare la salvare. Încearcă din nou." },
      { status: 500 }
    );
  }

  return NextResponse.json({ key }, { status: 201 });
}
