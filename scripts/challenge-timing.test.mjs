import process from "node:process";
import assert from "node:assert/strict";
import {
  getTimer,
  answerPoints,
  simulareAnswerPoints,
  scoringBudgetMs,
  totalDeadlineMs,
  totalRemainingSeconds,
  formatClock,
} from "../src/lib/challenge/timing.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const total = { mode: "total", totalSeconds: 600, perQuestionSeconds: 120 };
const perQ = { mode: "per_question", totalSeconds: 600, perQuestionSeconds: 120 };
const unlimited = { mode: "unlimited", totalSeconds: 600, perQuestionSeconds: 120 };

check("getTimer falls back to a default for an old config without a timer", () => {
  const t = getTimer({});
  assert.equal(t.mode, "total");
  assert.equal(t.totalSeconds, 600);
  assert.deepEqual(getTimer({ timer: perQ }), perQ);
  assert.equal(getTimer(null).mode, "total");
});

check("answerPoints: wrong answers score 0", () => {
  assert.equal(answerPoints(false, 0, 30000), 0);
  assert.equal(answerPoints(false, 1, 30000), 0);
});

check("answerPoints: instant correct earns the max", () => {
  assert.equal(answerPoints(true, 0, 30000), 1000);
});

check("answerPoints: at the budget it floors to the minimum correct points", () => {
  assert.equal(answerPoints(true, 30000, 30000), 500);
  assert.equal(answerPoints(true, 999999, 30000), 500); // past the budget never goes below the floor
});

check("answerPoints: halfway through the budget is about halfway down the range", () => {
  // 1000 down to 500 over the budget -> ~750 at the midpoint (rounded to 10).
  assert.equal(answerPoints(true, 15000, 30000), 750);
});

check("scoringBudgetMs: per-question uses its own seconds, total uses the reference", () => {
  assert.equal(scoringBudgetMs(perQ), 120000);
  assert.equal(scoringBudgetMs(total), 30000);
});

check("simulareAnswerPoints: flat 1 per correct, 0 otherwise (speed-independent)", () => {
  assert.equal(simulareAnswerPoints(true), 1);
  assert.equal(simulareAnswerPoints(false), 0);
});

check("unlimited timer: no deadline, no remaining, scores off the reference budget", () => {
  const start = new Date(1_000_000);
  assert.equal(totalDeadlineMs(unlimited, start), null);
  assert.equal(totalRemainingSeconds(unlimited, start, 1_000_000), null);
  assert.equal(scoringBudgetMs(unlimited), 30000);
});

check("totalDeadlineMs: only total mode with a start has a deadline", () => {
  const start = new Date(1_000_000);
  assert.equal(totalDeadlineMs(total, start), 1_000_000 + 600_000);
  assert.equal(totalDeadlineMs(perQ, start), null);
  assert.equal(totalDeadlineMs(total, null), null);
});

check("totalRemainingSeconds: counts down and never goes negative", () => {
  const start = new Date(1_000_000);
  assert.equal(totalRemainingSeconds(total, start, 1_000_000), 600);
  assert.equal(totalRemainingSeconds(total, start, 1_000_000 + 100_000), 500);
  assert.equal(totalRemainingSeconds(total, start, 1_000_000 + 999_999_999), 0);
  assert.equal(totalRemainingSeconds(perQ, start, 1_000_000), null);
});

check("formatClock formats m:ss with a zero-padded seconds field", () => {
  assert.equal(formatClock(600), "10:00");
  assert.equal(formatClock(65), "1:05");
  assert.equal(formatClock(9), "0:09");
  assert.equal(formatClock(0), "0:00");
  assert.equal(formatClock(-5), "0:00");
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
