import { createHmac, randomBytes } from "crypto";

export function generateSaveKey(): string {
  return randomBytes(16).toString("base64url");
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("IP_HASH_SALT environment variable is required in production");
    }
    return createHmac("sha256", "dev-salt").update(ip).digest("hex");
  }
  return createHmac("sha256", salt).update(ip).digest("hex");
}

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

// Short, shareable lobby code. Uppercase letters + digits with the ambiguous
// ones (0/O/1/I/L) removed so it reads cleanly out loud and in a URL. 6 chars
// over a 31-symbol alphabet ~= 887M combinations; the create route retries on
// the rare collision. The code is not a secret - the per-player token is.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function generateChallengeCode(length = 6): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

export function hashToken(token: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("IP_HASH_SALT environment variable is required in production");
    }
    return createHmac("sha256", "dev-salt").update(token).digest("hex");
  }
  return createHmac("sha256", salt).update(token).digest("hex");
}
