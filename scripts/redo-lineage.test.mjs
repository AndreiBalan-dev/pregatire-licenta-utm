import process from "node:process";
import assert from "node:assert/strict";
import { buildRedoTargets } from "../src/lib/redo-lineage.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const roles = (targets) => targets.map((t) => t.role);
const lin = (origin, firstWrong, kind = "exam") => ({ origin: { kind, questionIds: origin }, firstWrong });
const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

check("no lineage: only wrong when present, else empty", () => {
  assert.deepEqual(buildRedoTargets({ wrongIds: [1, 2] }), [{ role: "wrong", ids: [1, 2] }]);
  assert.deepEqual(buildRedoTargets({ wrongIds: [] }), []);
});

check("level 1 (current == firstWrong): wrong + initial + full, all distinct", () => {
  const first = [1, 2, 3, 4, 5, 6, 7, 8];
  const t = buildRedoTargets({ wrongIds: [1, 2, 3, 4, 5], lineage: lin(range(36), first) });
  assert.deepEqual(roles(t), ["wrong", "initial", "full"]);
  assert.deepEqual(t[0].ids, [1, 2, 3, 4, 5]);
  assert.deepEqual(t[1].ids, first);
  assert.equal(t[2].ids.length, 36);
});

check("level 2+ (current != firstWrong): initial stays the original set", () => {
  const first = [1, 2, 3, 4, 5, 6, 7, 8];
  const t = buildRedoTargets({ wrongIds: [1, 2, 3], lineage: lin(range(36), first) });
  assert.deepEqual(roles(t), ["wrong", "initial", "full"]);
  assert.deepEqual(t[1].ids, first);
});

check("100% (no wrong): initial is primary, then full", () => {
  const first = [1, 2, 3, 4, 5, 6, 7, 8];
  const t = buildRedoTargets({ wrongIds: [], lineage: lin(range(36), first) });
  assert.deepEqual(roles(t), ["initial", "full"]);
  assert.deepEqual(t[0].ids, first);
});

check("all-wrong origin (firstWrong == origin): initial omitted", () => {
  const t = buildRedoTargets({ wrongIds: [1, 2], lineage: lin([1, 2, 3, 4], [1, 2, 3, 4]) });
  assert.deepEqual(roles(t), ["wrong", "full"]);
});

check("wrong == initial (same set, any order): dedup keeps wrong, drops initial", () => {
  const t = buildRedoTargets({ wrongIds: [3, 2, 1], lineage: lin(range(10), [1, 2, 3]) });
  assert.deepEqual(roles(t), ["wrong", "full"]);
});

check("practice origin works the same", () => {
  const t = buildRedoTargets({ wrongIds: [1], lineage: lin([1, 2, 3], [1, 2], "practice") });
  assert.deepEqual(roles(t), ["wrong", "initial", "full"]);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
