import process from "node:process";
import assert from "node:assert/strict";
import { generateToken, hashToken } from "../src/lib/crypto.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

check("generateToken returns a long url-safe string", () => {
  const t = generateToken();
  assert.ok(t.length >= 32, "token too short");
  assert.match(t, /^[A-Za-z0-9_-]+$/);
});

check("generateToken is unique across calls", () => {
  assert.notEqual(generateToken(), generateToken());
});

check("hashToken is stable and 64 hex chars", () => {
  const h1 = hashToken("abc");
  const h2 = hashToken("abc");
  assert.equal(h1, h2);
  assert.match(h1, /^[a-f0-9]{64}$/);
});

check("hashToken differs for different inputs", () => {
  assert.notEqual(hashToken("abc"), hashToken("abd"));
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
