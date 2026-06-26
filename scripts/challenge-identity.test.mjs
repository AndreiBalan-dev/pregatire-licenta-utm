import process from "node:process";
import assert from "node:assert/strict";
import { saveIdentity, loadIdentity } from "../src/lib/challenge/identity.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

check("round-trips identity per code", () => {
  const s = fakeStorage();
  saveIdentity(s, "ABC", { playerToken: "p1", name: "Ana" });
  assert.deepEqual(loadIdentity(s, "ABC"), { playerToken: "p1", name: "Ana" });
});

check("merges new fields without dropping old ones", () => {
  const s = fakeStorage();
  saveIdentity(s, "ABC", { playerToken: "p1" });
  saveIdentity(s, "ABC", { hostToken: "h1" });
  assert.deepEqual(loadIdentity(s, "ABC"), { playerToken: "p1", hostToken: "h1" });
});

check("isolates codes and returns null when absent", () => {
  const s = fakeStorage();
  saveIdentity(s, "ABC", { playerToken: "p1" });
  assert.equal(loadIdentity(s, "XYZ"), null);
});

check("returns null on malformed JSON", () => {
  const s = fakeStorage();
  s.setItem("utm-provocare-BAD", "{not valid json");
  assert.equal(loadIdentity(s, "BAD"), null);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
