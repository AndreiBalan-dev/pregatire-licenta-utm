import { createHash, randomBytes } from "crypto";

export function generateSaveKey(): string {
  return randomBytes(9).toString("base64url");
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "utm-licenta-default-salt-change-me";
  return createHash("sha256").update(salt + ip).digest("hex");
}
