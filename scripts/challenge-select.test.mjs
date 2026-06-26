import process from "node:process";
import assert from "node:assert/strict";
import { pickChallengeQuestionIds, buildPlayerOrder } from "../src/lib/challenge/select.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const pool = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

check("picks exactly count ids, natural order when not shuffled", () => {
  assert.deepEqual(pickChallengeQuestionIds(pool, 3, false), [1, 2, 3]);
});

check("count larger than pool returns the whole pool", () => {
  assert.deepEqual(pickChallengeQuestionIds(pool, 99, false), [1, 2, 3, 4, 5]);
});

check("shuffle uses the injected shuffle fn", () => {
  const reverse = (arr) => [...arr].reverse();
  assert.deepEqual(pickChallengeQuestionIds(pool, 3, true, reverse), [5, 4, 3]);
});

check("buildPlayerOrder keeps the set when not shuffled", () => {
  assert.deepEqual(buildPlayerOrder([10, 20, 30], false), [10, 20, 30]);
});

check("buildPlayerOrder permutes via the injected fn but keeps the same members", () => {
  const reverse = (arr) => [...arr].reverse();
  const order = buildPlayerOrder([10, 20, 30], true, reverse);
  assert.deepEqual(order, [30, 20, 10]);
  assert.deepEqual([...order].sort((a, b) => a - b), [10, 20, 30]);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
