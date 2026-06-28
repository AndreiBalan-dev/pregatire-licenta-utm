import process from "node:process";
import assert from "node:assert/strict";
import { checkRateLimit, MAX_ENTRIES } from "../src/lib/rate-limit.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const cfg = { windowMs: 60_000, maxRequests: 3 };

check("allows up to maxRequests, then blocks", () => {
  const id = "basic:user-1";
  assert.equal(checkRateLimit(id, cfg).allowed, true);   // 1
  assert.equal(checkRateLimit(id, cfg).allowed, true);   // 2
  const third = checkRateLimit(id, cfg);                 // 3
  assert.equal(third.allowed, true);
  assert.equal(third.remaining, 0);
  assert.equal(checkRateLimit(id, cfg).allowed, false);  // 4 -> blocked
});

check("separate identifiers have independent buckets", () => {
  assert.equal(checkRateLimit("basic:a", cfg).remaining, cfg.maxRequests - 1);
  assert.equal(checkRateLimit("basic:b", cfg).remaining, cfg.maxRequests - 1);
  // 'a' again decrements only 'a'
  assert.equal(checkRateLimit("basic:a", cfg).remaining, cfg.maxRequests - 2);
});

check("map is bounded: rotating keys evicts the oldest (no unbounded growth)", () => {
  const victim = "evict:victim";
  // First touch: victim becomes a live entry with count 1.
  assert.equal(checkRateLimit(victim, cfg).remaining, cfg.maxRequests - 1);
  // Flood past the cap with unique keys (what a token-rotating attacker does).
  for (let i = 0; i < MAX_ENTRIES + 100; i++) checkRateLimit(`evict:flood-${i}`, cfg);
  // Re-touching victim returns a FRESH bucket (remaining = max-1). If the map
  // were unbounded, victim's old entry would survive and this would be max-2.
  assert.equal(checkRateLimit(victim, cfg).remaining, cfg.maxRequests - 1);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
