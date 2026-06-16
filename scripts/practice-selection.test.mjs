import process from "node:process";
import assert from "node:assert/strict";
import { selectPracticeQuestionIds, buildOptionOrders } from "../src/lib/practice.ts";
import { remapExplanationForOrder } from "../src/lib/explanation.ts";

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

// ---- buildOptionOrders (answer-option shuffle) ----

check("buildOptionOrders shuffles each question's options, keyed by id", () => {
  const orders = buildOptionOrders(
    [{ id: 10 }, { id: 20 }],
    reverseShuffle,
  );
  // reverse(["a","b","c","d"]) -> ["d","c","b","a"]
  assert.deepEqual(orders[10], ["d", "c", "b", "a"]);
  assert.deepEqual(orders[20], ["d", "c", "b", "a"]);
});

check("buildOptionOrders keeps natural order for lockOptions questions", () => {
  const orders = buildOptionOrders(
    [{ id: 1, lockOptions: true }, { id: 2 }],
    reverseShuffle,
  );
  assert.deepEqual(orders[1], ["a", "b", "c", "d"]); // locked: untouched
  assert.deepEqual(orders[2], ["d", "c", "b", "a"]); // shuffled
});

check("buildOptionOrders always returns a permutation of the four keys", () => {
  const orders = buildOptionOrders([{ id: 7 }]); // real random shuffle
  assert.deepEqual([...orders[7]].sort(), ["a", "b", "c", "d"]);
});

// ---- remapExplanationForOrder (letters follow the shuffle) ----

const SAMPLE_EXP =
  "Corect: b\n\n" +
  "`double x[100];` declară un vector. Vezi a doua variantă.\n\n" +
  "De ce nu celelalte:\n" +
  "• a - `x=float[100];` nu este sintaxă validă\n" +
  "• c - `floating` nu există ca tip de date în C\n" +
  "• d - `real` nu este tip în C";

check("remapExplanationForOrder: identity order leaves the text untouched", () => {
  assert.equal(remapExplanationForOrder(SAMPLE_EXP, ["a", "b", "c", "d"]), SAMPLE_EXP);
  assert.equal(remapExplanationForOrder(SAMPLE_EXP, undefined), SAMPLE_EXP);
});

check("remapExplanationForOrder: header + bullet leaders follow the new positions", () => {
  // order ["c","a","b","d"] => c→a, a→b, b→c, d→d
  const out = remapExplanationForOrder(SAMPLE_EXP, ["c", "a", "b", "d"]);
  const lines = out.split("\n");
  assert.equal(lines[0], "Corect: c"); // original correct "b" now sits at position C
  // bullets are sorted into A-D order by their NEW letter
  const bullets = lines.filter((l) => l.startsWith("•"));
  assert.deepEqual(bullets, [
    "• a - `floating` nu există ca tip de date în C", // was c
    "• b - `x=float[100];` nu este sintaxă validă", // was a
    "• d - `real` nu este tip în C", // was d
  ]);
});

check("remapExplanationForOrder: prose letters (Romanian 'a', code, 'în C') are untouched", () => {
  const out = remapExplanationForOrder(SAMPLE_EXP, ["c", "a", "b", "d"]);
  assert.ok(out.includes("Vezi a doua variantă."), "the word 'a' in prose stays");
  assert.ok(out.includes("nu există ca tip de date în C"), "'în C' stays");
  assert.ok(out.includes("`x=float[100];`"), "code spans stay");
});

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log("\nAll tests passed");
