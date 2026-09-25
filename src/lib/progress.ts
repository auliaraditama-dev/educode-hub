import {
  modules,
  flashcards,
  fills,
  problems,
  testCases,
  portfolioItems,
} from "./content";
export type TestResult = {
  status: "belum" | "lulus" | "gagal";
  actual: string;
};
export type Progress = {
  version: 2;
  practice: { attempts: number; correct: number };
  completedModules: number[];
  masteredFlashcards: number[];
  completedFills: number[];
  completedProblems: number[];
  bookmarks: number[];
  notes: Record<string, string>;
  tests: Record<string, TestResult>;
  debug: string;
  portfolio: string[];
  drafts: Record<string, string>;
  exam: { score: number; total: number; date: string } | null;
  lastModule: number;
};
export const STORAGE_KEY = "educode:progress:v2";
export function emptyProgress(): Progress {
  return {
    version: 2,
    practice: { attempts: 0, correct: 0 },
    completedModules: [],
    masteredFlashcards: [],
    completedFills: [],
    completedProblems: [],
    bookmarks: [],
    notes: {},
    tests: {},
    debug: "",
    portfolio: [],
    drafts: {},
    exam: null,
    lastModule: 1,
  };
}
const object = (x: unknown): Record<string, unknown> =>
  x && typeof x === "object" && !Array.isArray(x)
    ? (x as Record<string, unknown>)
    : {};
function ids(x: unknown, max: number): number[] {
  return Array.isArray(x)
    ? [
        ...new Set(
          x.filter(
            (v): v is number => Number.isInteger(v) && v >= 1 && v <= max,
          ),
        ),
      ]
    : [];
}
function strings(x: unknown, maximum: number): Record<string, string> {
  return Object.fromEntries(
    Object.entries(object(x))
      .filter(
        ([k, v]) =>
          /^\d{1,3}$/.test(k) &&
          Number(k) >= 1 &&
          Number(k) <= maximum &&
          String(Number(k)) === k &&
          typeof v === "string",
      )
      .slice(0, 100)
      .map(([k, v]) => [k, (v as string).slice(0, 20000)]),
  );
}
export function normalizeProgress(value: unknown): Progress {
  const raw = object(value),
    p = emptyProgress();
  const practice = object(raw.practice);
  const count = (value: unknown) =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0
      ? Math.min(value, 100000000)
      : 0;
  p.practice = {
    attempts: count(practice.attempts),
    correct: Math.min(count(practice.correct), count(practice.attempts)),
  };
  p.completedModules = ids(raw.completedModules, modules.length);
  p.masteredFlashcards = ids(raw.masteredFlashcards, flashcards.length);
  p.completedFills = ids(raw.completedFills, fills.length);
  p.completedProblems = ids(raw.completedProblems, problems.length);
  p.bookmarks = ids(raw.bookmarks, modules.length);
  p.notes = strings(raw.notes, modules.length);
  p.drafts = strings(raw.drafts, problems.length);
  p.debug = typeof raw.debug === "string" ? raw.debug.slice(0, 50000) : "";
  p.portfolio = Array.isArray(raw.portfolio)
    ? [
        ...new Set(
          raw.portfolio.filter(
            (v): v is string =>
              typeof v === "string" &&
              portfolioItems.some((_, i) => String(i) === v),
          ),
        ),
      ]
    : [];
  for (const [key, val] of Object.entries(object(raw.tests))) {
    const t = object(val);
    if (testCases.some(([id]) => id === key))
      p.tests[key] = {
        status:
          (t.status === "lulus" || t.status === "gagal") &&
          typeof t.actual === "string" &&
          t.actual.trim().length > 0
            ? t.status
            : "belum",
        actual: typeof t.actual === "string" ? t.actual.slice(0, 5000) : "",
      };
  }
  const exam = object(raw.exam);
  if (
    Number.isInteger(exam.score) &&
    Number.isInteger(exam.total) &&
    Number(exam.total) > 0 &&
    Number(exam.total) <= 100 &&
    Number(exam.score) >= 0 &&
    Number(exam.score) <= Number(exam.total) &&
    typeof exam.date === "string" &&
    !Number.isNaN(Date.parse(exam.date))
  )
    p.exam = {
      score: Number(exam.score),
      total: Number(exam.total),
      date: exam.date,
    };
  p.lastModule = ids([raw.lastModule], modules.length)[0] || 1;
  return p;
}
export function xpOf(p: Progress) {
  return (
    p.completedModules.length * 50 +
    p.masteredFlashcards.length * 10 +
    p.completedFills.length * 20 +
    p.completedProblems.length * 100
  );
}
export function levelOf(xp: number) {
  return {
    level: Math.floor(xp / 100) + 1,
    title:
      xp >= 1000
        ? "Laravel Explorer"
        : xp >= 500
          ? "Code Builder"
          : xp >= 200
            ? "Junior Developer"
            : "Pemrogram Junior",
  };
}
export function download(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
