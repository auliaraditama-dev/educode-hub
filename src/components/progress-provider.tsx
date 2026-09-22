"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  emptyProgress,
  normalizeProgress,
  STORAGE_KEY,
  type Progress,
} from "@/lib/progress";
import { useInteractions } from "./interaction-provider";
type Kind =
  | "completedModules"
  | "masteredFlashcards"
  | "completedFills"
  | "completedProblems";
const Context = createContext<{
  progress: Progress;
  ready: boolean;
  update: (fn: (p: Progress) => Progress) => void;
  complete: (kind: Kind, id: number) => void;
  notify: (s: string, tone?: "info" | "success" | "danger") => void;
}>({
  progress: emptyProgress(),
  ready: false,
  update: () => {},
  complete: () => {},
  notify: () => {},
});
export const useProgress = () => useContext(Context);
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(emptyProgress),
    [ready, setReady] = useState(false);
  const { notify } = useInteractions();
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProgress(normalizeProgress(JSON.parse(saved)));
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
            theme: localStorage.getItem("edu_theme"),
          }),
        );
      }
    } catch {
      notify(
        "Penyimpanan tidak tersedia atau data rusak. Gunakan ekspor untuk mencadangkan progres.",
      );
    }
    setReady(true);
    const sync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setProgress(normalizeProgress(JSON.parse(e.newValue)));
        } catch {}
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [notify]);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = progress.theme;
    try {
      const json = JSON.stringify(progress);
      if (localStorage.getItem(STORAGE_KEY) !== json)
        localStorage.setItem(STORAGE_KEY, json);
    } catch {
      notify(
        "Progres belum tersimpan. Ruang penyimpanan mungkin penuh; ekspor cadangan Anda.",
      );
    }
  }, [progress, ready, notify]);

  const update = useCallback(
    (fn: (p: Progress) => Progress) =>
      setProgress((p) => normalizeProgress(fn(p))),
    [],
  );
  const complete = useCallback(
    (kind: Kind, id: number) => {
      setProgress((p) =>
        p[kind].includes(id)
          ? p
          : normalizeProgress({ ...p, [kind]: [...p[kind], id] }),
      );
      notify("Progres belajar diperbarui.", "success");
    },
    [notify],
  );
  return (
    <Context.Provider value={{ progress, ready, update, complete, notify }}>
      {children}
    </Context.Provider>
  );
}
