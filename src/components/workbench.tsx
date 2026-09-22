"use client";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  Upload,
  Trash2,
  Bookmark,
  Check,
  Clock,
  Play,
  FileText,
} from "lucide-react";
import {
  modules,
  flashcards,
  fills,
  problems,
  testCases,
  portfolioItems,
} from "@/lib/content";
import { useInteractions } from "./interaction-provider";
import { useProgress } from "./progress-provider";
import { PageHeading, Meter } from "./ui";
import {
  download,
  emptyProgress,
  normalizeProgress,
  xpOf,
  levelOf,
  type Progress,
} from "@/lib/progress";
export function Notes() {
  const { progress, update } = useProgress();
  const [filter, setFilter] = useState("Semua");
  const visible = modules.filter((m) =>
    filter === "Bookmark"
      ? progress.bookmarks.includes(m.id)
      : filter === "Ada catatan"
        ? !!progress.notes[m.id]
        : true,
  );
  return (
    <>
      <PageHeading
        eyebrow="RUANG PRIBADI"
        title="Simpan yang penting. Tulis yang dipahami."
        description="Catatan dan bookmark disimpan di browser ini. Ekspor cadangan melalui halaman progres."
      />
      <div className="tabs">
        {["Semua", "Bookmark", "Ada catatan"].map((f) => (
          <button
            className={filter === f ? "selected" : ""}
            onClick={() => setFilter(f)}
            key={f}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="notes-grid">
        {visible.map((m) => (
          <article className="panel" key={m.id}>
            <div className="section-top">
              <Link href={`/jobsheet/${m.slug}`}>
                <h2>{m.title}</h2>
              </Link>
              <button
                className="icon-button"
                aria-label={`Bookmark ${m.title}`}
                aria-pressed={progress.bookmarks.includes(m.id)}
                onClick={() =>
                  update((p) => ({
                    ...p,
                    bookmarks: p.bookmarks.includes(m.id)
                      ? p.bookmarks.filter((n) => n !== m.id)
                      : [...p.bookmarks, m.id],
                  }))
                }
              >
                <Bookmark
                  size={19}
                  fill={
                    progress.bookmarks.includes(m.id) ? "currentColor" : "none"
                  }
                />
              </button>
            </div>
            <textarea
              aria-label={`Catatan ${m.title}`}
              maxLength={20000}
              rows={5}
              placeholder="Tuliskan pemahamanmu..."
              value={progress.notes[m.id] || ""}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  notes: { ...p.notes, [m.id]: e.target.value },
                }))
              }
            />
          </article>
        ))}
      </div>
      {!visible.length ? (
        <div className="empty">
          Belum ada catatan atau bookmark pada filter ini.
        </div>
      ) : null}
    </>
  );
}
export function Testing() {
  const { progress, update, notify } = useProgress();
  const passed = Object.values(progress.tests).filter(
    (t) => t.status === "lulus",
  ).length;
  return (
    <>
      <PageHeading
        eyebrow="BUKTI PRAKTIK"
        title="Pengujian yang bisa ditelusuri."
        description="Jalankan aplikasi Laravel lokal, lalu catat hasil nyata pada skenario dari jobsheet."
      >
        <button
          className="button secondary"
          onClick={() =>
            download(
              "laporan-pengujian.md",
              testReport(progress),
              "text/markdown",
            )
          }
        >
          <Download size={16} />
          Ekspor laporan
        </button>
      </PageHeading>
      <div className="info">
        {passed} dari 10 skenario ditandai lulus. Status ini adalah catatan
        mandiri, bukan hasil pengujian otomatis portal.
      </div>
      <div className="test-list">
        {testCases.map(([id, step, data, expected]) => {
          const result = progress.tests[id] || { status: "belum", actual: "" };
          return (
            <article className="panel test-card" key={id}>
              <div className="section-top">
                <h2>
                  <span className="eyebrow">{id}</span> {step}
                </h2>
                <label className="status-select">
                  Status
                  <select
                    aria-label={`Status ${id}`}
                    value={result.status}
                    onChange={(e) => {
                      if (e.target.value === "lulus" && !result.actual.trim()) {
                        notify(
                          "Catat hasil aktual sebelum menandai skenario lulus.",
                        );
                        return;
                      }
                      update((p) => ({
                        ...p,
                        tests: {
                          ...p.tests,
                          [id]: {
                            ...result,
                            status: e.target.value as
                              "belum" | "lulus" | "gagal",
                          },
                        },
                      }));
                    }}
                  >
                    <option value="belum">Belum diuji</option>
                    <option value="lulus">Lulus</option>
                    <option value="gagal">Gagal</option>
                  </select>
                </label>
              </div>
              <div className="test-description">
                <p>
                  <strong>Data uji</strong>
                  {data}
                </p>
                <p>
                  <strong>Hasil yang diharapkan</strong>
                  {expected}
                </p>
              </div>
              <label>
                Hasil aktual & lokasi bukti
                <textarea
                  rows={2}
                  maxLength={5000}
                  value={result.actual}
                  onChange={(e) => {
                    const actual = e.target.value;
                    update((p) => ({
                      ...p,
                      tests: {
                        ...p.tests,
                        [id]: {
                          status: actual.trim() ? result.status : "belum",
                          actual,
                        },
                      },
                    }));
                  }}
                  placeholder="Apa yang benar-benar terjadi? Sertakan nama file screenshot atau catatan hasil uji."
                />
              </label>
            </article>
          );
        })}
      </div>
      <section className="panel debug-panel">
        <h2>Log debugging</h2>
        <p>
          Catat pesan error, file/baris, reproduksi, penyebab, perbaikan, dan
          hasil uji ulang.
        </p>
        <textarea
          rows={12}
          maxLength={50000}
          aria-label="Log debugging"
          value={progress.debug}
          onChange={(e) => update((p) => ({ ...p, debug: e.target.value }))}
          placeholder={
            "Tanggal:\nPesan error dan file/baris:\nLangkah reproduksi:\nExpected vs actual:\nDugaan penyebab:\nPerbaikan:\nHasil uji ulang:\nLokasi bukti sebelum/sesudah:"
          }
        />
      </section>
    </>
  );
}
function testReport(p: Progress) {
  return (
    "# Laporan Pengujian Laravel 12\n\nCatatan mandiri peserta; bukan sertifikasi atau hasil tes otomatis.\n\n" +
    testCases
      .map(
        ([id, step, data, expected]) =>
          `## ${id} ${step}\nData: ${data}\nExpected: ${expected}\nStatus: ${p.tests[id]?.status || "belum"}\nActual: ${p.tests[id]?.actual || "Belum dicatat"}\n`,
      )
      .join("\n") +
    "\n## Log debugging\n" +
    (p.debug || "Belum dicatat")
  );
}
export function Portfolio() {
  const { progress, update } = useProgress();
  function exportReport() {
    download(
      "portofolio-serkom.md",
      `# Portofolio Persiapan SERKOM RPL\n\nTanggal ekspor: ${new Date().toISOString()}\n\nIsi identitas peserta dan lokasi bukti asli sebelum diserahkan.\n\n## Checklist\n${portfolioItems.map((x, i) => `- [${progress.portfolio.includes(String(i)) ? "x" : " "}] ${x}`).join("\n")}\n\n${testReport(progress)}\n\n## Catatan modul\n${modules
        .filter((m) => progress.notes[m.id])
        .map((m) => `### ${m.title}\n${progress.notes[m.id]}\n`)
        .join("\n")}`,
      "text/markdown",
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="PERSIAPAN PENYERAHAN"
        title="Satukan proses dan bukti belajarmu."
        description="Periksa kelengkapan, lalu ekspor kerangka laporan untuk melengkapi portofolio asli."
      >
        <button className="button primary" onClick={exportReport}>
          <Download size={16} />
          Ekspor portofolio
        </button>
      </PageHeading>
      <div className="two-columns">
        <section className="panel">
          <h2>Checklist bukti kerja</h2>
          <p>
            {progress.portfolio.length} dari {portfolioItems.length} item
            disiapkan
          </p>
          <Meter
            label="Kelengkapan portofolio"
            value={(progress.portfolio.length / portfolioItems.length) * 100}
          />
          <div className="portfolio-list">
            {portfolioItems.map((item, i) => (
              <label className="check-label" key={item}>
                <input
                  type="checkbox"
                  checked={progress.portfolio.includes(String(i))}
                  onChange={(e) =>
                    update((p) => ({
                      ...p,
                      portfolio: e.target.checked
                        ? [...p.portfolio, String(i)]
                        : p.portfolio.filter((x) => x !== String(i)),
                    }))
                  }
                />
                {item}
              </label>
            ))}
          </div>
        </section>
        <aside className="panel">
          <span className="eyebrow">PRESENTASI 5 MENIT</span>
          <h2>Ceritakan cara kerjanya.</h2>
          <ol className="spaced-list">
            <li>
              <strong>Tujuan & kebutuhan</strong>
              <p>Siapa penggunanya, apa input dan outputnya?</p>
            </li>
            <li>
              <strong>Alur MVC</strong>
              <p>Tunjukkan route, controller, model, database, dan view.</p>
            </li>
            <li>
              <strong>Demo CRUD & validasi</strong>
              <p>Coba alur normal dan input tidak valid.</p>
            </li>
            <li>
              <strong>Bukti debugging & testing</strong>
              <p>Jelaskan bug, perbaikan, dan hasil aktual.</p>
            </li>
            <li>
              <strong>Refleksi</strong>
              <p>Apa yang sudah dipahami dan perlu dipelajari?</p>
            </li>
          </ol>
          <div className="info">
            Ekspor tidak menyertakan source Laravel atau screenshot secara
            otomatis. Lampirkan bukti praktik milikmu sendiri.
          </div>
        </aside>
      </div>
    </>
  );
}
export function ProgressPage() {
  const { confirm } = useInteractions();
  const { progress, update, notify } = useProgress();
  const file = useRef<HTMLInputElement>(null);
  const xp = xpOf(progress),
    level = levelOf(xp);
  const sections = [
    ["Jobsheet", progress.completedModules.length, modules.length],
    ["Flashcards", progress.masteredFlashcards.length, flashcards.length],
    ["Lengkapi kode", progress.completedFills.length, fills.length],
    ["Tantangan kode", progress.completedProblems.length, problems.length],
  ] as const;
  return (
    <>
      <PageHeading
        eyebrow="PERJALANAN BELAJAR"
        title="Setiap langkahmu tercatat."
        description="Indikator latihan pribadi. Penyelesaian modul dan XP bukan keputusan kompetensi resmi."
      />
      <div className="progress-hero">
        <div>
          <span className="eyebrow">{level.title}</span>
          <h2>
            Level {level.level}
            <span>{xp} XP terkumpul</span>
          </h2>
          <p>{100 - (xp % 100)} XP menuju level berikutnya</p>
          <Meter value={xp % 100} label="Menuju level berikutnya" />
        </div>
        <span className="big-level">
          {String(level.level).padStart(2, "0")}
        </span>
      </div>
      <div className="two-columns">
        {sections.map(([name, count, total]) => (
          <section className="panel" key={name}>
            <div className="section-top">
              <h2>{name}</h2>
              <strong>
                {count}/{total}
              </strong>
            </div>
            <Meter value={Math.round((count / total) * 100)} label={name} />
            <p>{Math.round((count / total) * 100)}% selesai</p>
          </section>
        ))}
      </div>
      {progress.exam ? (
        <section className="panel result-summary">
          <h2>Simulasi terakhir</h2>
          <p>
            Skor {progress.exam.score}/{progress.exam.total} ·{" "}
            {new Date(progress.exam.date).toLocaleDateString("id-ID")}
          </p>
        </section>
      ) : null}
      <section className="panel data-panel">
        <h2>Data belajar milikmu</h2>
        <p>
          Progres, catatan, dan draft kode tersimpan di browser/perangkat ini.
          Tidak ada akun atau sinkronisasi cloud. Ekspor sebelum berganti
          perangkat atau membersihkan browser.
        </p>
        <div className="button-row">
          <button
            className="button primary"
            onClick={() =>
              download(
                "educode-progress.json",
                JSON.stringify(progress, null, 2),
              )
            }
          >
            <Download size={16} />
            Ekspor cadangan
          </button>
          <button
            className="button secondary"
            onClick={() => file.current?.click()}
          >
            <Upload size={16} />
            Impor cadangan
          </button>
          <button
            className="button danger"
            onClick={async () => {
              if (
                await confirm({
                  title: "Reset seluruh progres?",
                  description:
                    "Catatan, hasil uji, draft kode, dan progres pada perangkat ini akan dihapus. Ekspor cadangan terlebih dahulu; tindakan ini tidak dapat dibatalkan.",
                  tone: "danger",
                  requireText: "RESET",
                  accept: "Hapus progres",
                })
              ) {
                update(() => emptyProgress());
                try {
                  [
                    "edu_modules",
                    "edu_cards",
                    "edu_fills",
                    "edu_problems",
                    "edu_xp",
                    "edu_theme",
                    "educode:exam",
                  ].forEach((k) => localStorage.removeItem(k));
                  sessionStorage.removeItem("educode:exam");
                } catch {}
                notify("Data EduCode sudah direset.", "success");
              }
            }}
          >
            <Trash2 size={16} />
            Reset progres
          </button>
        </div>
        <input
          ref={file}
          hidden
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            const selected = e.target.files?.[0];
            e.target.value = "";
            if (!selected) return;
            if (selected.size > 2000000) {
              notify("Ukuran cadangan maksimal 2 MB.", "danger");
              return;
            }
            try {
              const raw = JSON.parse(await selected.text());
              if (raw?.version !== 2 || !Array.isArray(raw.completedModules))
                throw new Error("format");
              const imported = normalizeProgress(raw);
              if (
                await confirm({
                  title: "Impor cadangan belajar?",
                  description:
                    "Cadangan ini akan mengganti progres saat ini. Ekspor data sekarang jika ingin menyimpannya.",
                  accept: "Ganti dengan cadangan",
                  details: [
                    selected.name,
                    `${imported.completedModules.length} modul selesai · ${xpOf(imported)} XP`,
                    `${Object.keys(imported.notes).length} catatan · ${imported.completedFills.length} latihan sintaks selesai`,
                  ],
                })
              ) {
                update(() => imported);
                notify("Cadangan berhasil diimpor.", "success");
              }
            } catch {
              notify(
                "File bukan cadangan EduCode versi 2 yang valid.",
                "danger",
              );
            }
          }}
        />
      </section>
    </>
  );
}
const quiz = flashcards.slice(0, 10).map((f, i) => {
  const wrong = [
    flashcards[(i + 5) % 20].a,
    flashcards[(i + 10) % 20].a,
    flashcards[(i + 15) % 20].a,
  ];
  const options = [...wrong];
  options.splice(i % 4, 0, f.a);
  return { ...f, options, correct: i % 4 };
});
type ExamState = {
  deadline: number;
  answers: Record<number, number>;
  finished: boolean;
};
export function Exam() {
  const { confirm } = useInteractions();
  const { update } = useProgress();
  const [session, setSession] = useState<ExamState | null>(null),
    [minutes, setMinutes] = useState(20),
    [remaining, setRemaining] = useState(0),
    [loaded, setLoaded] = useState(false);
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem("educode:exam") || "null",
      );
      if (
        saved &&
        typeof saved.deadline === "number" &&
        typeof saved.finished === "boolean" &&
        saved.answers &&
        typeof saved.answers === "object" &&
        !Array.isArray(saved.answers)
      ) {
        const answers = Object.fromEntries(
          Object.entries(saved.answers).filter(
            ([k, v]) =>
              Number(k) >= 0 &&
              Number(k) < 10 &&
              Number.isInteger(v) &&
              Number(v) >= 0 &&
              Number(v) < 4,
          ),
        );
        setSession({
          deadline: saved.deadline,
          finished: saved.finished,
          answers: answers as Record<number, number>,
        });
      }
    } catch {}
    setLoaded(true);
  }, []);
  const finish = useCallback(() => {
    const current = sessionRef.current;
    if (!current || current.finished) return;
    const score = quiz.reduce(
      (n, q, i) => n + (current.answers[i] === q.correct ? 1 : 0),
      0,
    );
    setSession({ ...current, finished: true });
    update((p) => ({
      ...p,
      exam: { score, total: quiz.length, date: new Date().toISOString() },
    }));
  }, [update]);
  useEffect(() => {
    if (!loaded) return;
    try {
      if (session)
        sessionStorage.setItem("educode:exam", JSON.stringify(session));
      else sessionStorage.removeItem("educode:exam");
    } catch {}
  }, [session, loaded]);
  useEffect(() => {
    if (!session || session.finished) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((session.deadline - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left === 0) finish();
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [session, finish]);
  const score = session
    ? quiz.reduce(
        (n, q, i) => n + (session.answers[i] === q.correct ? 1 : 0),
        0,
      )
    : 0;
  return (
    <>
      <PageHeading
        eyebrow="SIMULASI PENGETAHUAN"
        title="Ukur pemahaman, temukan fokus latihan."
        description="10 soal pilihan ganda berdasarkan materi. Ini latihan pengetahuan, bukan asesmen resmi LSP."
      />
      {!session ? (
        <section className="panel exam-intro">
          <Clock size={44} />
          <h2>Siapkan waktu untuk fokus.</h2>
          <p>
            Jawaban disimpan selama sesi browser. Waktu terus berjalan saat
            berpindah halaman. Saat waktu habis, jawaban dikumpulkan otomatis.
          </p>
          <label>
            Durasi latihan
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              <option value={10}>10 menit</option>
              <option value={20}>20 menit</option>
              <option value={30}>30 menit</option>
            </select>
          </label>
          <button
            disabled={!loaded}
            className="button primary"
            onClick={() => {
              setSession({
                deadline: Date.now() + minutes * 60000,
                answers: {},
                finished: false,
              });
              setRemaining(minutes * 60);
            }}
          >
            <Play size={16} />
            Mulai simulasi
          </button>
          <small>
            Untuk simulasi proyek penuh, diskusikan durasi 270/290 menit yang
            berbeda dalam dokumen dengan guru.
          </small>
        </section>
      ) : (
        <>
          <div className="exam-bar">
            <strong>
              {session.finished
                ? `Hasil: ${score}/${quiz.length} (${score * 10}%)`
                : `${Object.keys(session.answers).length}/${quiz.length} dijawab`}
            </strong>
            <span>
              <Clock size={17} />
              {session.finished
                ? "Simulasi selesai"
                : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
            </span>
            {session.finished ? (
              <button
                className="button secondary"
                onClick={() => setSession(null)}
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
                        "Jawaban yang dikumpulkan tidak dapat diubah. Soal kosong dihitung salah. Waktu simulasi tetap berjalan selama dialog terbuka.",
                      accept: "Kumpulkan sekarang",
                      details: [
                        `${Object.keys(session.answers).length} dari ${quiz.length} soal sudah dijawab`,
                        `${quiz.length - Object.keys(session.answers).length} soal belum dijawab`,
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
          <div className="quiz-list">
            {quiz.map((q, i) => (
              <fieldset className="panel quiz-card" key={q.id}>
                <legend>
                  {i + 1}. {q.q}
                </legend>
                {q.options.map((option, j) => (
                  <label
                    key={j}
                    className={`quiz-option ${session.answers[i] === j ? "chosen" : ""} ${session.finished && j === q.correct ? "correct" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`question-${i}`}
                      checked={session.answers[i] === j}
                      disabled={session.finished}
                      onChange={() => {
                        if (Date.now() >= session.deadline) {
                          finish();
                          return;
                        }
                        setSession({
                          ...session,
                          answers: { ...session.answers, [i]: j },
                        });
                      }}
                    />
                    <span>{option}</span>
                    {session.finished && j === q.correct ? (
                      <Check size={18} />
                    ) : null}
                  </label>
                ))}
                {session.finished ? (
                  <p className="feedback">
                    {session.answers[i] === q.correct
                      ? "Benar."
                      : "Perlu diulang."}{" "}
                    {q.a}
                  </p>
                ) : null}
              </fieldset>
            ))}
          </div>
        </>
      )}
    </>
  );
}
export function References() {
  return (
    <>
      <PageHeading
        eyebrow="SUMBER PEMBELAJARAN"
        title="Baca konteksnya secara lengkap."
        description="Isi kedua dokumen disertakan sebagai referensi. Instruksi di dalamnya ditujukan untuk latihan Laravel."
      />
      <div className="two-columns">
        {[
          {
            slug: "jobsheet",
            title: "Jobsheet pembelajaran",
            desc: "Spesifikasi, langkah praktik, kode proyek, checkpoint, pengujian, dan portofolio.",
          },
          {
            slug: "rangkuman",
            title: "Rangkuman & analisis lengkap",
            desc: "18 bagian pembahasan, kamus sintaks, bedah kode, debugging, dan pertanyaan lisan.",
          },
        ].map((d) => (
          <Link
            className="panel reference-card"
            href={`/referensi/${d.slug}`}
            key={d.slug}
          >
            <FileText size={35} />
            <h2>{d.title}</h2>
            <p>{d.desc}</p>
            <span className="text-link">Baca dokumen lengkap →</span>
          </Link>
        ))}
      </div>
      <div className="panel source-policy">
        <h2>Rujukan dan ruang lingkup</h2>
        <p>
          Sumber: dokumen pengguna, Jobsheet Pembelajaran Persiapan SERKOM RPL
          Laravel 12 Kopi Ulee Kareng dan Rangkuman Analisis Laravel 12 SERKOM
          Lengkap. Jobsheet mencantumkan Raeza Maulana, S.Pd. serta SMK Negeri 5
          Telkom Banda Aceh. Portal ini adalah alat bantu belajar, bukan portal
          resmi LSP.
        </p>
        <p>
          Kode unit dan judul yang berbeda pada SKKNI, MUK, atau skema harus
          diverifikasi melalui LSP. Waktu simulasi 270 menit pada identitas
          dokumen berbeda dari total tabel 290 menit. Portal mempertahankan
          sumber dan menjelaskan perbedaannya.
        </p>
        <p>
          Contoh ringkas di portal diselaraskan menjadi nama_produk, max:100,
          dan penyimpanan data tervalidasi. Dokumen referensi disajikan sebagai
          transkripsi, termasuk isi tabel, tanpa menjalankan instruksinya.
        </p>
      </div>
    </>
  );
}
