import process from "node:process";
import assert from "node:assert/strict";
import { wrongIdsInPractice, wrongIdsInExam } from "../src/lib/redo.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const A = (answeredAt, isCorrect) => ({ selected: "a", isCorrect, answeredAt, timeSpentMs: 0 });

check("wrongIdsInPractice: only this-session, answered-and-wrong, existing questions", () => {
  const practice = { questionIds: [1, 2, 3, 4, 5], startedAt: "2026-06-16T10:00:00.000Z" };
  const answers = {
    1: A("2026-06-16T10:01:00.000Z", false), // wrong, this session -> in
    2: A("2026-06-16T10:02:00.000Z", true),  // correct -> out
    3: A("2026-06-16T09:00:00.000Z", false), // wrong but BEFORE session -> out
    4: A("2026-06-16T10:03:00.000Z", false), // wrong, this session, but missing question -> out
    // 5: never answered -> out
  };
  const exists = (id) => id !== 4;
  assert.deepEqual(wrongIdsInPractice(practice, answers, exists), [1]);
});

check("wrongIdsInExam: missing OR incorrect count as wrong; unknown questions skipped", () => {
  const exam = { questionIds: [10, 20, 30, 40], answers: { 10: "a", 20: "b" } };
  // correct: 10->a (right), 20->a (so 20 wrong), 30 missing (wrong), 40 unknown (skip)
  const correctOf = (id) => ({ 10: "a", 20: "a", 30: "c" })[id];
  assert.deepEqual(wrongIdsInExam(exam, correctOf), [20, 30]);
});

check("empty inputs -> empty arrays", () => {
  assert.deepEqual(wrongIdsInPractice({ questionIds: [], startedAt: "x" }, {}, () => true), []);
  assert.deepEqual(wrongIdsInExam({ questionIds: [], answers: {} }, () => "a"), []);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
