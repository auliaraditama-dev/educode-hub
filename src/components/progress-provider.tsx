"use client";
import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  download,
  emptyProgress,
  normalizeProgress,
  STORAGE_KEY,
  type Progress,
} from "@/lib/progress";
import {
  guardedSave,
  parseBackup,
  replaceWithRecovery,
  serializeBackup,
} from "@/lib/safety";
import { useInteractions } from "./interaction-provider";
type Kind =
  | "completedModules"
  | "masteredFlashcards"
  | "completedFills"
  | "completedProblems";
type StorageStatus = "loading" | "saved" | "blocked" | "conflict" | "memory";
const Context = createContext<{
  progress: Progress;
  ready: boolean;
  storageStatus: StorageStatus;
  update: (fn: (p: Progress) => Progress) => void;
  complete: (kind: Kind, id: number) => void;
  replace: (value: Progress, label: string) => boolean;
  reloadSaved: () => void;
  notify: (s: string, tone?: "info" | "success" | "danger") => void;
}>({
  progress: emptyProgress(),
  ready: false,
  storageStatus: "loading",
  update: () => {},
  complete: () => {},
  replace: () => false,
  reloadSaved: () => {},
  notify: () => {},
});
export const useProgress = () => useContext(Context);
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(emptyProgress),
    [ready, setReady] = useState(false),
    [blocked, setBlocked] = useState(false),
    [storageStatus, setStorageStatus] = useState<StorageStatus>("loading");
  const lastSeen = useRef<string | null>(null),
    loaded = useRef(false),
    dirty = useRef(false);
  const pending = useRef<Array<(p: Progress) => Progress>>([]);
  const { notify } = useInteractions();
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      lastSeen.current = saved;
      if (saved) setProgress(parseBackup(saved));
      else {
        const read = (key: string) => {
          try {
            return JSON.parse(localStorage.getItem(key) || "[]");
          } catch {
            return [];
          }
        };
        setProgress(
          normalizeProgress({
            completedModules: read("edu_modules"),
            masteredFlashcards: read("edu_cards"),
            completedFills: read("edu_fills"),
            completedProblems: read("edu_problems"),
          }),
        );
      }
    } catch {
      setBlocked(true);
      setStorageStatus("blocked");
      notify(
        "Data tersimpan tidak dapat dibaca. Data asli dipertahankan; buka Pusat data untuk pemulihan.",
        "danger",
      );
    }
    const queued = pending.current;
    pending.current = [];
    if (queued.length) {
      dirty.current = true;
      setProgress((value) =>
        queued.reduce((p, fn) => normalizeProgress(fn(p)), value),
      );
    }
    loaded.current = true;
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      if (dirty.current) {
        setBlocked(true);
        setStorageStatus("conflict");
        notify(
          "Ada perubahan dari tab lain. Ekspor perubahan dalam memori sebelum membaca ulang data.",
          "danger",
        );
        return;
      }
      try {
        const value = event.newValue
          ? parseBackup(event.newValue)
          : emptyProgress();
        lastSeen.current = event.newValue;
        setProgress(value);
        setBlocked(false);
      } catch {
        setBlocked(true);
        setStorageStatus("blocked");
        notify(
          "Data dari tab lain tidak valid. Penyimpanan otomatis dihentikan agar data tidak tertimpa.",
          "danger",
        );
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [notify]);
  useEffect(() => {
    if (!ready) return;
    if (blocked) return;
    try {
      lastSeen.current = guardedSave(localStorage, lastSeen.current, progress);
      dirty.current = false;
      setStorageStatus("saved");
    } catch (error) {
      setBlocked(true);
      const conflict = error instanceof Error && error.message === "CONFLICT";
      setStorageStatus(conflict ? "conflict" : "memory");
      notify(
        conflict
          ? "Ada perubahan dari tab lain. Ekspor pekerjaan ini sebelum memuat data terbaru."
          : "Perubahan belum tersimpan. Ekspor cadangan dan periksa ruang penyimpanan.",
        "danger",
      );
    }
  }, [progress, ready, blocked, notify]);
  const update = useCallback((fn: (p: Progress) => Progress) => {
    if (!loaded.current) {
      pending.current.push(fn);
      return;
    }
    dirty.current = true;
    setProgress((p) => normalizeProgress(fn(p)));
  }, []);
  const complete = useCallback(
    (kind: Kind, id: number) => {
      if (!loaded.current) return;
      setProgress((p) => {
        if (p[kind].includes(id)) return p;
        dirty.current = true;
        return normalizeProgress({ ...p, [kind]: [...p[kind], id] });
      });
      notify("Progres belajar diperbarui.", "success");
    },
    [notify],
  );
  const replace = useCallback(
    (value: Progress, label: string) => {
      if (!loaded.current) return false;
      try {
        lastSeen.current = replaceWithRecovery(localStorage, value, label);
        dirty.current = false;
        setProgress(normalizeProgress(value));
        setBlocked(false);
        setStorageStatus("saved");
        return true;
      } catch {
        notify(
          "Penggantian dibatalkan: salinan pemulihan atau data baru tidak dapat disimpan. Ekspor cadangan dan periksa penyimpanan.",
          "danger",
        );
        return false;
      }
    },
    [notify],
  );
  const reloadSaved = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const value = raw ? parseBackup(raw) : emptyProgress();
      lastSeen.current = raw;
      dirty.current = false;
      setProgress(value);
      setBlocked(false);
      notify("Data tersimpan berhasil dimuat.", "success");
    } catch {
      notify(
        "Data masih tidak dapat dibaca. Ekspor data mentah atau pulihkan snapshot.",
        "danger",
      );
    }
  }, [notify]);
  return (
    <Context.Provider
      value={{
        progress,
        ready,
        storageStatus,
        update,
        complete,
        replace,
        reloadSaved,
        notify,
      }}
    >
      {blocked && (
        <div className="data-warning" role="alert">
          Penyimpanan otomatis dijeda. Perubahan baru hanya ada dalam memori.{" "}
          <button
            onClick={() =>
              download(
                "educode-belum-tersimpan.json",
                serializeBackup(progress),
              )
            }
          >
            Ekspor perubahan sekarang
          </button>{" "}
          <Link prefetch={false} href="/keamanan">
            Buka Pusat data
          </Link>
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
