import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyProgress,
  normalizeProgress,
  STORAGE_KEY,
} from "../src/lib/progress";
import {
  guardedSave,
  parseBackup,
  readSnapshots,
  replaceWithRecovery,
  saveSnapshot,
  SNAPSHOT_KEY,
  QUARANTINE_KEY,
  type Store,
} from "../src/lib/safety";
function memory() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}
test("invalid and oversized backups are rejected before normalization", () => {
  for (const text of [
    "null",
    "[]",
    "{}",
    '{"version":99,"completedModules":[]}',
    '{"version":2,"completedModules":false}',
    "{broken",
  ])
    assert.throws(() => parseBackup(text));
  assert.throws(() => parseBackup(" ".repeat(2000001)));
  assert.deepEqual(
    parseBackup('{"version":2,"completedModules":[1]}').completedModules,
    [1],
  );
});
test("invalid source is retained until an explicit recoverable replacement", () => {
  const store = memory();
  store.setItem(STORAGE_KEY, "{broken");
  assert.throws(() => parseBackup(store.getItem(STORAGE_KEY)!));
  assert.equal(store.getItem(STORAGE_KEY), "{broken");
  replaceWithRecovery(store, emptyProgress(), "Recovery");
  assert.equal(store.getItem(QUARANTINE_KEY), "{broken");
  assert.deepEqual(parseBackup(store.getItem(STORAGE_KEY)!), emptyProgress());
});
test("quota failure during backup prevents destructive replacement", () => {
  const store = memory();
  const before = JSON.stringify({
    ...emptyProgress(),
    notes: { "1": "Important" },
  });
  store.setItem(STORAGE_KEY, before);
  const failing: Store = {
    getItem: store.getItem,
    setItem: (key, value) => {
      if (key === SNAPSHOT_KEY) throw new Error("QuotaExceededError");
      store.setItem(key, value);
    },
  };
  assert.throws(() => replaceWithRecovery(failing, emptyProgress(), "Reset"));
  assert.equal(store.getItem(STORAGE_KEY), before);
});
test("cross-tab conflicting writes never overwrite the newly observed source", () => {
  const store = memory();
  const old = guardedSave(store, null, emptyProgress());
  const remote = JSON.stringify({
    ...emptyProgress(),
    notes: { "1": "other tab" },
  });
  store.setItem(STORAGE_KEY, remote);
  assert.throws(
    () =>
      guardedSave(store, old, { ...emptyProgress(), completedModules: [1] }),
    /CONFLICT/,
  );
  assert.equal(store.getItem(STORAGE_KEY), remote);
});
test("snapshots are bounded and replacement snapshots contain the old data", () => {
  const store = memory();
  for (let i = 0; i < 5; i++)
    saveSnapshot(
      store,
      { ...emptyProgress(), notes: { "1": String(i) } },
      "Manual",
    );
  assert.equal(readSnapshots(store).length, 3);
  assert.equal(readSnapshots(store)[0].data.notes["1"], "4");
  store.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...emptyProgress(), completedModules: [1, 2] }),
  );
  replaceWithRecovery(store, emptyProgress(), "Before reset");
  assert.deepEqual(readSnapshots(store)[0].data.completedModules, [1, 2]);
});
test("unknown note IDs and evidence-free test status cannot enter normalized data", () => {
  const progress = normalizeProgress({
    notes: { "999": "hidden", "01": "alias", "1": "valid" },
    drafts: { "5": "unknown", "1": "code" },
    tests: { "TC-01": { status: "lulus", actual: "   " } },
  });
  assert.deepEqual(progress.notes, { "1": "valid" });
  assert.deepEqual(progress.drafts, { "1": "code" });
  assert.equal(progress.tests["TC-01"].status, "belum");
});
