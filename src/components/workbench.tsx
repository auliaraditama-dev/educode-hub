"use client";
import Link from "next/link";
import { useState } from "react";
import { Download, Bookmark, FileText } from "lucide-react";
import {
  modules,
  flashcards,
  fills,
  problems,
  testCases,
  portfolioItems,
} from "@/lib/content";
import { useProgress } from "./progress-provider";
import { PageHeading, Meter } from "./ui";
import { download, xpOf, levelOf, type Progress } from "@/lib/progress";
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
        description="Catatan dan bookmark disimpan di browser ini. Ekspor cadangan melalui Pusat data."
      />
      <div className="tabs">
        {["Semua", "Bookmark", "Ada catatan"].map((f) => (
          <button
            aria-pressed={filter === f}
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
              <Link prefetch={false} href={`/jobsheet/${m.slug}`}>
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
        {passed} dari {testCases.length} skenario ditandai lulus. Status ini
        adalah catatan mandiri, bukan hasil pengujian otomatis portal.
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
  const { progress } = useProgress();
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
            <Meter
              value={total ? Math.round((count / total) * 100) : 0}
              label={name}
            />
            <p>{total ? Math.round((count / total) * 100) : 0}% selesai</p>
          </section>
        ))}
      </div>
      <section className="panel result-summary">
        <h2>Latihan variasi</h2>
        <p>
          {progress.practice.correct} jawaban benar dari{" "}
          {progress.practice.attempts} pemeriksaan. Tidak menambah XP dasar.
        </p>
        <Link
          prefetch={false}
          href="/latihan?tab=variasi"
          className="text-link"
        >
          Buka paket latihan baru →
        </Link>
      </section>
      {progress.exam ? (
        <section className="panel result-summary">
          <h2>Simulasi terakhir</h2>
          <p>
            Skor {progress.exam.score}/{progress.exam.total} ·{" "}
            {new Date(progress.exam.date).toLocaleDateString("id-ID")}
          </p>
        </section>
      ) : null}
      <Link href="/keamanan" className="button secondary">
        Kelola data & pemulihan →
      </Link>
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
            prefetch={false}
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


