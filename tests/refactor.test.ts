import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { themeBootstrap } from "../src/lib/theme";
import { emptyProgress, normalizeProgress } from "../src/lib/progress";
import { parseBackup, serializeBackup } from "../src/lib/safety";
import {
  createExam,
  examResult,
  parseExam,
  simulationQuestions,
} from "../src/lib/simulation";

function boot(saved: Record<string, string>, darkOS = false, denied = false) {
  const dataset: Record<string, string> = {},
    style: Record<string, string> = {};
  vm.runInNewContext(themeBootstrap, {
    document: {
      documentElement: { dataset, style },
      querySelectorAll: () => [],
    },
    window: { matchMedia: () => ({ matches: darkOS }) },
    localStorage: {
      getItem: (key: string) => {
        if (denied) throw Error("Denied");
        return saved[key] ?? null;
      },
      setItem: (key: string, value: string) => {
        saved[key] = value;
      },
    },
  });
  return { dataset, style };
}
test("theme bootstrap resolves before React and migrates without modifying learning data", () => {
  const legacy = JSON.stringify({
    ...emptyProgress(),
    theme: "dark",
    notes: { 1: "keep" },
  });
  const saved: Record<string, string> = { "educode:progress:v2": legacy };
  assert.equal(boot(saved).dataset.theme, "dark");
  assert.equal(saved["educode:theme"], "dark");
  assert.equal(saved["educode:progress:v2"], legacy);
  saved["educode:theme"] = "light";
  assert.equal(boot(saved, true).dataset.theme, "light");
});
test("system theme, corrupt legacy and blocked storage have safe pre-paint fallback", () => {
  assert.equal(boot({ "educode:theme": "system" }, true).dataset.theme, "dark");
  assert.equal(
    boot({ "educode:theme": "system" }, false).dataset.theme,
    "light",
  );
  assert.equal(
    boot({ "educode:progress:v2": "invalid" }, true).style.backgroundColor,
    "#141923",
  );
  assert.equal(boot({}, true, true).dataset.theme, "dark");
});
test("backup envelope and legacy backup preserve learning data but exclude theme", () => {
  const old = { ...emptyProgress(), theme: "dark", completedModules: [1] };
  const p = parseBackup(JSON.stringify(old));
  assert.equal("theme" in p, false);
  assert.equal("theme" in emptyProgress(), false);
  assert.deepEqual(parseBackup(serializeBackup(p)), normalizeProgress(old));
  assert.throws(() =>
    parseBackup(JSON.stringify({ app: "Other", version: 1, data: p })),
  );
  assert.throws(() =>
    parseBackup(
      JSON.stringify({
        app: "EduCode Hub",
        version: 2,
        exportedAt: new Date().toISOString(),
        data: p,
      }),
    ),
  );
});
test("question bank has relevant unique options and valid correct answers", () => {
  assert.equal(
    new Set(simulationQuestions.map((q) => q.id)).size,
    simulationQuestions.length,
  );
  for (const q of simulationQuestions) {
    assert.equal(new Set(q.options).size, q.options.length);
    assert.ok(q.options.includes(q.answer));
    assert.ok(q.explanation);
  }
});
test("randomized exam preserves answer identity and produces actual category analysis", () => {
  const a = createExam(20, () => 0.25, 1000),
    b = createExam(20, () => 0.75, 1000);
  assert.notDeepEqual(a.order, b.order);
  assert.deepEqual(parseExam(JSON.stringify(a)), a);
  for (const q of simulationQuestions)
    a.answers[q.id] = q.options.indexOf(q.answer);
  const result = examResult(a);
  assert.equal(result.percentage, 100);
  assert.equal(result.total, simulationQuestions.length);
  for (const stat of Object.values(result.categories))
    assert.equal(stat.correct, stat.total);
  delete a.answers[a.order[0]];
  assert.equal(examResult(a).score, simulationQuestions.length - 1);
});
test("corrupt exam permutation and option indices are rejected", () => {
  const a = createExam(20);
  a.order[1] = a.order[0];
  assert.equal(parseExam(JSON.stringify(a)), null);
  const b = createExam(20);
  b.options[b.order[0]] = [0, 0, 1, 2];
  assert.equal(parseExam(JSON.stringify(b)), null);
  assert.equal(parseExam("invalid"), null);
});
