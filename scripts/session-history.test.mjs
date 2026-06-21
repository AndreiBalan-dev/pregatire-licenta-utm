import process from "node:process";
import assert from "node:assert/strict";
import { computePracticeSummary, computeTrainingSummary, sortSessionHistory } from "../src/lib/session-history.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const A = (answeredAt, isCorrect, timeSpentMs = 1000) => ({ selected: "a", isCorrect, answeredAt, timeSpentMs });

check("computePracticeSummary: counts this-session answers, splits correct/wrong, sums time, groups per module", () => {
  const practice = { questionIds: [1, 2, 3, 4], startedAt: "2026-06-21T10:00:00.000Z", mode: "practice", subjectIds: ["s1"] };
  const answers = {
    1: A("2026-06-21T10:01:00.000Z", true, 2000),
    2: A("2026-06-21T10:02:00.000Z", false, 3000),
    3: A("2026-06-20T09:00:00.000Z", true, 5000), // before session -> ignored
    // 4 never answered -> ignored
  };
  const mod = (id) => ({ 1: "m1", 2: "m1", 3: "m2", 4: "m2" })[id];
  const s = computePracticeSummary(practice, answers, mod, "pid", "2026-06-21T10:05:00.000Z");
  assert.equal(s.id, "pid");
  assert.equal(s.endedAt, "2026-06-21T10:05:00.000Z");
  assert.equal(s.mode, "practice");
  assert.deepEqual(s.questionIds, [1, 2, 3, 4]);
  assert.equal(s.answered, 2);
  assert.equal(s.correct, 1);
  assert.equal(s.wrong, 1);
  assert.equal(s.durationMs, 5000); // 2000 + 3000 (q3 excluded)
  assert.deepEqual(s.perModule, { m1: { correct: 1, total: 2 } });
});

check("computePracticeSummary: zero in-session answers -> answered 0, empty perModule", () => {
  const practice = { questionIds: [1], startedAt: "2026-06-21T10:00:00.000Z", mode: "test", subjectIds: [] };
  const s = computePracticeSummary(practice, {}, () => "m1", "x", "t");
  assert.equal(s.answered, 0);
  assert.equal(s.durationMs, 0);
  assert.deepEqual(s.perModule, {});
});

check("computeTrainingSummary: copies fields, seenCount from seenIds, passes masteredAtEnd", () => {
  const training = { subjectIds: ["s1", "s2"], pool: [1, 2, 3, 4, 5], seenIds: [1, 2, 3], answeredCount: 4, correctCount: 3, startedAt: "2026-06-21T09:00:00.000Z" };
  const s = computeTrainingSummary(training, 2, "tid", "2026-06-21T09:30:00.000Z");
  assert.equal(s.id, "tid");
  assert.deepEqual(s.subjectIds, ["s1", "s2"]);
  assert.equal(s.seenCount, 3);
  assert.equal(s.answeredCount, 4);
  assert.equal(s.correctCount, 3);
  assert.equal(s.masteredAtEnd, 2);
  assert.equal(s.poolSize, 5);
});

check("sortSessionHistory: newest first across all three types", () => {
  const entries = [
    { kind: "practice", date: "2026-06-21T10:00:00.000Z", practice: {} },
    { kind: "exam", date: "2026-06-21T12:00:00.000Z", exam: {}, questionIds: [] },
    { kind: "training", date: "2026-06-21T11:00:00.000Z", training: {} },
  ];
  assert.deepEqual(sortSessionHistory(entries).map((e) => e.kind), ["exam", "training", "practice"]);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
