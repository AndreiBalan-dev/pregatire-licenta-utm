import process from "node:process";
import assert from "node:assert/strict";
import { detectMilestones } from "../src/lib/challenge/milestones.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const base = {
  playerId: 1, name: "Ana", total: 4,
  beforeAnswered: 0, afterAnswered: 0,
  justFinished: false, anyoneFinishedBefore: false, becameLeader: false,
};

check("emits a 25% crossing when passing the threshold", () => {
  const m = detectMilestones({ ...base, beforeAnswered: 0, afterAnswered: 1 }); // 0% -> 25%
  assert.equal(m.filter((e) => e.type === "progress" && e.value === 25).length, 1);
});

check("does not re-emit a threshold already crossed", () => {
  const m = detectMilestones({ ...base, beforeAnswered: 1, afterAnswered: 2 }); // 25% -> 50%
  assert.equal(m.some((e) => e.value === 25), false);
  assert.equal(m.some((e) => e.value === 50), true);
});

check("first finisher emits first_finish, not just finished", () => {
  const m = detectMilestones({ ...base, beforeAnswered: 3, afterAnswered: 4, justFinished: true, anyoneFinishedBefore: false });
  assert.equal(m.some((e) => e.type === "first_finish"), true);
});

check("later finisher emits finished", () => {
  const m = detectMilestones({ ...base, beforeAnswered: 3, afterAnswered: 4, justFinished: true, anyoneFinishedBefore: true });
  assert.equal(m.some((e) => e.type === "finished"), true);
  assert.equal(m.some((e) => e.type === "first_finish"), false);
});

check("lead change emits lead_change", () => {
  const m = detectMilestones({ ...base, becameLeader: true });
  assert.equal(m.some((e) => e.type === "lead_change"), true);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
