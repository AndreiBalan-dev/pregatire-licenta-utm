import process from "node:process";
import assert from "node:assert/strict";
import { orderedOptionKeys } from "../src/lib/options.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const q = { options: { a: "A", b: "B", c: "C", d: "D" } };

check("default order when no optionOrder", () => assert.deepEqual(orderedOptionKeys(q), ["a", "b", "c", "d"]));
check("honors a full 4-key permutation", () => assert.deepEqual(orderedOptionKeys(q, ["c", "a", "d", "b"]), ["c", "a", "d", "b"]));
check("falls back when order is malformed/short", () => assert.deepEqual(orderedOptionKeys(q, ["c", "a"]), ["a", "b", "c", "d"]));

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
