import process from "node:process";
import assert from "node:assert/strict";
import { validateName, validateCreateConfig } from "../src/lib/challenge/validation.ts";

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
};

check("accepts a valid config", () => {
  const r = validateCreateConfig(goodCfg, subjects);
  assert.equal(r.ok, true);
  assert.equal(r.config.questionCount, 10);
});

check("rejects unknown subjects", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, subjectIds: ["nope"] }, subjects).ok, false);
});

check("rejects empty subject list", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, subjectIds: [] }, subjects).ok, false);
});

check("rejects out-of-range capacity and question count", () => {
  assert.equal(validateCreateConfig({ ...goodCfg, capacity: 99 }, subjects).ok, false);
  assert.equal(validateCreateConfig({ ...goodCfg, questionCount: 999 }, subjects).ok, false);
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

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
