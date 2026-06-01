import process from "node:process";
import assert from "node:assert/strict";
import { selectPracticeQuestionIds } from "../src/lib/practice.ts";

// Deterministic stand-in for the random shuffle so we can assert exact order.
const reverseShuffle = (arr) => [...arr].reverse();

const makePool = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));
const range = (start, count) => Array.from({ length: count }, (_, i) => start + i);

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failures++;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err && err.message ? err.message : err}`);
  }
}

// The reported bug: with 58 questions, shuffle + a 25-question batch only
// reordered the FIRST 25; "late" questions were never reachable.
check(
  "shuffle picks from the WHOLE pool, then slices (regression)",
  () => {
    const pool = makePool(58); // ids 1..58, none answered
    const result = selectPracticeQuestionIds(
      pool,
      { onlyUnanswered: false, shuffle: true, batchSize: 25 },
      () => false,
      reverseShuffle,
    );
    // reverse([1..58]) -> [58..1]; slice(0,25) -> [58, 57, ..., 34]
    assert.equal(result.length, 25);
    assert.deepEqual(result, range(34, 25).reverse());
    assert.ok(result.includes(58), "a late question must be reachable");
    assert.ok(
      result.every((id) => id >= 34),
      "selection must come from the shuffled full pool",
    );
  },
);

check("no shuffle: unanswered-first ordering is preserved, then sliced", () => {
  const pool = makePool(58);
  const answered = new Set(range(1, 40)); // ids 1..40 answered
  const result = selectPracticeQuestionIds(
    pool,
    { onlyUnanswered: false, shuffle: false, batchSize: 25 },
    (id) => answered.has(id),
  );
  // unanswered 41..58 (18) first, then answered 1..7 -> 25 total
  assert.deepEqual(result, [...range(41, 18), ...range(1, 7)]);
});

check("onlyUnanswered filters the pool; null batchSize keeps all remaining", () => {
  const pool = makePool(58);
  const answered = new Set(range(1, 40));
  const result = selectPracticeQuestionIds(
    pool,
    { onlyUnanswered: true, shuffle: false, batchSize: null },
    (id) => answered.has(id),
  );
  assert.deepEqual(result, range(41, 18)); // 41..58
});

check("batchSize larger than pool returns the whole (shuffled) pool", () => {
  const pool = makePool(5);
  const result = selectPracticeQuestionIds(
    pool,
    { onlyUnanswered: false, shuffle: true, batchSize: 25 },
    () => false,
    reverseShuffle,
  );
  assert.deepEqual(result, range(1, 5).reverse());
});

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log("\nAll tests passed");
