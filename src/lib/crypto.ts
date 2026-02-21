import { createHash, randomBytes } from "crypto";

export function generateSaveKey(): string {
  // 16 bytes = 128 bits of entropy, base64url encoded = 22 chars
  return randomBytes(16).toString("base64url");
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("IP_HASH_SALT environment variable is required in production");
    }
    // Dev fallback only
    return createHash("sha256").update("dev-salt" + ip).digest("hex");
  }
  return createHash("sha256").update(salt + ip).digest("hex");
}
