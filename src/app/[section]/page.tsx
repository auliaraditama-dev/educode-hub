import { notFound } from "next/navigation";
import { metadata } from "@/lib/seo";
import {
  Jobsheets,
  Cheatsheet,
  Flashcards,
  FillCode,
  Challenges,
} from "@/components/learning";
import {
  Notes,
  Testing,
  Portfolio,
  ProgressPage,
  Exam,
  References,
} from "@/components/workbench";
import { PracticeLab } from "@/components/practice-lab";
import { OfflinePage } from "@/components/pwa-provider";
import { DataCenter } from "@/components/data-center";
const pages = {
  keamanan: {
    title: "Pusat Data & Pemulihan",
    desc: "Snapshot, pencadangan, status penyimpanan, dan pemulihan progres lokal.",
    Component: DataCenter,
  },
  "latihan-variasi": {
    title: "Latihan Variasi & Perbaikan Kode",
    desc: "Paket soal Laravel, PHP, Blade, dan JavaScript berganti saat refresh dan tersedia offline.",
    Component: PracticeLab,
  },
  offline: {
    title: "PWA & Belajar Offline",
    desc: "Pasang EduCode Hub dan unduh materi serta latihan untuk belajar offline.",
    Component: OfflinePage,
  },
  jobsheet: {
    title: "Jobsheet Laravel 12",
    desc: "12 modul praktik Laravel 12 dari kebutuhan hingga pengujian dan dokumentasi.",
    Component: Jobsheets,
  },
  cheatsheet: {
    title: "Cheatsheet Laravel & PHP",
    desc: "Referensi sintaks Artisan, Blade, routing, Eloquent, dan validasi.",
    Component: Cheatsheet,
  },
  flashcards: {
    title: "Flashcards Laravel",
    desc: "20 kartu konsep untuk mengulang materi dan pertanyaan lisan SERKOM.",
    Component: Flashcards,
  },
  fillcode: {
    title: "Latihan Lengkapi Kode",
    desc: "Latihan sintaks Laravel dan Blade dengan umpan balik langsung.",
    Component: FillCode,
  },
  tantangan: {
    title: "Tantangan Kode",
    desc: "Uji logika JavaScript dengan test case studi kasus Kopi Ulee Kareng.",
    Component: Challenges,
  },
  catatan: {
    title: "Catatan & Bookmark",
    desc: "Catatan pribadi dan materi yang disimpan pada perangkat ini.",
    Component: Notes,
  },
  pengujian: {
    title: "Pengujian & Debugging",
    desc: "Lembar TC-01 sampai TC-10 dan log debugging sesuai jobsheet.",
    Component: Testing,
  },
  portofolio: {
    title: "Portofolio SERKOM",
    desc: "Checklist bukti kerja, panduan presentasi, dan ekspor laporan.",
    Component: Portfolio,
  },
  progress: {
    title: "Progres Belajar",
    desc: "Pantau penyelesaian modul, XP, dan kelola cadangan data belajar.",
    Component: ProgressPage,
  },
  simulasi: {
    title: "Simulasi Pengetahuan SERKOM",
    desc: "Latih pemahaman Laravel dengan kuis berwaktu dan pembahasan.",
    Component: Exam,
  },
  referensi: {
    title: "Dokumen Referensi",
    desc: "Jobsheet lengkap dan rangkuman analisis Laravel 12 dari dokumen sumber.",
    Component: References,
  },
};
type Key = keyof typeof pages;
export function generateStaticParams() {
  return Object.keys(pages).map((section) => ({ section }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const p = pages[section as Key];
  if (!Object.hasOwn(pages, section)) return {};
  return {
    ...metadata(p.title, p.desc, `/${section}`),
    ...(["catatan", "progress", "pengujian", "portofolio", "simulasi"].includes(
      section,
    )
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const p = pages[section as Key];
  if (!Object.hasOwn(pages, section)) notFound();
  const Component = p.Component;
  return <Component />;
}
