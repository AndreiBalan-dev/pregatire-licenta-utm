import process from "node:process";
import assert from "node:assert/strict";
import { buildChallengeSummary, addChallengeToHistory } from "../src/lib/session-history.ts";
import { wrongIdsInChallenge } from "../src/lib/redo.ts";
import { foldChallengeAnswers } from "../src/lib/answer-merge.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

check("buildChallengeSummary: drops deleted ids, empty selected -> null, counts correct", () => {
  const s = buildChallengeSummary({
    code: "ABC123",
    questionOrder: [1, 2, 3, 4],
    answers: [
      { questionId: 1, selected: "a", isCorrect: true },
      { questionId: 2, selected: "b", isCorrect: false },
      { questionId: 3, selected: "", isCorrect: false }, // timed out
      // 4 deleted (exists=false)
    ],
    preset: "custom", scoring: "points", rank: 2, players: 3, durationMs: 12345,
    id: "sum-1", playedAt: "2026-06-29T10:00:00.000Z",
    exists: (id) => id !== 4,
  });
  assert.deepEqual(s.questionIds, [1, 2, 3]);
  assert.equal(s.total, 3);
  assert.equal(s.correctCount, 1);
  assert.deepEqual(s.answers, [
    { questionId: 1, selected: "a", isCorrect: true },
    { questionId: 2, selected: "b", isCorrect: false },
    { questionId: 3, selected: null, isCorrect: false },
  ]);
  assert.equal(s.rank, 2);
  assert.equal(s.players, 3);
  assert.equal(s.scoring, "points");
});

check("addChallengeToHistory: prepends, idempotent by code, capped", () => {
  const a = { code: "A", id: "1" };
  const b = { code: "B", id: "2" };
  const h1 = addChallengeToHistory([], a, 20);
  assert.deepEqual(h1.map((c) => c.code), ["A"]);
  const h2 = addChallengeToHistory(h1, b, 20);
  assert.deepEqual(h2.map((c) => c.code), ["B", "A"]);
  const h3 = addChallengeToHistory(h2, a, 20); // dup code -> unchanged
  assert.deepEqual(h3.map((c) => c.code), ["B", "A"]);
  const capped = addChallengeToHistory([{ code: "X" }, { code: "Y" }], { code: "Z" }, 2);
  assert.deepEqual(capped.map((c) => c.code), ["Z", "X"]);
});

check("wrongIdsInChallenge: wrong + unanswered in, correct out, unknown skipped, current key wins", () => {
  const s = {
    questionIds: [10, 20, 30, 40],
    answers: [
      { questionId: 10, selected: "a", isCorrect: true },
      { questionId: 20, selected: "b", isCorrect: false },
      { questionId: 30, selected: null, isCorrect: false }, // timed out
      // 40 unknown
    ],
  };
  const correctOf = (id) => ({ 10: "a", 20: "a", 30: "c" })[id]; // 40 -> undefined
  assert.deepEqual(wrongIdsInChallenge(s, correctOf), [20, 30]);
});

check("foldChallengeAnswers: lenient upgrade, never downgrade, skip null + unknown", () => {
  const merged = new Map([[1, { isCorrect: false }], [2, { isCorrect: true }]]);
  const history = [{
    code: "C1",
    answers: [
      { questionId: 1, selected: "a", isCorrect: true },   // upgrades 1 -> true
      { questionId: 2, selected: "x", isCorrect: false },  // wrong: must NOT downgrade 2
      { questionId: 3, selected: "a", isCorrect: true },   // new -> true
      { questionId: 4, selected: null, isCorrect: false }, // skip (unanswered)
      { questionId: 5, selected: "a", isCorrect: true },   // unknown question -> skip
    ],
  }];
  const correctOf = (id) => ({ 1: "a", 2: "a", 3: "a" })[id]; // 4,5 -> undefined
  foldChallengeAnswers(merged, history, correctOf);
  assert.equal(merged.get(1).isCorrect, true);
  assert.equal(merged.get(2).isCorrect, true);
  assert.equal(merged.get(3).isCorrect, true);
  assert.equal(merged.has(4), false);
  assert.equal(merged.has(5), false);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
