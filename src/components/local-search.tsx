"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  modules,
  cheatsheets,
  flashcards,
  fills,
  problems,
} from "@/lib/content";
import { documents } from "@/lib/documents";
import { needsOfflineDocument } from "@/lib/navigation";
const types = [
  "Semua",
  "Jobsheet",
  "Flashcard",
  "Cheatsheet",
  "Referensi",
  "Latihan",
];
const items = [
  ...modules.map((m) => ({
    title: m.title,
    text: `${m.summary} ${m.body}`,
    href: `/jobsheet/${m.slug}`,
    type: "Jobsheet",
  })),
  ...cheatsheets.map((c) => ({
    title: c.title,
    text: `${c.desc} ${c.code}`,
    href: "/cheatsheet",
    type: "Cheatsheet",
  })),
  ...flashcards.map((f) => ({
    title: f.q,
    text: f.a,
    href: "/flashcards",
    type: "Flashcard",
  })),
  ...Object.entries(documents).map(([slug, d]) => ({
    title: d.title,
    text: d.blocks
      .map((b) => (b.type === "p" ? b.text : b.rows.flat().join(" ")))
      .join(" "),
    href: `/referensi/${slug}`,
    type: "Referensi",
  })),
  ...fills.map((f) => ({
    title: f.title,
    text: JSON.stringify(f),
    href: "/latihan",
    type: "Latihan",
  })),
  ...problems.map((p) => ({
    title: p.title,
    text: JSON.stringify(p),
    href: "/tantangan",
    type: "Latihan",
  })),
];
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = [];
  let offset = 0;
  const lower = text.toLowerCase();
  for (
    let found = lower.indexOf(query);
    found !== -1;
    found = lower.indexOf(query, offset)
  ) {
    parts.push(
      text.slice(offset, found),
      <mark key={found}>{text.slice(found, found + query.length)}</mark>,
    );
    offset = found + query.length;
  }
  parts.push(text.slice(offset));
  return <>{parts}</>;
}
export function LocalSearch() {
  const params = useSearchParams(),
    router = useRouter();
  const q = (params.get("q") || "").trim().slice(0, 200),
    query = q.toLowerCase();
  const type = types.includes(params.get("type") || "")
    ? params.get("type")!
    : "Semua";
  const results = query
    ? items.filter(
        (i) =>
          (type === "Semua" || i.type === type) &&
          `${i.title} ${i.text}`.toLowerCase().includes(query),
      )
    : [];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PENCARIAN GLOBAL</span>
          <h1>Temukan materi belajarmu.</h1>
          <p>Cari topik, fungsi, atau konsep Laravel.</p>
        </div>
      </div>
      <form
        key={`${q}:${type}`}
        action="/cari"
        method="get"
        className="search-page-form"
        onSubmit={(event) => {
          if (needsOfflineDocument()) return;
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          router.push(
            `/cari?${new URLSearchParams({ q: String(values.get("q") || "").trim(), type: String(values.get("type") || "Semua") })}`,
          );
        }}
      >
        <input
          name="q"
          aria-label="Kata kunci pencarian"
          defaultValue={q}
          placeholder="Contoh: validasi"
          maxLength={200}
        />
        <select name="type" aria-label="Jenis materi" defaultValue={type}>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <button className="button primary">Cari</button>
      </form>
      <p role="status">
        {query
          ? `${results.length} hasil untuk “${q}” · ${type}`
          : "Masukkan kata kunci untuk mulai mencari."}
      </p>
      <div className="search-results">
        {results.map((r, i) => {
          const at = r.text.toLowerCase().indexOf(query),
            start = Math.max(0, at - 60);
          const snippet = r.text.slice(start, start + 240);
          return (
            <Link
              prefetch={false}
              className="panel"
              href={r.href}
              key={`${r.href}:${i}`}
            >
              <span className="eyebrow">{r.type}</span>
              <h2>
                <Highlight text={r.title} query={query} />
              </h2>
              <p>
                {start > 0 ? "…" : ""}
                <Highlight text={snippet} query={query} />…
              </p>
            </Link>
          );
        })}
      </div>
      {query && !results.length && (
        <div className="empty">
          Tidak ada hasil. Coba kata lebih singkat atau pilih Semua.
        </div>
      )}
    </>
  );
}
