import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyProgress,
  normalizeProgress,
  xpOf,
  levelOf,
} from "../src/lib/progress";
import { modules, flashcards, testCases } from "../src/lib/content";
test("untrusted import is normalized and XP cannot be inflated by duplicate or unknown ids", () => {
  const p = normalizeProgress({
    completedModules: [1, 1, 2, 999, "3", -1],
    masteredFlashcards: [1, 1],
    completedFills: [1],
    completedProblems: [1],
    xp: 999999,
  });
  assert.deepEqual(p.completedModules, [1, 2]);
  assert.equal(xpOf(p), 230);
  assert.equal(levelOf(xpOf(p)).level, 3);
});
test("malformed values do not break storage recovery", () => {
  for (const raw of [null, [], false, "oops", 44])
    assert.deepEqual(normalizeProgress(raw), emptyProgress());
  const p = normalizeProgress({
    notes: { __proto__: "oops", "1": "valid" },
    tests: {
      "TC-03": { status: "fake", actual: "x" },
      "TC-99": { status: "lulus" },
    },
    portfolio: ["0", "0", "99"],
    exam: { score: 20, total: 10, date: "now" },
  });
  assert.deepEqual(p.notes, { "1": "valid" });
  assert.deepEqual(p.portfolio, ["0"]);
  assert.equal(p.tests["TC-03"].status, "belum");
  assert.equal(p.tests["TC-99"], undefined);
  assert.equal(p.exam, null);
});
test("valid backup round-trips including independent exercise families", () => {
  const p = {
    ...emptyProgress(),
    completedModules: [1, 12],
    completedFills: [2, 8],
    completedProblems: [2, 4],
    notes: { "1": "Refleksi" },
    theme: "dark" as const,
  };
  assert.deepEqual(normalizeProgress(JSON.parse(JSON.stringify(p))), p);
});
test("curriculum and assessment identifiers are unique", () => {
  assert.equal(new Set(modules.map((m) => m.slug)).size, 12);
  assert.equal(new Set(flashcards.map((f) => f.id)).size, 20);
  assert.equal(testCases.length, 10);
});
