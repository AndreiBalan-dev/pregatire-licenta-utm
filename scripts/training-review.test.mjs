import process from "node:process";
import assert from "node:assert/strict";
import { newestReviewIndex, navBack, navForward } from "../src/lib/training-review.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const live = (reviewLen, liveFeedback = false) => ({ reviewLen, reviewing: null, liveFeedback });
const review = (reviewLen, reviewing, liveFeedback = false) => ({ reviewLen, reviewing, liveFeedback });

check("newestReviewIndex: skips the just-answered question only when its feedback is shown", () => {
  assert.equal(newestReviewIndex(0, false), -1);
  assert.equal(newestReviewIndex(3, false), 2); // live unanswered: newest seen is the last
  assert.equal(newestReviewIndex(1, true), -1); // just answered the only question: nothing before it
  assert.equal(newestReviewIndex(3, true), 1);  // just answered last: review starts one before it
});

check("navBack from the live question enters review at the newest reviewable item", () => {
  assert.deepEqual(navBack(live(0)), { type: "none" });           // nothing seen yet
  assert.deepEqual(navBack(live(3)), { type: "review", index: 2 });
  assert.deepEqual(navBack(live(1, true)), { type: "none" });     // only question, its feedback shown
  assert.deepEqual(navBack(live(3, true)), { type: "review", index: 1 });
});

check("navBack while reviewing steps one older, and stops at the oldest", () => {
  assert.deepEqual(navBack(review(3, 2)), { type: "review", index: 1 });
  assert.deepEqual(navBack(review(3, 1)), { type: "review", index: 0 });
  assert.deepEqual(navBack(review(3, 0)), { type: "none" });
});

check("navForward on the live question: disabled until answered, then advances", () => {
  assert.deepEqual(navForward(live(3)), { type: "none" });        // unanswered: must answer first
  assert.deepEqual(navForward(live(3, true)), { type: "advance" }); // feedback shown: go next
  assert.deepEqual(navForward(live(0)), { type: "none" });
});

check("navForward while reviewing steps one newer, then returns to live at the newest", () => {
  // entered from live-unanswered (newest = len-1 = 2)
  assert.deepEqual(navForward(review(3, 0)), { type: "review", index: 1 });
  assert.deepEqual(navForward(review(3, 1)), { type: "review", index: 2 });
  assert.deepEqual(navForward(review(3, 2)), { type: "live" });
  // entered from live-feedback (newest = len-2 = 1): index 1 returns to live (feedback)
  assert.deepEqual(navForward(review(3, 0, true)), { type: "review", index: 1 });
  assert.deepEqual(navForward(review(3, 1, true)), { type: "live" });
});

check("sequence: walk back to the oldest and forward all the way to live (unanswered entry)", () => {
  // Live with 3 seen, unanswered. Walk back: 2 -> 1 -> 0 -> (stop).
  let s = live(3);
  let a = navBack(s); assert.deepEqual(a, { type: "review", index: 2 });
  s = review(3, a.index); a = navBack(s); assert.deepEqual(a, { type: "review", index: 1 });
  s = review(3, a.index); a = navBack(s); assert.deepEqual(a, { type: "review", index: 0 });
  s = review(3, a.index); assert.deepEqual(navBack(s), { type: "none" });
  // Forward back up: 0 -> 1 -> 2 -> live.
  a = navForward(review(3, 0)); assert.deepEqual(a, { type: "review", index: 1 });
  a = navForward(review(3, 1)); assert.deepEqual(a, { type: "review", index: 2 });
  assert.deepEqual(navForward(review(3, 2)), { type: "live" });
});

check("resurfacing case: a re-answered question is newest, so back skips it correctly", () => {
  // 4 distinct seen; the most recently answered (e.g. a resurfaced one) sits last
  // because seenIds is recency-ordered. With its feedback shown, back lands on
  // index 2 (the one answered before it), never on itself (index 3).
  assert.deepEqual(navBack(live(4, true)), { type: "review", index: 2 });
  // returning forward from index 2 goes back to the live feedback view.
  assert.deepEqual(navForward(review(4, 2, true)), { type: "live" });
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
