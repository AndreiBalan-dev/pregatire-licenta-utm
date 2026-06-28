import process from "node:process";
import assert from "node:assert/strict";
import { validateName, validateCreateConfig, validateChatMessage } from "../src/lib/challenge/validation.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

check("trims and accepts a normal name", () => {
  const r = validateName("  Ana ");
  assert.equal(r.ok, true);
  assert.equal(r.name, "Ana");
});

check("rejects empty and over-long names", () => {
  assert.equal(validateName("   ").ok, false);
  assert.equal(validateName("x".repeat(21)).ok, false);
});

check("rejects names with angle brackets or control chars", () => {
  assert.equal(validateName("<b>").ok, false);
  assert.equal(validateName("a\x00b").ok, false);
});

const subjects = new Set(["fundamentele-programarii", "sgbd"]);
const goodCfg = {
  mode: "self_paced", subjectIds: ["sgbd"], questionCount: 10,
  shuffleOrder: true, shuffleOptions: true, instantFeedback: true,
  perQuestionSeconds: null, capacity: 4, hostPlays: true,
  timer: { mode: "total", totalSeconds: 600, perQuestionSeconds: 120 },
};

check("accepts a valid config", () => {
  const r = validateCreateConfig(goodCfg, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.questionCount, 10);
});

check("accepts a large 'all questions' count up to the bank size", () => {
  const r = validateCreateConfig({ ...goodCfg, questionCount: 714 }, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.questionCount, 714);
});

check("rejects unknown subjects", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, subjectIds: ["nope"] }, subjects).ok, false);
});

check("rejects empty subject list", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, subjectIds: [] }, subjects).ok, false);
});

check("rejects out-of-range capacity and question count", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, capacity: 99 }, subjects).ok, false);
  assert.equal(validateCreateConfig({ ...goodCfg, questionCount: 1001 }, subjects).ok, false);
  assert.equal(validateCreateConfig({ ...goodCfg, capacity: 0 }, subjects).ok, false);
  assert.equal(validateCreateConfig({ ...goodCfg, questionCount: 0 }, subjects).ok, false);
});

check("rejects an invalid mode and non-object input", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, mode: "nope" }, subjects).ok, false);
  assert.equal(validateCreateConfig([], subjects).ok, false);
});

check("rejects non-boolean flags", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, shuffleOrder: "yes" }, subjects).ok, false);
});

check("accepts a per_question timer and keeps its seconds", () => {
  const r = validateCreateConfig({ ...goodCfg, timer: { mode: "per_question", totalSeconds: 600, perQuestionSeconds: 180 } }, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.timer.mode, "per_question");
  assert.equal(r.config.timer.perQuestionSeconds, 180);
});

check("accepts the short per_question options (15s / 30s)", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, timer: { mode: "per_question", totalSeconds: 600, perQuestionSeconds: 15 } }, subjects).ok, true);
  assert.equal(validateCreateConfig({ ...goodCfg, timer: { mode: "per_question", totalSeconds: 600, perQuestionSeconds: 30 } }, subjects).ok, true);
});

check("keeps a total timer's seconds", () => {
  const r = validateCreateConfig({ ...goodCfg, timer: { mode: "total", totalSeconds: 1800, perQuestionSeconds: 120 } }, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.timer.mode, "total");
  assert.equal(r.config.timer.totalSeconds, 1800);
});

check("rejects a missing or malformed timer", () => {
  const { timer, ...noTimer } = goodCfg; void timer;
  assert.equal(validateCreateConfig(noTimer, subjects).ok, false);
  assert.equal(validateCreateConfig({ ...goodCfg, timer: { mode: "nope" } }, subjects).ok, false);
});

check("rejects out-of-range total duration and bad per-question option", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, timer: { mode: "total", totalSeconds: 30, perQuestionSeconds: 120 } }, subjects).ok, false);
  assert.equal(validateCreateConfig({ ...goodCfg, timer: { mode: "total", totalSeconds: 99999, perQuestionSeconds: 120 } }, subjects).ok, false);
  assert.equal(validateCreateConfig({ ...goodCfg, timer: { mode: "per_question", totalSeconds: 600, perQuestionSeconds: 45 } }, subjects).ok, false);
});

check("defaults preset to 'custom' when omitted", () => {
  const r = validateCreateConfig(goodCfg, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.preset, "custom");
});

check("accepts and keeps preset 'simulare'", () => {
  const r = validateCreateConfig({ ...goodCfg, preset: "simulare" }, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.preset, "simulare");
});

check("rejects an invalid preset", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, preset: "nope" }, subjects).ok, false);
});

check("accepts an unlimited timer (no clock)", () => {
  const r = validateCreateConfig({ ...goodCfg, timer: { mode: "unlimited", totalSeconds: 600, perQuestionSeconds: 120 } }, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.timer.mode, "unlimited");
});

check("defaults scoring to 'points' when omitted", () => {
  const r = validateCreateConfig(goodCfg, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.scoring, "points");
});

check("accepts and keeps scoring 'correct'", () => {
  const r = validateCreateConfig({ ...goodCfg, scoring: "correct" }, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.scoring, "correct");
});

check("rejects an invalid scoring", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, scoring: "nope" }, subjects).ok, false);
});

check("chat: trims and accepts a normal message", () => {
  const r = validateChatMessage("  hai mai repede ");
  assert.equal(r.ok, true);
  assert.equal(r.text, "hai mai repede");
});

check("chat: collapses internal whitespace and newlines to single spaces", () => {
  const r = validateChatMessage("gata\n\n  acum");
  assert.equal(r.ok, true);
  assert.equal(r.text, "gata acum");
});

check("chat: rejects empty and whitespace-only messages", () => {
  assert.equal(validateChatMessage("").ok, false);
  assert.equal(validateChatMessage("    ").ok, false);
  assert.equal(validateChatMessage("\n\t").ok, false);
});

check("chat: accepts exactly 200 chars, rejects 201", () => {
  assert.equal(validateChatMessage("x".repeat(200)).ok, true);
  assert.equal(validateChatMessage("x".repeat(201)).ok, false);
});

check("chat: rejects angle brackets and control chars", () => {
  assert.equal(validateChatMessage("<b>hi</b>").ok, false);
  assert.equal(validateChatMessage("a\x00b").ok, false);
});

check("chat: rejects non-string input", () => {
  assert.equal(validateChatMessage(123).ok, false);
  assert.equal(validateChatMessage(null).ok, false);
});

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
