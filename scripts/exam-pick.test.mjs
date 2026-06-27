import process from "node:process";
import assert from "node:assert/strict";
import {
  pickExamQuestions,
  EXAM_QUESTIONS_PER_MODULE,
  EXAM_TOTAL_QUESTIONS,
} from "../src/lib/exam.ts";

// pickExamQuestions powers both the solo Simulator and the Provocare "simulare"
// preset, so its module/subject balance is load-bearing for both.

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

// 4 modules with varied subject counts (1, 2, 3, 2). Every subject has plenty
// of questions so the per-module distribution never has to top up.
const modules = [
  { id: "m1", subjects: [{ id: "s1" }, { id: "s2" }] },
  { id: "m2", subjects: [{ id: "s3" }] },
  { id: "m3", subjects: [{ id: "s4" }, { id: "s5" }, { id: "s6" }] },
  { id: "m4", subjects: [{ id: "s7" }, { id: "s8" }] },
];

const questionsBySubject = {};
const subjectOfId = new Map();
let base = 1000;
for (const mod of modules) {
  for (const s of mod.subjects) {
    questionsBySubject[s.id] = [];
    for (let i = 0; i < 15; i++) {
      const id = base + i;
      questionsBySubject[s.id].push({ id });
      subjectOfId.set(id, { subject: s.id, module: mod.id });
    }
    base += 1000;
  }
}

check("picks exactly 36 (9 per module across 4 modules)", () => {
  const ids = pickExamQuestions(modules, questionsBySubject);
  assert.equal(EXAM_QUESTIONS_PER_MODULE, 9);
  assert.equal(EXAM_TOTAL_QUESTIONS, 36);
  assert.equal(ids.length, 36);
});

check("distributes exactly 9 questions to each module", () => {
  const ids = pickExamQuestions(modules, questionsBySubject);
  const perModule = {};
  for (const id of ids) {
    const m = subjectOfId.get(id).module;
    perModule[m] = (perModule[m] ?? 0) + 1;
  }
  assert.deepEqual(perModule, { m1: 9, m2: 9, m3: 9, m4: 9 });
});

check("never repeats a question", () => {
  const ids = pickExamQuestions(modules, questionsBySubject);
  assert.equal(new Set(ids).size, ids.length);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
