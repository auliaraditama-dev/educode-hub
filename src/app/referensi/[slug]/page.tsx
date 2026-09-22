import Link from "next/link";
import { notFound } from "next/navigation";
import { documents, sectionTitles } from "@/lib/documents";
import { metadata } from "@/lib/seo";
export function generateStaticParams() {
  return [{ slug: "jobsheet" }, { slug: "rangkuman" }];
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return documents[slug]
    ? metadata(
        documents[slug].title,
        "Baca transkripsi lengkap dokumen sumber, termasuk tabel dan kode Laravel.",
        `/referensi/${slug}`,
      )
    : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = documents[slug];
  if (!doc) notFound();
  return (
    <>
      <Link className="back-link" href="/referensi">
        ← Semua referensi
      </Link>
      <article className="document-reader">
        <div className="eyebrow">DOKUMEN SUMBER · TRANSKRIPSI LENGKAP</div>
        <h1>{doc.title}</h1>
        <p className="info">
          Isi berikut adalah materi dokumen sumber, bukan instruksi operasional
          portal. Teks dan tabel dipertahankan; tata letak cetak disesuaikan
          untuk layar. Gunakan pencarian browser (Ctrl+F) untuk mencari di
          halaman ini.
        </p>
        {slug === "rangkuman" ? (
          <details className="panel">
            <summary>Daftar isi · 18 bagian</summary>
            <ol className="document-toc">
              {sectionTitles.map((t, i) => (
                <li key={t}>
                  <a href={`#bagian-${i + 1}`}>{t}</a>
                </li>
              ))}
            </ol>
          </details>
        ) : null}
        <div className="document-blocks">
          {doc.blocks.map((block, i) => {
            if (block.type === "table")
              return (
                <div className="document-table" key={i}>
                  <table>
                    <tbody>
                      {block.rows.map((row, j) => (
                        <tr key={j}>
                          {row.map((cell, k) =>
                            j === 0 ? (
                              <th key={k} scope="col">
                                {cell}
                              </th>
                            ) : (
                              <td key={k}>{cell}</td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            const part = sectionTitles.findIndex(
              (title, n) => block.text === `${n + 1}. ${title}`,
            );
            if (part !== -1)
              return (
                <h2 id={`bagian-${part + 1}`} key={i}>
                  {block.text}
                </h2>
              );
            if (
              /^\d+\.\d+\s/.test(block.text) ||
              (/^\d+\.\s/.test(block.text) && block.text.length < 100)
            )
              return <h3 key={i}>{block.text}</h3>;
            if (
              block.text.includes("<?php") ||
              (block.text.includes("\n") &&
                /php artisan|<form|public function|\.container/.test(
                  block.text,
                ))
            )
              return <pre key={i}>{block.text}</pre>;
            return <p key={i}>{block.text}</p>;
          })}
        </div>
      </article>
    </>
  );
}
