import { normalizeProgress, STORAGE_KEY, type Progress } from "./progress";
export const SNAPSHOT_KEY = "educode:snapshots:v1";
export const QUARANTINE_KEY = "educode:recovery-raw:v1";
export type Store = Pick<Storage, "getItem" | "setItem">;
export type Snapshot = {
  id: string;
  date: string;
  label: string;
  data: Progress;
};
export function parseBackup(text: string): Progress {
  if (new TextEncoder().encode(text).length > 2000000)
    throw new Error("Cadangan melebihi 2 MB.");
  const raw: unknown = JSON.parse(text);
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw) ||
    !("version" in raw) ||
    raw.version !== 2 ||
    !("completedModules" in raw) ||
    !Array.isArray(raw.completedModules)
  )
    throw new Error("Format cadangan EduCode v2 tidak valid.");
  return normalizeProgress(raw);
}
export function readSnapshots(store: Store): Snapshot[] {
  try {
    const raw: unknown = JSON.parse(store.getItem(SNAPSHOT_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, 3).flatMap((item) => {
      try {
        if (
          typeof item.id !== "string" ||
          typeof item.label !== "string" ||
          typeof item.date !== "string" ||
          !Number.isFinite(Date.parse(item.date))
        )
          return [];
        return [
          {
            id: item.id.slice(0, 80),
            label: item.label.slice(0, 100),
            date: item.date.slice(0, 40),
            data: parseBackup(JSON.stringify(item.data)),
          },
        ];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
export function saveSnapshot(
  store: Store,
  data: Progress,
  label: string,
): void {
  const snapshot = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    label: label.slice(0, 100),
    data: normalizeProgress(data),
  };
  store.setItem(
    SNAPSHOT_KEY,
    JSON.stringify([snapshot, ...readSnapshots(store)].slice(0, 3)),
  );
}
// Compare before writing so an observed cross-tab change is not silently lost.
// localStorage does not offer atomic transactions; truly simultaneous writes still need a backend.
export function guardedSave(
  store: Store,
  expected: string | null,
  progress: Progress,
): string {
  if (store.getItem(STORAGE_KEY) !== expected) throw new Error("CONFLICT");
  const next = JSON.stringify(normalizeProgress(progress));
  if (next !== expected) store.setItem(STORAGE_KEY, next);
  return next;
}
export function replaceWithRecovery(
  store: Store,
  data: Progress,
  label: string,
): string {
  const previous = store.getItem(STORAGE_KEY);
  if (previous) {
    let valid: Progress | null = null;
    try {
      valid = parseBackup(previous);
    } catch {}
    // Do not overwrite even malformed source data before a recoverable copy exists.
    if (valid) saveSnapshot(store, valid, label);
    else store.setItem(QUARANTINE_KEY, previous);
  }
  return guardedSave(store, previous, data);
}
