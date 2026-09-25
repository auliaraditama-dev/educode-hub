"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { nav } from "@/lib/content";
import { needsOfflineDocument } from "@/lib/navigation";
import { useTheme } from "./theme-provider";
export function CommandPalette() {
  const dialog = useRef<HTMLDialogElement>(null),
    input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter(),
    { setTheme } = useTheme();
  const close = () => {
    dialog.current?.close();
    trigger.current?.focus();
  };
  const open = () => {
    trigger.current = document.activeElement as HTMLElement;
    setQuery("");
    dialog.current?.showModal();
    input.current?.focus();
  };
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !document.querySelector("dialog[open], .sidebar.open")
      ) {
        event.preventDefault();
        trigger.current = document.activeElement as HTMLElement;
        setQuery("");
        dialog.current?.showModal();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <>
      <button
        className="icon-button command-trigger"
        aria-label="Buka menu perintah (Ctrl+K)"
        onClick={open}
      >
        <Search size={18} />
      </button>
      <dialog
        ref={dialog}
        className="command-dialog"
        aria-labelledby="command-title"
        onCancel={close}
      >
        <div className="section-top">
          <h2 id="command-title">Cari atau buka halaman</h2>
          <button
            className="icon-button"
            aria-label="Tutup menu perintah"
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        <form
          action="/cari"
          onSubmit={(event) => {
            if (needsOfflineDocument()) return;
            event.preventDefault();
            close();
            router.push(`/cari?q=${encodeURIComponent(query.trim())}`);
          }}
        >
          <label htmlFor="command-query">Kata kunci atau nama halaman</label>
          <input
            ref={input}
            id="command-query"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={200}
          />
          <button className="button primary">Cari semua materi</button>
        </form>
        <nav aria-label="Pintasan halaman">
          {nav
            .filter((n) =>
              n.label.toLowerCase().includes(query.trim().toLowerCase()),
            )
            .map((n) => (
              <Link prefetch={false} href={n.href} key={n.href} onClick={close}>
                {n.label}
              </Link>
            ))}
        </nav>
        <div className="button-row" aria-label="Ganti tema">
          {(["light", "dark", "system"] as const).map((theme, i) => (
            <button
              className="button secondary"
              key={theme}
              onClick={() => {
                setTheme(theme);
                close();
              }}
            >
              Tema {["terang", "gelap", "sistem"][i]}
            </button>
          ))}
        </div>
      </dialog>
    </>
  );
}
