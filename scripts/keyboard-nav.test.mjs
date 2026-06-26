import process from "node:process";
import assert from "node:assert/strict";
import { resolveInitialKeyboardNav, nextFocusIndex, KEYBOARD_NAV_STORAGE_KEY } from "../src/lib/keyboard-nav.ts";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (err) { failures++; console.error(`  FAIL  ${name}`); console.error(`        ${err?.message ?? err}`); }
}

check("storage key is stable", () => assert.equal(KEYBOARD_NAV_STORAGE_KEY, "utm-keyboard-nav"));

check("resolveInitialKeyboardNav: null -> on, '1' -> on, '0' -> off, other -> off", () => {
  assert.equal(resolveInitialKeyboardNav(null), true);
  assert.equal(resolveInitialKeyboardNav("1"), true);
  assert.equal(resolveInitialKeyboardNav("0"), false);
  assert.equal(resolveInitialKeyboardNav("x"), false);
});

check("nextFocusIndex: seeds from null (down->0, up->last)", () => {
  assert.equal(nextFocusIndex(null, 1, 4), 0);
  assert.equal(nextFocusIndex(null, -1, 4), 3);
});

check("nextFocusIndex: steps and clamps with no wrap", () => {
  assert.equal(nextFocusIndex(0, 1, 4), 1);
  assert.equal(nextFocusIndex(3, 1, 4), 3);
  assert.equal(nextFocusIndex(0, -1, 4), 0);
  assert.equal(nextFocusIndex(2, -1, 4), 1);
});

check("nextFocusIndex: empty option set is safe", () => assert.equal(nextFocusIndex(null, 1, 0), 0));

if (failures > 0) { console.error(`\n${failures} test(s) failed`); process.exit(1); }
console.log("\nAll tests passed");
