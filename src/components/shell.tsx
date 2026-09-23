"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  ShieldCheck,
  Download,
  ArrowUp,
  CircleHelp,
  BookOpen,
  Braces,
  House,
  FileCode2,
  Layers,
  Terminal,
  Timer,
  ClipboardCheck,
  NotebookPen,
  Folder,
  ChartNoAxesCombined,
  Library,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  ArrowUpRight,
  Flame,
  ChevronRight,
} from "lucide-react";
import { useInteractions } from "./interaction-provider";
import { PwaStatus } from "./pwa-provider";
import { nav } from "@/lib/content";
import { useProgress } from "./progress-provider";
import { xpOf, levelOf } from "@/lib/progress";
const icons: Record<string, typeof House> = {
  shield: ShieldCheck,
  download: Download,
  home: House,
  book: BookOpen,
  file: FileCode2,
  cards: Layers,
  code: Braces,
  terminal: Terminal,
  timer: Timer,
  test: ClipboardCheck,
  note: NotebookPen,
  folder: Folder,
  chart: ChartNoAxesCombined,
  library: Library,
};
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname(),
    [open, setOpen] = useState(false),
    [search, setSearch] = useState("");
  const { progress, update } = useProgress();
  const { confirm } = useInteractions();
  const searchInput = useRef<HTMLInputElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const media = matchMedia("(max-width: 760px)");
    const sync = () => {
      setMobile(media.matches);
      if (!media.matches) setOpen(false);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!open || !mobile) return;
    const trigger = menuButton.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebar.current?.querySelector<HTMLButtonElement>(".mobile-close")?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = sidebar.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not(:disabled)",
      );
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trapFocus);
      if (matchMedia("(max-width: 760px)").matches) trigger?.focus();
    };
  }, [open, mobile]);
  const [scroll, setScroll] = useState(0);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    let frame = 0;
    const readScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = document.documentElement.scrollHeight - innerHeight;
        setScroll(height > 0 ? scrollY / height : 0);
        setShowTop(scrollY > 500);
      });
    };
    const shortcuts = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !document.querySelector("dialog[open]") &&
        !document.querySelector(".sidebar.open")
      ) {
        event.preventDefault();
        searchInput.current?.focus();
      }
      if (event.key === "Escape") setOpen(false);
    };
    readScroll();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);
    window.addEventListener("keydown", shortcuts);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
      window.removeEventListener("keydown", shortcuts);
    };
  }, [path]);
  const xp = xpOf(progress),
    level = levelOf(xp);
  const active = nav.find((n) =>
    n.href === "/" ? path === "/" : path.startsWith(n.href),
  );
  return (
    <>
      <div
        className="reading-line"
        style={{ transform: `scaleX(${scroll})` }}
        aria-hidden="true"
      />
      <a className="skip" href="#main">
        Lewati navigasi
      </a>
      <button
        className={`scrim ${open ? "on" : ""}`}
        aria-label="Tutup navigasi"
        onClick={() => setOpen(false)}
      />
      <aside
        id="primary-navigation"
        ref={sidebar}
        inert={mobile && !open}
        role={mobile && open ? "dialog" : undefined}
        aria-modal={mobile && open ? true : undefined}
        className={`sidebar ${open ? "open" : ""}`}
        aria-label="Navigasi utama"
      >
        <Link
          prefetch={false}
          className="brand"
          href="/"
          onClick={() => setOpen(false)}
        >
          <span className="brand-icon">
            <Braces size={23} />
          </span>
          <span>
            EduCode<span className="brand-hub"> Hub</span>
            <small>LEARN. BUILD. GROW.</small>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <div className="workspace-label">WORKSPACE BELAJAR</div>
        <nav>
          {nav.map((n) => {
            const Icon = icons[n.icon];
            return (
              <div key={n.href}>
                {n.href === "/simulasi" ? (
                  <div className="workspace-label section-label">
                    PERSIAPAN SERKOM
                  </div>
                ) : null}
                <Link
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  href={n.href}
                  className={`nav-item ${active?.href === n.href ? "active" : ""}`}
                  aria-current={active?.href === n.href ? "page" : undefined}
                >
                  <Icon size={18} />
                  <span>{n.label}</span>
                  {n.href === "/simulasi" ? (
                    <span className="new-label">BARU</span>
                  ) : null}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <span className="tiny-label">STUDI KASUS</span>
          <strong>
            Kopi Ulee Kareng <span>↗</span>
          </strong>
          <p>Laravel 12 · PHP · MySQL</p>
          <Link prefetch={false} href="/referensi">
            Lihat panduan proyek <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="profile">
          <span className="avatar">JD</span>
          <div>
            <strong>{level.title}</strong>
            <small>
              Level {level.level} · {xp} XP
            </small>
          </div>
          <span className="profile-dot" />
        </div>
      </aside>
      <div className="app-body" inert={mobile && open}>
        <header className="topbar">
          <div className="crumb">
            <button
              ref={menuButton}
              className="mobile-menu icon-button"
              aria-label="Buka menu"
              aria-expanded={open}
              aria-controls="primary-navigation"
              onClick={() => setOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{active?.label || "Materi belajar"}</strong>
          </div>
          <div className="top-actions">
            <form className="global-search" action="/cari" method="get">
              <Search size={17} />
              <input
                ref={searchInput}
                name="q"
                aria-label="Cari materi"
                placeholder="Cari materi belajar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>⌘ / Ctrl K</kbd>
            </form>
            <button
              className="icon-button help-button"
              aria-label="Panduan interaksi"
              onClick={() =>
                void confirm({
                  title: "Belajar dengan alur yang jelas",
                  description:
                    "Progres disimpan otomatis pada browser ini. Cadangkan melalui halaman Progres belajar.",
                  alert: true,
                  accept: "Mengerti",
                  details: [
                    "Ctrl / ⌘ + K: langsung cari materi.",
                    "Enter: periksa jawaban latihan sintaks.",
                    "Escape: tutup dialog atau menu.",
                    "Praktikkan checkpoint jobsheet sebelum menandai modul selesai.",
                    "Catat hasil aktual pengujian sebelum memilih status lulus.",
                  ],
                })
              }
            >
              <CircleHelp size={19} />
            </button>
            <div className="xp-pill">
              <Flame size={17} />
              <strong>{xp}</strong>
              <span>XP</span>
            </div>
            <button
              className="icon-button theme-toggle"
              aria-label={
                progress.theme === "light"
                  ? "Aktifkan tema gelap"
                  : "Aktifkan tema terang"
              }
              onClick={() =>
                update((p) => ({
                  ...p,
                  theme: p.theme === "light" ? "dark" : "light",
                }))
              }
            >
              {progress.theme === "light" ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </button>
          </div>
        </header>
        <PwaStatus />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="footer">
          <span>
            © {new Date().getFullYear()} EduCode Hub · Ruang belajar pemrogram
            junior
          </span>
          <span>Progres tersimpan di perangkat ini</span>
        </footer>
      </div>
      {showTop && (
        <button
          className="back-top"
          aria-label="Kembali ke atas"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
            });
            document.getElementById("main")?.focus({ preventScroll: true });
          }}
        >
          <ArrowUp size={19} />
        </button>
      )}
    </>
  );
}
