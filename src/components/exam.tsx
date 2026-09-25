"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createExam,
  parseExam,
  examResult,
  simulationQuestions,
  EXAM_KEY,
  type ExamSession,
} from "@/lib/simulation";
import { useProgress } from "./progress-provider";
import { useInteractions } from "./interaction-provider";
import { PageHeading, Meter } from "./ui";
export function Exam() {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loaded, setLoaded] = useState(false),
    [minutes, setMinutes] = useState(20),
    [remaining, setRemaining] = useState(0),
    [index, setIndex] = useState(0);
  const current = useRef<ExamSession | null>(null);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const { update } = useProgress();
  const { confirm, notify } = useInteractions();
  const change = useCallback((value: ExamSession | null) => {
    current.current = value;
    setSession(value);
  }, []);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(EXAM_KEY);
      if (saved) {
        const value = parseExam(saved);
        if (value) change(value);
        else
          notify(
            "Sesi simulasi tidak valid. Mulai sesi baru; progres sebelumnya tetap tersedia.",
          );
      }
    } catch {
      notify(
        "Sesi simulasi hanya tersedia sampai halaman ditutup karena penyimpanan diblokir.",
      );
    }
    setLoaded(true);
  }, [change, notify]);
  useEffect(() => {
    if (!loaded) return;
    try {
      if (session) sessionStorage.setItem(EXAM_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(EXAM_KEY);
    } catch {
      /* In-memory session remains usable. */
    }
  }, [session, loaded]);
  const finish = useCallback(() => {
    const value = current.current;
    if (!value || value.finished) return;
    const result = examResult(value);
    change({ ...value, finished: true });
    update((p) => ({
      ...p,
      exam: {
        score: result.score,
        total: result.total,
        date: new Date().toISOString(),
      },
    }));
  }, [change, update]);
  useEffect(() => {
    if (!session || session.finished) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((session.deadline - Date.now()) / 1000),
      );
      setRemaining(left);
      if (!left) finish();
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [session, finish]);
  const result = session ? examResult(session) : null;
  const questions = session
    ? session.order.map((id) => simulationQuestions.find((q) => q.id === id)!)
    : [];
  const visible = session?.finished
    ? questions
    : questions.slice(index, index + 1);
  const move = (next: number) => {
    setIndex(next);
    requestAnimationFrame(() => questionHeading.current?.focus());
  };
  return (
    <>
      <PageHeading
        eyebrow="SIMULASI PENGETAHUAN"
        title="Ukur pemahaman, temukan fokus latihan."
        description={`${simulationQuestions.length} soal dengan opsi relevan dan pembahasan. Latihan mandiri, bukan asesmen resmi LSP.`}
      />
      {!session ? (
        <section className="panel exam-intro">
          <h2>Siapkan waktu untuk fokus.</h2>
          <p>
            Urutan soal dan pilihan diacak pada setiap sesi baru. Sesi dapat
            dilanjutkan setelah navigasi atau reload pada tab yang sama. Waktu
            tetap berjalan.
          </p>
          <label>
            Durasi latihan
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              {[10, 20, 30].map((n) => (
                <option value={n} key={n}>
                  {n} menit
                </option>
              ))}
            </select>
          </label>
          <button
            className="button primary"
            disabled={!loaded || !simulationQuestions.length}
            onClick={() => {
              change(createExam(minutes));
              setIndex(0);
            }}
          >
            Mulai simulasi
          </button>
          <small>
            Untuk praktik proyek penuh, konfirmasikan perbedaan durasi 270/290
            menit di dokumen kepada guru.
          </small>
        </section>
      ) : (
        <>
          <div className="exam-bar">
            <strong>
              {session.finished
                ? `Hasil: ${result!.score}/${result!.total} (${result!.percentage}%)`
                : `${Object.keys(session.answers).length}/${questions.length} dijawab`}
            </strong>
            <span>
              {session.finished
                ? "Simulasi selesai"
                : `Sisa ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
            </span>
            {session.finished ? (
              <button
                className="button secondary"
                onClick={() => {
                  change(null);
                  setIndex(0);
                }}
              >
                Latihan ulang
              </button>
            ) : (
              <button
                className="button primary"
                onClick={async () => {
                  if (
                    await confirm({
                      title: "Kumpulkan jawaban?",
                      description:
                        "Soal kosong dihitung salah. Setelah dikumpulkan jawaban tidak dapat diubah.",
                      accept: "Kumpulkan sekarang",
                      details: [
                        `${questions.length - Object.keys(session.answers).length} soal belum dijawab`,
                      ],
                    })
                  )
                    finish();
                }}
              >
                Kumpulkan jawaban
              </button>
            )}
          </div>
          {session.finished && result && (
            <section
              className="panel result-summary"
              aria-label="Analisis hasil"
            >
              <h2>Fokus latihan berikutnya</h2>
              <p>
                {result.score} benar · {result.total - result.score} salah atau
                kosong
              </p>
              {Object.entries(result.categories).map(([name, stat]) => (
                <div key={name}>
                  <h3>
                    {name} · {stat.correct}/{stat.total}
                  </h3>
                  <Meter
                    value={
                      stat.total
                        ? Math.round((stat.correct / stat.total) * 100)
                        : 0
                    }
                    label={name}
                  />
                </div>
              ))}
              <p>
                {Object.entries(result.categories).filter(
                  ([, s]) => s.correct < s.total,
                ).length
                  ? `Topik yang perlu diulang: ${Object.entries(
                      result.categories,
                    )
                      .filter(([, s]) => s.correct < s.total)
                      .map(([name]) => name)
                      .join(", ")}.`
                  : "Semua jawaban benar. Lanjutkan praktik proyek untuk membuktikan pemahaman."}
              </p>
            </section>
          )}
          <h2 ref={questionHeading} tabIndex={-1}>
            {session.finished
              ? "Review jawaban"
              : `Soal ${index + 1} dari ${questions.length}`}
          </h2>
          <div className="quiz-list">
            {visible.map((q) => (
              <fieldset key={q.id} className="panel quiz-card">
                <legend>{q.question}</legend>
                <p>
                  {q.category} · {q.difficulty}
                </p>
                {session.options[q.id].map((optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`quiz-option ${session.answers[q.id] === optionIndex ? "chosen" : ""} ${session.finished && q.options[optionIndex] === q.answer ? "correct" : ""}`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={session.answers[q.id] === optionIndex}
                      disabled={session.finished}
                      onChange={() => {
                        const latest = current.current;
                        if (!latest || latest.finished) return;
                        if (Date.now() >= latest.deadline) {
                          finish();
                          return;
                        }
                        change({
                          ...latest,
                          answers: { ...latest.answers, [q.id]: optionIndex },
                        });
                      }}
                    />
                    <span>{q.options[optionIndex]}</span>
                  </label>
                ))}
                {session.finished && (
                  <p className="feedback">
                    {q.options[session.answers[q.id]] === q.answer
                      ? "Benar."
                      : "Perlu diulang."}{" "}
                    Jawaban: {q.answer}. {q.explanation}
                  </p>
                )}
              </fieldset>
            ))}
          </div>
          {!session.finished && (
            <nav className="button-row" aria-label="Navigasi soal">
              <button
                className="button secondary"
                disabled={index === 0}
                onClick={() => move(index - 1)}
              >
                Sebelumnya
              </button>
              <button
                className="button primary"
                disabled={index >= questions.length - 1}
                onClick={() => move(index + 1)}
              >
                Berikutnya
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
