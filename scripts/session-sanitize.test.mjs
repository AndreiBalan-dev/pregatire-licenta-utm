import process from "node:process";
import assert from "node:assert/strict";
import { sanitizeLoadedSession } from "../src/lib/session-sanitize.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

// "353" stands in for any question removed from the data (e.g. a deleted duplicate).
const exists = (id) => id !== 353;

function baseSession(overrides = {}) {
  return {
    version: 1,
    startedAt: "x",
    lastActiveAt: "x",
    answers: {},
    bookmarks: [],
    currentPractice: null,
    currentExam: null,
    examHistory: [],
    subjectStats: {},
    settings: {},
    savedKey: null,
    trainingBoxes: {},
    currentTraining: null,
    ...overrides,
  };
}

function training(overrides = {}) {
  return {
    subjectIds: ["s"],
    pool: [100, 353, 200],
    due: { 100: 2, 353: 1, 200: 6 },
    seq: 3,
    currentQuestionId: 353,
    lastQuestionId: 100,
    seenIds: [100, 353],
    answeredCount: 2,
    correctCount: 1,
    startedAt: "x",
    shuffleOptions: false,
    ...overrides,
  };
}

check("training: dead currentQuestionId is repaired to a valid pool member", () => {
  const out = sanitizeLoadedSession(baseSession({ currentTraining: training() }), exists);
  const t = out.currentTraining;
  assert.ok(exists(t.currentQuestionId), "repaired current must exist");
  assert.ok(t.pool.includes(t.currentQuestionId), "repaired current must be in pool");
});

check("training: dead ids are pruned from pool, seenIds and due", () => {
  const out = sanitizeLoadedSession(baseSession({ currentTraining: training() }), exists);
  const t = out.currentTraining;
  assert.deepEqual(t.pool, [100, 200]);
  assert.deepEqual(t.seenIds, [100]);
  assert.equal(t.due[353], undefined);
});

check("training: dead lastQuestionId is cleared to null", () => {
  const out = sanitizeLoadedSession(
    baseSession({ currentTraining: training({ currentQuestionId: 100, lastQuestionId: 353 }) }),
    exists,
  );
  assert.equal(out.currentTraining.lastQuestionId, null);
});

check("training: empty pool after pruning nulls the session", () => {
  const out = sanitizeLoadedSession(
    baseSession({ currentTraining: training({ pool: [353], due: { 353: 1 }, currentQuestionId: 353, lastQuestionId: null, seenIds: [353] }) }),
    exists,
  );
  assert.equal(out.currentTraining, null);
});

check("training: a healthy session is returned by identity (no churn)", () => {
  const s = baseSession({ currentTraining: training({ pool: [100, 200], due: { 100: 2, 200: 6 }, currentQuestionId: 100, lastQuestionId: 200, seenIds: [100] }) });
  assert.equal(sanitizeLoadedSession(s, exists), s);
});

check("practice: dead id is removed and current question is preserved", () => {
  const practice = {
    subjectIds: ["s"], questionIds: [10, 353, 20, 30], currentIndex: 2, mode: "practice",
    startedAt: "x", batchSize: null,
  };
  const out = sanitizeLoadedSession(baseSession({ currentPractice: practice }), exists);
  const p = out.currentPractice;
  assert.deepEqual(p.questionIds, [10, 20, 30]);
  // currentIndex 2 pointed at id 20; after dropping 353 it must still point at 20.
  assert.equal(p.questionIds[p.currentIndex], 20);
});

check("practice: all-dead question set nulls the session", () => {
  const practice = { subjectIds: [], questionIds: [353], currentIndex: 0, mode: "practice", startedAt: "x", batchSize: null };
  const out = sanitizeLoadedSession(baseSession({ currentPractice: practice }), exists);
  assert.equal(out.currentPractice, null);
});

check("exam (active): dead id removed and index remapped to keep current question", () => {
  const exam = { examId: "e", questionIds: [1, 2, 353, 4], answers: {}, currentIndex: 3, startedAt: "x", submittedAt: null, durationMs: null };
  const out = sanitizeLoadedSession(baseSession({ currentExam: exam }), exists);
  const e = out.currentExam;
  assert.deepEqual(e.questionIds, [1, 2, 4]);
  assert.equal(e.questionIds[e.currentIndex], 4);
});

check("exam (submitted): left untouched even with a dead id, to preserve the record", () => {
  const exam = { examId: "e", questionIds: [1, 353, 3], answers: {}, currentIndex: 0, startedAt: "x", submittedAt: "2026-01-01", durationMs: 10 };
  const s = baseSession({ currentExam: exam });
  assert.equal(sanitizeLoadedSession(s, exists), s);
  assert.deepEqual(s.currentExam.questionIds, [1, 353, 3]);
});

check("fully healthy session is returned by identity", () => {
  const s = baseSession();
  assert.equal(sanitizeLoadedSession(s, exists), s);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
