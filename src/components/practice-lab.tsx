"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shuffle, Check, Wrench } from "lucide-react";
import { makeExercises, matchesAnswer, nextSeed } from "@/lib/practice";
import { useProgress } from "./progress-provider";
import { useInteractions } from "./interaction-provider";
import { PageHeading, Meter, CodeBlock } from "./ui";

function allocateSeed() {
  let previous = 0;
  try {
    previous = Number(localStorage.getItem("educode:practice-seed")) || 0;
  } catch {}
  const seed = nextSeed(
    previous || crypto.getRandomValues(new Uint32Array(1))[0] % 1000000,
  );
  try {
    localStorage.setItem("educode:practice-seed", String(seed));
  } catch {}
  return seed;
}
export function PracticeLab() {
  const [seed, setSeed] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [solved, setSolved] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const { progress, update, notify } = useProgress();
  const { confirm } = useInteractions();
  useEffect(() => {
    setSeed(allocateSeed());
  }, []);
  const exercises = seed === null ? [] : makeExercises(seed);
  const next = async () => {
    if (
      Object.values(answers).some(Boolean) &&
      !(await confirm({
        title: "Buka paket soal baru?",
        description:
          "Jawaban pada paket ini akan ditutup. Statistik yang sudah tersimpan tetap ada.",
        accept: "Ganti soal",
      }))
    )
      return;
    setSeed(allocateSeed());
    setAnswers({});
    setFeedback({});
    setSolved([]);
    setRevealed([]);
  };
  return (
    <>
      <PageHeading
        eyebrow="LAB LATIHAN VARIASI"
        title="Baca. Perbaiki. Coba lagi."
        description="Paket soal: lengkapi sintaks dan perbaiki satu baris kode. Template, urutan, dan data berganti saat refresh; semua soal bekerja offline setelah paket aplikasi tersimpan."
      />
      <div className="panel practice-toolbar">
        <div className="practice-progress">
          <strong>
            Paket {seed ?? "…"} · {solved.length} / {exercises.length} benar
          </strong>
          <Meter
            label="Progres paket variasi"
            value={
              exercises.length ? (solved.length / exercises.length) * 100 : 0
            }
          />
        </div>
        <button
          className="button primary"
          onClick={next}
          disabled={seed === null}
        >
          <Shuffle size={16} /> Soal baru
        </button>
        <select
          aria-label="Jenis latihan"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Semua jenis</option>
          <option value="fill">Lengkapi kode</option>
          <option value="repair">Perbaiki kode</option>
        </select>
      </div>
      <p className="practice-note">
        Total latihan variasi: {progress.practice.correct} benar dari{" "}
        {progress.practice.attempts} pemeriksaan. Statistik terpisah dari XP
        dasar. Refresh mengganti paket dan mengosongkan jawaban yang belum
        diselesaikan.
      </p>
      <div className="fill-list">
        {exercises
          .filter((e) => filter === "all" || e.kind === filter)
          .map((exercise, index) => {
            const done = solved.includes(exercise.id),
              shown = revealed.includes(exercise.id);
            return (
              <article
                className={`panel fill-card ${done ? "is-complete" : ""}`}
                key={exercise.id}
              >
                <div className="section-top">
                  <span className="eyebrow">
                    {exercise.kind === "repair"
                      ? "PERBAIKI KODE"
                      : "LENGKAPI KODE"}{" "}
                    · {exercise.topic}
                  </span>
                  <span className="status-badge">
                    {done ? "✓ Benar" : shown ? "Mode belajar" : `${index + 1}`}
                  </span>
                </div>
                <h2>{exercise.title}</h2>
                <p>{exercise.prompt}</p>
                <CodeBlock code={exercise.code} label={exercise.topic} />
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (done || shown) return;
                    const valid = matchesAnswer(
                      answers[exercise.id] || "",
                      exercise,
                    );
                    setFeedback((f) => ({
                      ...f,
                      [exercise.id]: valid
                        ? exercise.explanation
                        : "Belum tepat. Periksa petunjuk dan ikuti format baris yang diminta, termasuk tanda baca.",
                    }));
                    update((p) => ({
                      ...p,
                      practice: {
                        attempts: p.practice.attempts + 1,
                        correct: p.practice.correct + (valid ? 1 : 0),
                      },
                    }));
                    if (valid) {
                      setSolved((s) => [...s, exercise.id]);
                      notify(
                        "Jawaban benar. Statistik latihan tersimpan.",
                        "success",
                      );
                    }
                  }}
                >
                  <label
                    className="practice-answer"
                    htmlFor={`answer-${exercise.id}`}
                  >
                    {exercise.kind === "repair"
                      ? "Baris kode perbaikan"
                      : "Jawaban bagian kosong"}
                  </label>
                  <input
                    id={`answer-${exercise.id}`}
                    aria-describedby={`result-${exercise.id}`}
                    aria-invalid={Boolean(feedback[exercise.id] && !done)}
                    className="practice-input"
                    spellCheck={false}
                    autoComplete="off"
                    disabled={done || shown}
                    value={answers[exercise.id] || ""}
                    onChange={(event) => {
                      setAnswers((a) => ({
                        ...a,
                        [exercise.id]: event.target.value,
                      }));
                      setFeedback((f) => ({ ...f, [exercise.id]: "" }));
                    }}
                  />
                  <div className="fill-bottom">
                    <details>
                      <summary>Petunjuk</summary>
                      <p>{exercise.hint}</p>
                    </details>
                    <button
                      className="button secondary"
                      disabled={done || shown || !answers[exercise.id]?.trim()}
                    >
                      <Check size={16} /> Periksa
                    </button>
                  </div>
                </form>
                <p
                  id={`result-${exercise.id}`}
                  role="status"
                  className={`feedback ${done ? "correct" : ""}`}
                >
                  {feedback[exercise.id]}
                </p>
                {!done && (
                  <button
                    className="text-link"
                    disabled={shown}
                    onClick={async () => {
                      if (
                        await confirm({
                          title: "Lihat pembahasan?",
                          description:
                            "Soal ini akan masuk mode belajar dan tidak dihitung sebagai jawaban benar pada paket ini.",
                          accept: "Tampilkan pembahasan",
                        })
                      )
                        setRevealed((r) => [...r, exercise.id]);
                    }}
                  >
                    <Wrench size={15} />{" "}
                    {shown ? "Pembahasan terbuka" : "Pelajari perbaikannya"}
                  </button>
                )}
                {shown && (
                  <div className="practice-solution">
                    <CodeBlock code={exercise.answer} label="JAWABAN CONTOH" />
                    <p>{exercise.explanation}</p>
                  </div>
                )}
              </article>
            );
          })}
      </div>
      {seed === null && <p role="status">Menyiapkan paket latihan…</p>}
      <p className="practice-note">
        Pemeriksa membandingkan jawaban dengan format contoh, bukan menjalankan
        PHP atau menerima semua solusi ekuivalen. Bank 16 template memiliki
        variasi data; template dapat muncul kembali pada paket berikutnya.
      </p>
      <Link prefetch={false} className="button secondary" href="/latihan">
        Kembali ke latihan dasar dan XP
      </Link>
    </>
  );
}

