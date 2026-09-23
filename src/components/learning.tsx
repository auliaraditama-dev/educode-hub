"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Check,
  Clock,
  Shuffle,
  RotateCcw,
  Play,
  Lightbulb,
} from "lucide-react";
import {
  modules,
  cheatsheets,
  flashcards,
  fills,
  problems,
} from "@/lib/content";
import { runnerHtml } from "@/lib/runner";
import { useInteractions } from "./interaction-provider";
import { useProgress } from "./progress-provider";
import { CodeBlock, PageHeading, Meter } from "./ui";
export function Jobsheets() {
  const { progress } = useProgress();
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("Semua");
  const filtered = modules.filter(
    (m) =>
      (category === "Semua" || m.category === category) &&
      `${m.title} ${m.summary}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="LEARNING PATH"
        title="Belajar dari awal. Paham sampai akhir."
        description="12 modul terarah untuk membangun proyek Laravel 12 Kopi Ulee Kareng."
      />
      <div className="filter-row">
        <div className="tabs">
          {["Semua", "Fondasi", "Implementasi", "Verifikasi"].map((c) => (
            <button
              className={category === c ? "selected" : ""}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-input">
          <Search size={17} />
          <input
            aria-label="Cari modul"
            placeholder="Cari modul..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="module-grid">
        {filtered.map((m) => (
          <Link
            prefetch={false}
            key={m.id}
            href={`/jobsheet/${m.slug}`}
            className="module-card"
          >
            <div className="section-top">
              <span className="module-id">{String(m.id).padStart(2, "0")}</span>
              <span className="status-badge">
                {progress.completedModules.includes(m.id)
                  ? "✓ Selesai"
                  : m.category}
              </span>
            </div>
            <h2>{m.title}</h2>
            <p>{m.summary}</p>
            <div className="module-footer">
              <span>
                <Clock size={14} />
                {m.minutes} menit
              </span>
              <span>
                Pelajari modul <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length ? (
        <div className="empty">
          Tidak ada modul yang cocok. Coba kata kunci lain.
        </div>
      ) : null}
    </>
  );
}
export function LessonTools({ id }: { id: number }) {
  const { confirm } = useInteractions();
  const { progress, update, complete } = useProgress();
  const m = modules.find((x) => x.id === id)!;
  const done = progress.completedModules.includes(id),
    saved = progress.bookmarks.includes(id);
  useEffect(() => {
    update((p) => ({ ...p, lastModule: id }));
  }, [id, update]);
  return (
    <>
      <div className="lesson-tools">
        <button
          className={`button ${done ? "success" : "primary"}`}
          disabled={done}
          onClick={async () => {
            if (
              await confirm({
                title: "Selesaikan modul ini?",
                description: m.checkpoint,
                tone: "success",
                details: m.goals,
                acknowledgement:
                  "Saya sudah mempraktikkan materi dan memeriksa checkpoint jobsheet.",
                accept: "Simpan penyelesaian · +50 XP",
              })
            )
              complete("completedModules", id);
          }}
        >
          <Check size={17} />
          {done ? "Modul selesai" : "Tandai selesai · +50 XP"}
        </button>
        <button
          className="button secondary"
          onClick={() =>
            update((p) => ({
              ...p,
              bookmarks: saved
                ? p.bookmarks.filter((n) => n !== id)
                : [...p.bookmarks, id],
            }))
          }
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          {saved ? "Tersimpan" : "Bookmark"}
        </button>
      </div>
      <section className="panel note-panel">
        <label htmlFor="lesson-note">
          <h2>Catatan belajarmu</h2>
        </label>
        <p>
          Tulis pemahaman, pertanyaan, atau bukti checkpoint untuk modul ini.
        </p>
        <textarea
          id="lesson-note"
          rows={5}
          maxLength={20000}
          value={progress.notes[String(id)] || ""}
          onChange={(e) =>
            update((p) => ({
              ...p,
              notes: { ...p.notes, [id]: e.target.value },
            }))
          }
          placeholder="Hari ini saya memahami..."
        />
        <small>
          Tersimpan otomatis di perangkat ini. Ekspor cadangan melalui Progres
          belajar.
        </small>
      </section>
      <div className="lesson-navigation">
        {id > 1 ? (
          <Link
            prefetch={false}
            className="button secondary"
            href={`/jobsheet/${modules[id - 2].slug}`}
          >
            <ArrowLeft size={16} />
            Modul sebelumnya
          </Link>
        ) : (
          <span />
        )}
        {id < modules.length ? (
          <Link
            prefetch={false}
            className="button secondary"
            href={`/jobsheet/${modules[id].slug}`}
          >
            Modul berikutnya
            <ArrowRight size={16} />
          </Link>
        ) : (
          <Link
            prefetch={false}
            className="button secondary"
            href="/portofolio"
          >
            Periksa portofolio
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
      <Link
        prefetch={false}
        className="text-link"
        href={`/referensi/rangkuman#bagian-${m.reference}`}
      >
        Baca pembahasan lengkap dalam rangkuman →
      </Link>
    </>
  );
}
export function Cheatsheet() {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("Semua");
  const results = cheatsheets.filter(
    (c) =>
      (filter === "Semua" || c.lang === filter) &&
      `${c.title} ${c.desc} ${c.code}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="REFERENSI CEPAT"
        title="Sintaks yang kamu butuhkan."
        description="Cari, pahami, dan salin contoh Laravel yang selaras dengan jobsheet."
      />
      <div className="filter-row">
        <div className="tabs">
          {["Semua", "artisan", "blade", "php", "laravel"].map((c) => (
            <button
              key={c}
              className={filter === c ? "selected" : ""}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-input">
          <Search size={16} />
          <input
            aria-label="Cari sintaks"
            placeholder="Cari sintaks, route, validasi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="cheat-grid">
        {results.map((c) => (
          <article className="panel cheat-card" key={c.title}>
            <span className="eyebrow">{c.lang}</span>
            <h2>{c.title}</h2>
            <p>{c.desc}</p>
            <CodeBlock code={c.code} label={c.lang.toUpperCase()} />
          </article>
        ))}
      </div>
      {!results.length ? (
        <div className="empty">Sintaks tidak ditemukan.</div>
      ) : null}
    </>
  );
}
export function Flashcards() {
  const { progress, complete } = useProgress();
  const [order, setOrder] = useState(flashcards.map((f) => f.id)),
    [index, setIndex] = useState(0),
    [flipped, setFlipped] = useState(false),
    [onlyReview, setOnlyReview] = useState(false);
  const available = onlyReview
    ? order.filter((id) => !progress.masteredFlashcards.includes(id))
    : order;
  const card = flashcards.find(
    (f) => f.id === available[index % Math.max(available.length, 1)],
  );
  function move(dir: number) {
    setIndex((i) => (i + dir + available.length) % available.length);
    setFlipped(false);
  }
  return (
    <>
      <PageHeading
        eyebrow="ACTIVE RECALL"
        title="Pahami. Ingat. Ulangi."
        description="20 kartu konsep Laravel dan pertanyaan lisan untuk melatih pemahaman."
      />
      <div className="study-width">
        <div className="filter-row">
          <label className="check-label">
            <input
              type="checkbox"
              checked={onlyReview}
              onChange={(e) => {
                setOnlyReview(e.target.checked);
                setIndex(0);
                setFlipped(false);
              }}
            />
            Hanya yang belum dikuasai
          </label>
          <button
            className="button secondary"
            onClick={() => {
              setOrder((o) => {
                const a = [...o];
                for (let i = a.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [a[i], a[j]] = [a[j], a[i]];
                }
                return a;
              });
              setIndex(0);
              setFlipped(false);
            }}
          >
            <Shuffle size={16} />
            Acak kartu
          </button>
        </div>
        {card ? (
          <>
            <div className="flashcard-counter">
              Kartu {(index % available.length) + 1} dari {available.length}
              <span>{progress.masteredFlashcards.length} dikuasai</span>
            </div>
            <button
              className={`flashcard ${flipped ? "flipped" : ""}`}
              onClick={() => setFlipped((v) => !v)}
              aria-label={
                flipped ? "Tampilkan pertanyaan" : "Tampilkan jawaban"
              }
            >
              <span className="eyebrow">
                {flipped ? "JAWABAN" : card.category}
              </span>
              <span className="flashcard-text">
                {flipped ? card.a : card.q}
              </span>
              <span className="flip-hint">
                <RotateCcw size={16} />
                Klik atau tekan Enter untuk membalik kartu
              </span>
            </button>
            <div className="flashcard-controls">
              <button
                className="button secondary"
                aria-label="Kartu sebelumnya"
                onClick={() => move(-1)}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                className="button primary"
                disabled={progress.masteredFlashcards.includes(card.id)}
                onClick={() => {
                  complete("masteredFlashcards", card.id);
                  setFlipped(false);
                }}
              >
                <Check size={17} />
                {progress.masteredFlashcards.includes(card.id)
                  ? "Sudah dikuasai"
                  : "Saya sudah paham · +10 XP"}
              </button>
              <button
                className="button secondary"
                aria-label="Kartu berikutnya"
                onClick={() => move(1)}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="empty">
            Semua kartu sudah ditandai dikuasai. Matikan filter untuk mengulang.
          </div>
        )}
        <Meter
          value={Math.round(
            (progress.masteredFlashcards.length / flashcards.length) * 100,
          )}
          label="Flashcard dikuasai"
        />
      </div>
    </>
  );
}
export function FillCode() {
  const { progress, complete } = useProgress();
  const [answers, setAnswers] = useState<Record<number, string>>({}),
    [feedback, setFeedback] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState("all");
  const visibleFills = fills.filter(
    (f) => filter === "all" || !progress.completedFills.includes(f.id),
  );
  const check = (f: (typeof fills)[number]) => {
    const valid = answers[f.id]?.trim() === f.answer;
    setFeedback((a) => ({
      ...a,
      [f.id]: valid
        ? "Benar! Sintaks sudah sesuai."
        : "Belum tepat. Periksa huruf besar, tanda kurung, dan petunjuk.",
    }));
    if (valid) complete("completedFills", f.id);
  };
  return (
    <>
      <PageHeading
        eyebrow="LATIHAN SINTAKS"
        title="Satu bagian kecil. Satu pemahaman baru."
        description="Lengkapi sintaks yang hilang. Setiap latihan memberikan 20 XP satu kali."
      />
      <Link
        prefetch={false}
        className="panel practice-promo"
        href="/latihan-variasi"
      >
        <strong>Butuh soal yang selalu berganti?</strong>
        <span>Coba 12 soal variasi sintaks & perbaikan kode →</span>
      </Link>
      <div className="panel practice-toolbar">
        <div className="practice-progress">
          <strong>
            {progress.completedFills.length} / {fills.length} latihan dikuasai
          </strong>
          <Meter
            value={Math.round(
              (progress.completedFills.length / fills.length) * 100,
            )}
            label="Progres latihan sintaks"
          />
        </div>
        <select
          aria-label="Filter latihan sintaks"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Semua latihan</option>
          <option value="unfinished">Belum selesai</option>
        </select>
      </div>
      {visibleFills.length === 0 && (
        <div className="panel empty-practice">
          <Check size={32} />
          <h2>Semua sintaks sudah dikuasai!</h2>
          <p>Lanjutkan praktik CRUD Kopi Ulee Kareng pada jobsheet.</p>
          <Link prefetch={false} href="/jobsheet" className="button primary">
            Lanjut ke jobsheet <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <div className="fill-list">
        {visibleFills.map((f) => {
          const done = progress.completedFills.includes(f.id);
          return (
            <article
              className={`panel fill-card ${done ? "is-complete" : ""}`}
              key={f.id}
            >
              <div className="section-top">
                <h2>
                  {f.id}. {f.title}
                </h2>
                <span className={`status-badge ${done ? "done" : ""}`}>
                  {done ? "✓ Selesai" : "+20 XP"}
                </span>
              </div>
              <div className="fill-code">
                <pre>{f.before}</pre>
                <input
                  aria-label={`Jawaban ${f.title}`}
                  aria-describedby={`feedback-${f.id}`}
                  aria-invalid={Boolean(feedback[f.id] && !done)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      check(f);
                    }
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={done}
                  value={done ? f.answer : answers[f.id] || ""}
                  onChange={(e) => {
                    setAnswers((a) => ({ ...a, [f.id]: e.target.value }));
                    setFeedback((a) => ({ ...a, [f.id]: "" }));
                  }}
                  placeholder="ketik jawaban"
                />
                <pre>{f.after}</pre>
              </div>
              <div className="fill-bottom">
                <details>
                  <summary>Petunjuk</summary>
                  <p>{f.hint}</p>
                </details>
                <button
                  className="button secondary"
                  disabled={done}
                  onClick={() => check(f)}
                >
                  Periksa jawaban <Check size={15} />
                </button>
              </div>
              <p
                id={`feedback-${f.id}`}
                className={`feedback ${done ? "correct" : ""}`}
                role="status"
              >
                {feedback[f.id]}
              </p>
            </article>
          );
        })}
      </div>
    </>
  );
}
export function Challenges() {
  const { confirm } = useInteractions();
  const { progress, update, complete } = useProgress();
  const [selected, setSelected] = useState(1),
    [output, setOutput] = useState(
      "Jalankan kode untuk melihat hasil setiap test case.",
    ),
    [busy, setBusy] = useState(false),
    [hint, setHint] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const [runnerReady, setRunnerReady] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const p = problems.find((p) => p.id === selected)!;
  const initial = `function ${p.fn}(${p.arg}) {\n  // Tulis solusi kamu di sini\n  return 0;\n}`;
  const code = progress.drafts[String(p.id)] ?? initial;
  useEffect(() => () => cleanupRef.current?.(), []);
  function run() {
    if (busy || !runnerReady || !frame.current?.contentWindow) return;
    setBusy(true);
    setOutput("Menjalankan test case…");
    const id = crypto.randomUUID();
    const stop = () => {
      clearTimeout(timer);
      window.removeEventListener("message", listener);
      setBusy(false);
      cleanupRef.current = null;
    };
    const listener = (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.data?.id !== id
      )
        return;
      const data = event.data;
      if (typeof data.error === "string") {
        setOutput(data.error.slice(0, 1000));
        stop();
        return;
      }
      if (
        !Array.isArray(data.results) ||
        data.results.length !== p.tests.length
      )
        return;
      const result = data.results as { pass: boolean; actual: string }[];
      const passed = result.every((r) => r.pass === true);
      setOutput(
        result
          .map(
            (r, i) =>
              `${r.pass ? "✓" : "✗"} Test ${i + 1}: ${JSON.stringify(p.tests[i].args)}\n  Expected: ${JSON.stringify(p.tests[i].expected)}\n  Actual: ${String(r.actual).slice(0, 500)}`,
          )
          .join("\n\n") +
          `\n\n${passed ? "Semua test lulus." : "Masih ada test yang gagal."}`,
      );
      if (passed) complete("completedProblems", p.id);
      stop();
    };
    window.addEventListener("message", listener);
    const timer = setTimeout(() => {
      setOutput(
        "Batas waktu terlampaui (3 detik). Periksa perulangan tak berujung.",
      );
      frame.current?.contentWindow?.postMessage({ cancel: true }, "*");
      stop();
    }, 3500);
    cleanupRef.current = stop;
    frame.current.contentWindow.postMessage(
      { id, code, fn: p.fn, tests: p.tests },
      "*",
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="CODE LAB"
        title="Uji logikamu, baris demi baris."
        description="Latihan JavaScript pendukung konsep Laravel. PHP dijalankan pada proyek Laravel lokal."
      />
      <div className="challenge-layout">
        <aside className="panel challenge-list">
          {problems.map((item) => (
            <button
              disabled={busy}
              key={item.id}
              className={selected === item.id ? "selected" : ""}
              onClick={() => {
                setSelected(item.id);
                setHint(false);
                setOutput(
                  "Jalankan kode untuk melihat hasil setiap test case.",
                );
              }}
            >
              <span>{String(item.id).padStart(2, "0")}</span>
              <div>
                <strong>{item.title}</strong>
                <small>
                  {progress.completedProblems.includes(item.id)
                    ? "✓ Selesai"
                    : item.difficulty}
                </small>
              </div>
            </button>
          ))}
        </aside>
        <section className="challenge-main">
          <div className="panel">
            <span className="eyebrow">{p.difficulty} · +100 XP</span>
            <h2>{p.title}</h2>
            <p>{p.desc}</p>
            <div className="sample">
              Contoh:{" "}
              <code>
                {JSON.stringify(p.tests[0].args)} →{" "}
                {JSON.stringify(p.tests[0].expected)}
              </code>
            </div>
            {hint ? <div className="info">{p.hint}</div> : null}
          </div>
          <div className="code-block">
            <div className="code-header">
              <span>solution.js</span>
              <span>JavaScript</span>
            </div>
            <textarea
              className="code-editor"
              aria-label="Editor solusi JavaScript"
              spellCheck={false}
              maxLength={20000}
              value={code}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  drafts: { ...s.drafts, [p.id]: e.target.value },
                }))
              }
            />
            <div className="code-actions">
              <button onClick={() => setHint(!hint)}>
                <Lightbulb size={15} />
                Petunjuk
              </button>
              <button
                disabled={busy}
                onClick={async () => {
                  if (
                    await confirm({
                      title: "Reset kode tantangan?",
                      description:
                        "Draft untuk tantangan ini akan diganti dengan kode awal. Salin solusi yang ingin disimpan terlebih dahulu.",
                      tone: "danger",
                      accept: "Reset kode",
                    })
                  )
                    update((s) => ({
                      ...s,
                      drafts: { ...s.drafts, [p.id]: initial },
                    }));
                }}
              >
                <RotateCcw size={15} />
                Reset
              </button>
              <button
                className="button primary"
                disabled={busy || !runnerReady}
                onClick={run}
              >
                <Play size={14} />
                {busy ? "Menjalankan…" : "Jalankan kode"}
              </button>
            </div>
          </div>
          <div className="panel output">
            <h3>Hasil pengujian</h3>
            <pre role="status">{output}</pre>
          </div>
          <details className="panel">
            <summary>Lihat pembahasan</summary>
            <p>{p.hint}</p>
            <CodeBlock
              label="JAVASCRIPT"
              code={`function ${p.fn}(${p.arg}) {\n  ${p.solution}\n}`}
            />
          </details>
        </section>
      </div>
      <iframe
        ref={frame}
        srcDoc={runnerHtml}
        onLoad={() => setRunnerReady(true)}
        sandbox="allow-scripts"
        title="Sandbox eksekusi kode"
        className="runner-frame"
      />
    </>
  );
}
