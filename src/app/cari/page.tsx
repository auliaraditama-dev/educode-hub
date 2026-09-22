import Link from "next/link";
import { modules, cheatsheets, flashcards } from "@/lib/content";
import { documents } from "@/lib/documents";
export const metadata = {
  title: "Cari materi",
  robots: { index: false, follow: true },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 200).toLowerCase();
  const items = [
    ...modules.map((m) => ({
      title: m.title,
      text: m.summary + " " + m.body,
      href: `/jobsheet/${m.slug}`,
      type: "Jobsheet",
    })),
    ...cheatsheets.map((c) => ({
      title: c.title,
      text: c.desc + " " + c.code,
      href: "/cheatsheet",
      type: "Cheatsheet",
    })),
    ...flashcards.map((f) => ({
      title: f.q,
      text: f.a,
      href: "/flashcards",
      type: "Flashcard",
    })),
  ];
  const results = query
    ? items.filter((i) =>
        (i.title + " " + i.text).toLowerCase().includes(query),
      )
    : [];
  const docMatches = query
    ? Object.entries(documents).filter(([, d]) =>
        d.blocks.some((b) =>
          (b.type === "p" ? b.text : b.rows.flat().join(" "))
            .toLowerCase()
            .includes(query),
        ),
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
      <form action="/cari" className="search-page-form">
        <input
          name="q"
          aria-label="Kata kunci pencarian"
          defaultValue={q}
          placeholder="Contoh: validasi harga"
          maxLength={200}
        />
        <button className="button primary">Cari</button>
      </form>
      <p>
        {query
          ? `${results.length} hasil materi dan ${docMatches.length} dokumen untuk “${q.slice(0, 200)}”`
          : "Masukkan kata kunci untuk mulai mencari."}
      </p>
      <div className="search-results">
        {results.map((r, i) => (
          <Link className="panel" href={r.href} key={i}>
            <span className="eyebrow">{r.type}</span>
            <h2>{r.title}</h2>
            <p>{r.text.slice(0, 240)}…</p>
          </Link>
        ))}
        {docMatches.map(([slug, d]) => (
          <Link href={`/referensi/${slug}`} className="panel" key={slug}>
            <span className="eyebrow">DOKUMEN LENGKAP</span>
            <h2>{d.title}</h2>
            <p>
              Kata kunci ditemukan dalam sumber. Gunakan Ctrl+F pada halaman
              dokumen.
            </p>
          </Link>
        ))}
      </div>
      {query && !results.length && !docMatches.length ? (
        <div className="empty">
          Tidak ada hasil. Coba kata yang lebih singkat, misalnya “harga”.
        </div>
      ) : null}
    </>
  );
}
