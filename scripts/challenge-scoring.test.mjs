import process from "node:process";
import assert from "node:assert/strict";
import { rankPlayers } from "../src/lib/challenge/scoring.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

const p = (id, name, score, answered, time, finished = false) => ({
  id, name, score, correctCount: score, answeredCount: answered, totalTimeMs: time,
  finishedAt: finished ? "2026-01-01T00:00:00Z" : null,
});

check("ranks by score desc", () => {
  const s = rankPlayers([p(1, "A", 2, 3, 100), p(2, "B", 5, 5, 100)], 5);
  assert.equal(s[0].playerId, 2);
  assert.equal(s[0].rank, 1);
  assert.equal(s[1].rank, 2);
});

check("breaks ties by less total time", () => {
  const s = rankPlayers([p(1, "A", 3, 3, 500), p(2, "B", 3, 3, 200)], 5);
  assert.equal(s[0].playerId, 2); // faster wins the tie
});

check("equal score and time share a rank", () => {
  const s = rankPlayers([p(1, "A", 3, 3, 200), p(2, "B", 3, 3, 200)], 5);
  assert.equal(s[0].rank, 1);
  assert.equal(s[1].rank, 1);
});

check("computes progress and finished flags", () => {
  const s = rankPlayers([p(1, "A", 2, 2, 100, false)], 4);
  assert.equal(s[0].progress, 0.5);
  assert.equal(s[0].finished, false);
  assert.equal(s[0].totalQuestions, 4);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
