import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, ArrowLeft } from "lucide-react";
import { modules } from "@/lib/content";
import { metadata, siteUrl } from "@/lib/seo";
import { CodeBlock } from "@/components/ui";
import { LessonTools } from "@/components/learning";
export function generateStaticParams() {
  return modules.map((m) => ({ slug: m.slug }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = modules.find((m) => m.slug === slug);
  return m ? metadata(m.title, m.summary, `/jobsheet/${slug}`) : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = modules.find((m) => m.slug === slug);
  if (!m) notFound();
  const schema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: m.title,
    description: m.summary,
    inLanguage: "id",
    learningResourceType: "Modul pembelajaran",
    educationalLevel: "Pemrogram Junior",
    url: `${siteUrl}/jobsheet/${slug}`,
    isAccessibleForFree: true,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <Link prefetch={false} className="back-link" href="/jobsheet">
        <ArrowLeft size={15} />
        Semua jobsheet
      </Link>
      <div className="lesson-layout">
        <article className="lesson-content">
          <div className="eyebrow">
            MODUL {String(m.id).padStart(2, "0")} / 12 · {m.category}
          </div>
          <h1>{m.title}</h1>
          <p className="lesson-lead">{m.summary}</p>
          <div className="lesson-meta">
            <span>
              <Clock size={15} />
              {m.minutes} menit
            </span>
            <span>{m.unit} · pembelajaran</span>
          </div>
          <section className="panel objectives">
            <h2>Setelah modul ini, kamu bisa…</h2>
            {m.goals.map((goal) => (
              <p key={goal}>
                <Check size={17} />
                {goal}
              </p>
            ))}
          </section>
          <h2>Pahami konteksnya</h2>
          <p className="lesson-body">{m.body}</p>
          <h2>Contoh & panduan</h2>
          <CodeBlock code={m.code} />
          <div className="checkpoint">
            <span className="eyebrow">CHECKPOINT PRAKTIK</span>
            <p>{m.checkpoint}</p>
          </div>
          <LessonTools id={m.id} />
        </article>
        <aside className="lesson-sidebar panel">
          <span className="eyebrow">KURIKULUM</span>
          {modules.map((mod) => (
            <Link
              prefetch={false}
              className={mod.id === m.id ? "selected" : ""}
              key={mod.id}
              href={`/jobsheet/${mod.slug}`}
              aria-current={mod.id === m.id ? "page" : undefined}
            >
              <span>{String(mod.id).padStart(2, "0")}</span>
              {mod.title}
            </Link>
          ))}
        </aside>
      </div>
    </>
  );
}
