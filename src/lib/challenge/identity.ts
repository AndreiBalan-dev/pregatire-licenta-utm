export interface ChallengeIdentity {
  playerToken?: string;
  hostToken?: string;
  name?: string;
}

interface Storageish {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const keyFor = (code: string) => `utm-provocare-${code}`;

export function saveIdentity(storage: Storageish, code: string, id: ChallengeIdentity): void {
  const current = loadIdentity(storage, code) ?? {};
  storage.setItem(keyFor(code), JSON.stringify({ ...current, ...id }));
}

export function loadIdentity(storage: Storageish, code: string): ChallengeIdentity | null {
  const raw = storage.getItem(keyFor(code));
  if (!raw) return null;
  try { return JSON.parse(raw) as ChallengeIdentity; } catch { return null; }
}

// Browser convenience wrappers.
export function savePlayer(code: string, id: ChallengeIdentity): void {
  if (typeof window !== "undefined") saveIdentity(window.localStorage, code, id);
}
export function getIdentity(code: string): ChallengeIdentity | null {
  if (typeof window === "undefined") return null;
  return loadIdentity(window.localStorage, code);
}
