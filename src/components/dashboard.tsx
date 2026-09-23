"use client";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Code2,
  Flame,
  Layers,
  Play,
  Terminal,
  Trophy,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { modules, fills, flashcards, problems } from "@/lib/content";
import { useProgress } from "./progress-provider";
import { xpOf } from "@/lib/progress";
import { Meter } from "./ui";
export default function Dashboard() {
  const { progress } = useProgress();
  const done = progress.completedModules.length;
  const next =
    modules.find((m) => !progress.completedModules.includes(m.id)) ||
    modules[0];
  const percent = Math.round((done / modules.length) * 100);
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <div className="eyebrow">YOUR DEVELOPER JOURNEY</div>
          <h1>
            Selangkah lebih dekat,
            <br className="mobile-break" /> jadi developer hebat
            <span className="orange">.</span>
          </h1>
          <p>
            Lanjutkan belajarmu, bangun pemahaman, dan siapkan diri untuk
            SERKOM.
          </p>
        </div>
        <span className="course-pill">
          <span />
          Laravel 12 Learning Path
        </span>
      </div>
      <div className="dashboard-top">
        <section className="continue-card">
          <div className="continue-content">
            <span className="light-eyebrow">
              <span /> LANJUTKAN PERJALANANMU
            </span>
            <h2>
              Dari paham konsep,
              <br />
              sampai siap praktik.
            </h2>
            <p>
              Pelajari Laravel 12 lewat proyek nyata
              <br className="desktop-break" /> Kopi Ulee Kareng. Satu langkah
              setiap hari.
            </p>
            <div className="continue-meta">
              <span>
                <BookOpen size={15} />
                12 modul terarah
              </span>
              <span>
                <Clock size={15} />
                Belajar mandiri
              </span>
            </div>
            <Link
              prefetch={false}
              className="button primary"
              href={`/jobsheet/${next.slug}`}
            >
              <Play size={15} fill="currentColor" />{" "}
              {done ? "Lanjutkan belajar" : "Mulai belajar"}
              <ArrowRight size={17} />
            </Link>
          </div>
          <div
            className="hero-editor"
            aria-label="Contoh struktur kode Laravel"
          >
            <div className="editor-title">
              <span>
                <i />
                <i />
                <i />
              </span>
              <span>ProductController.php</span>
              <span>PHP</span>
            </div>
            <div className="editor-code">
              <div>
                <em>01</em>
                <span className="syntax-violet">public function</span> index()
              </div>
              <div>
                <em>02</em>
                {"{"}
              </div>
              <div>
                <em>03</em> <span className="syntax-orange">$products</span> =
                Product::<span className="syntax-blue">all</span>();
              </div>
              <div>
                <em>04</em>
              </div>
              <div>
                <em>05</em> <span className="syntax-violet">return</span> view(
              </div>
              <div>
                <em>06</em>{" "}
                <span className="syntax-green">&apos;produk.index&apos;</span>,
              </div>
              <div>
                <em>07</em> compact(
                <span className="syntax-green">&apos;products&apos;</span>)
              </div>
              <div>
                <em>08</em> );
              </div>
              <div>
                <em>09</em>
                {"}"}
              </div>
            </div>
            <div className="editor-footer">
              <span>◇ Laravel 12</span>
              <span>
                UTF-8 <Check size={13} />
              </span>
            </div>
          </div>
        </section>
        <section className="goal-card">
          <div className="section-top">
            <span className="icon-tile soft-orange">
              <Target size={20} />
            </span>
            <span className="tiny-label">TARGET BELAJAR</span>
          </div>
          <h3>Konsisten itu kunci.</h3>
          <p>
            Selesaikan modul, lalu uji
            <br />
            pemahaman lewat latihan.
          </p>
          <div className="goal-number">
            {done}
            <span> / {modules.length} modul</span>
            <strong>{percent}%</strong>
          </div>
          <Meter value={percent} label="Modul selesai" />
          <p className="goal-note">
            {done === 12
              ? "Semua modul ditandai selesai. Periksa bukti praktikmu."
              : `${modules.length - done} modul lagi dalam perjalananmu.`}
          </p>
          <Link prefetch={false} href="/progress">
            Lihat progres lengkap <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
      <div className="stats-row">
        {[
          {
            label: "Modul selesai",
            value: `${done}`,
            of: "/ 12",
            icon: BookOpen,
            color: "orange",
            caption: "Bangun fondasi yang kuat",
          },
          {
            label: "Latihan tuntas",
            value: `${progress.completedFills.length + progress.completedProblems.length}`,
            of: `/ ${fills.length + problems.length}`,
            icon: Code2,
            color: "blue",
            caption: "Belajar dengan praktik",
          },
          {
            label: "Kartu dikuasai",
            value: `${progress.masteredFlashcards.length}`,
            of: `/ ${flashcards.length}`,
            icon: Layers,
            color: "violet",
            caption: "Ingat konsep lebih lama",
          },
          {
            label: "Total pengalaman",
            value: `${xpOf(progress)}`,
            of: "XP",
            icon: Trophy,
            color: "green",
            caption: "Setiap usaha berarti",
          },
        ].map((s) => (
          <section className="stat" key={s.label}>
            <div>
              <span className="stat-label">{s.label}</span>
              <div className="stat-number">
                {s.value}
                <span>{s.of}</span>
              </div>
              <p>{s.caption}</p>
            </div>
            <span className={`icon-tile soft-${s.color}`}>
              <s.icon size={21} />
            </span>
          </section>
        ))}
      </div>
      <div className="content-columns">
        <section>
          <div className="section-heading">
            <div>
              <h2>Learning path kamu</h2>
              <p>Langkah terarah dari fondasi hingga verifikasi.</p>
            </div>
            <Link prefetch={false} href="/jobsheet">
              Semua modul <ArrowRight size={15} />
            </Link>
          </div>
          <div className="path-list">
            {modules.slice(0, 4).map((m, i) => (
              <Link
                prefetch={false}
                href={`/jobsheet/${m.slug}`}
                className="path-item"
                key={m.id}
              >
                <span
                  className={`path-number ${progress.completedModules.includes(m.id) ? "completed" : ""}`}
                >
                  {progress.completedModules.includes(m.id) ? (
                    <Check size={19} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <div className="path-info">
                  <span className="tiny-label">
                    {m.category} <span>· {m.minutes} menit</span>
                  </span>
                  <h3>{m.title}</h3>
                  <p>{m.summary}</p>
                </div>
                <span
                  className={`status-badge ${progress.completedModules.includes(m.id) ? "done" : ""}`}
                >
                  {progress.completedModules.includes(m.id)
                    ? "Selesai"
                    : m.id === next.id
                      ? "Mulai di sini"
                      : "Belum dimulai"}
                </span>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
          <div className="source-note">
            <BookOpen size={17} />
            <span>Disusun dari jobsheet & rangkuman persiapan SERKOM RPL.</span>
            <Link prefetch={false} href="/referensi">
              Lihat sumber
            </Link>
          </div>
        </section>
        <aside className="practice-column">
          <div className="section-heading">
            <div>
              <h2>Sedikit latihan, banyak kemajuan</h2>
              <p>Pilih cara belajar yang cocok untukmu.</p>
            </div>
          </div>
          <Link prefetch={false} href="/flashcards" className="practice-card">
            <span className="icon-tile soft-violet">
              <Layers size={21} />
            </span>
            <div>
              <h3>Flashcards</h3>
              <p>Ulangi konsep, kuatkan ingatan.</p>
              <span>
                20 kartu konsep <span>·</span> 5–10 menit
              </span>
            </div>
            <ArrowUpRight size={18} />
          </Link>
          <Link prefetch={false} href="/tantangan" className="practice-card">
            <span className="icon-tile soft-blue">
              <Terminal size={21} />
            </span>
            <div>
              <h3>Tantangan kode</h3>
              <p>Asah logika dengan test case nyata.</p>
              <span>
                4 tantangan <span>·</span> JavaScript
              </span>
            </div>
            <ArrowUpRight size={18} />
          </Link>
          <Link prefetch={false} href="/simulasi" className="exam-card">
            <div>
              <span className="tiny-label">SIAP UJI PEMAHAMAN?</span>
              <h3>Coba simulasi ujian</h3>
              <p>Latih fokus sebelum hari SERKOM.</p>
              <span className="text-link">
                Mulai simulasi <ArrowRight size={16} />
              </span>
            </div>
            <Clock size={50} strokeWidth={1} />
          </Link>
        </aside>
      </div>
      <div className="bottom-callout">
        <Flame size={19} />
        <p>
          Belajar bukan soal cepat selesai.{" "}
          <strong>Yang penting, benar-benar memahami.</strong>
        </p>
        <span>Satu langkah hari ini.</span>
      </div>
    </>
  );
}
