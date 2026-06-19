import process from "node:process";
import assert from "node:assert/strict";
import {
  seedBox, nextBox, intervalForBox, initSchedule, pickNext, applyAnswer, masteredCount,
  INTERVALS, NEW_SPACING, MASTERED_BOX, MAX_BOX,
} from "../src/lib/training.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const wrong = { isCorrect: false };
const right = { isCorrect: true };

check("seedBox: stored box wins, else history (correct->2, wrong->0), else new->1; stored is clamped", () => {
  assert.equal(seedBox(1, { 1: 3 }, {}), 3);
  assert.equal(seedBox(1, {}, { 1: right }), 2);
  assert.equal(seedBox(1, {}, { 1: wrong }), 0);
  assert.equal(seedBox(1, {}, {}), 1);
  assert.equal(seedBox(1, { 1: 9 }, {}), MAX_BOX);
  assert.equal(seedBox(1, { 1: -3 }, {}), 0);
});

check("nextBox: correct increments (capped at MAX_BOX), wrong resets to 0", () => {
  assert.equal(nextBox(0, true), 1);
  assert.equal(nextBox(4, true), 5);
  assert.equal(nextBox(5, true), 5);
  assert.equal(nextBox(3, false), 0);
  assert.equal(nextBox(0, false), 0);
});

check("intervalForBox maps to INTERVALS and clamps out-of-range", () => {
  assert.deepEqual([...INTERVALS], [2, 4, 8, 16, 32, 50]);
  assert.equal(intervalForBox(0), 2);
  assert.equal(intervalForBox(5), 50);
  assert.equal(intervalForBox(99), 50);
});

check("initSchedule: seen get INTERVALS[box]; new trickle at NEW_SPACING in pool order", () => {
  const due = initSchedule([1, 2, 3, 4], {}, { 1: wrong, 2: right });
  assert.equal(due[1], intervalForBox(0)); // 2
  assert.equal(due[2], intervalForBox(2)); // 8
  assert.equal(due[3], NEW_SPACING);       // 3 (1st new)
  assert.equal(due[4], 2 * NEW_SPACING);   // 6 (2nd new)
});

check("pickNext: smallest due wins, excludes lastQuestionId, tie-break weaker box then pool order", () => {
  const pool = [1, 2, 3];
  const due = { 1: 5, 2: 2, 3: 2 };
  const boxes = { 2: 4, 3: 0 };
  assert.equal(pickNext({ pool, due, seq: 0, lastQuestionId: null }, boxes, {}), 3);
  assert.equal(pickNext({ pool, due, seq: 0, lastQuestionId: 3 }, boxes, {}), 2);
  assert.equal(pickNext({ pool: [7], due: { 7: 1 }, seq: 0, lastQuestionId: 7 }, {}, {}), 7);
});

check("applyAnswer: correct pushes due out by the higher box, wrong brings it back in ~2", () => {
  const state = { pool: [1], due: { 1: 2 }, seq: 0, lastQuestionId: null };
  const c = applyAnswer(state, {}, {}, 1, true);
  assert.equal(c.seq, 1);
  assert.equal(c.box, 2);
  assert.equal(c.due[1], 1 + intervalForBox(2)); // 9
  const w = applyAnswer(state, {}, {}, 1, false);
  assert.equal(w.box, 0);
  assert.equal(w.due[1], 1 + intervalForBox(0)); // 3
});

check("masteredCount: counts questions whose effective box >= MASTERED_BOX", () => {
  assert.equal(MASTERED_BOX, 4);
  const boxes = { 1: 4, 2: 5, 3: 1 };
  assert.equal(masteredCount([1, 2, 3, 4], boxes, { 4: right }), 2);
});

check("behavioral: a freshly-wrong question returns within ~3 picks even with unseen remaining", () => {
  const pool = [1, 2, 3, 4, 5];
  const boxes = {};
  const answers = {};
  let state = { pool, due: initSchedule(pool, boxes, answers), seq: 0, lastQuestionId: null };
  const first = pickNext(state, boxes, answers);
  const r = applyAnswer(state, boxes, answers, first, false);
  boxes[first] = r.box;
  state = { pool, due: r.due, seq: r.seq, lastQuestionId: first };
  let seenAgain = -1;
  let last = first;
  for (let step = 1; step <= 3; step++) {
    const pick = pickNext({ ...state, lastQuestionId: last }, boxes, answers);
    if (pick === first) { seenAgain = step; break; }
    const rr = applyAnswer({ pool, due: state.due, seq: state.seq, lastQuestionId: last }, boxes, answers, pick, true);
    boxes[pick] = rr.box;
    state = { pool, due: rr.due, seq: rr.seq, lastQuestionId: pick };
    last = pick;
  }
  assert.ok(seenAgain >= 1 && seenAgain <= 3, `wrong question should reappear within 3 picks (got ${seenAgain})`);
});

check("behavioral: a fully-mastered question is never retired (finite due, still scheduled)", () => {
  const { due } = applyAnswer({ pool: [1], due: { 1: 0 }, seq: 10, lastQuestionId: null }, { 1: 5 }, {}, 1, true);
  assert.ok(Number.isFinite(due[1]));
  assert.equal(due[1], 11 + intervalForBox(5)); // 61, still comes back
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
