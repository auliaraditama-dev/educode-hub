import test from "node:test";
import assert from "node:assert/strict";
import { makeExercises, matchesAnswer, nextSeed } from "../src/lib/practice";
import { normalizeProgress, emptyProgress } from "../src/lib/progress";
test("500 successive refreshes produce different packages with both exercise families", () => {
  let last = "";
  for (let seed = 1; seed <= 500; seed++) {
    const set = makeExercises(seed);
    assert.equal(set.length, 12);
    assert.equal(new Set(set.map((e) => e.id)).size, 12);
    assert.equal(set.filter((e) => e.kind === "repair").length, 6);
    const signature = JSON.stringify(set.map((e) => [e.title, e.code]));
    assert.notEqual(signature, last);
    last = signature;
    for (const e of set) {
      assert.ok(matchesAnswer(` ${e.answer}\n`, e));
      assert.equal(matchesAnswer("definitely wrong", e), false);
    }
  }
});
test("seed survives repeated rotations and repairs invalid values", () => {
  assert.equal(nextSeed(42), 43);
  assert.equal(nextSeed(NaN), 1);
  assert.equal(nextSeed(2147483646), 1);
});
test("practice statistics preserve existing v2 progress and normalize corrupt imports", () => {
  const old = normalizeProgress({ version: 2, completedModules: [1] });
  assert.deepEqual(old.practice, { attempts: 0, correct: 0 });
  assert.deepEqual(old.completedModules, [1]);
  const p = normalizeProgress({
    ...emptyProgress(),
    practice: { attempts: 2, correct: 100 },
  });
  assert.deepEqual(p.practice, { attempts: 2, correct: 2 });
  assert.deepEqual(
    normalizeProgress({ practice: { attempts: -1, correct: Infinity } })
      .practice,
    { attempts: 0, correct: 0 },
  );
});
