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
