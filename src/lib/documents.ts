import jobsheetData from "./jobsheet.json";
import rangkumanData from "./rangkuman.json";
export type Block =
  { type: "p"; text: string } | { type: "table"; rows: string[][] };
export const documents: Record<string, { title: string; blocks: Block[] }> = {
  jobsheet: {
    title: "Jobsheet Pembelajaran Persiapan SERKOM RPL",
    blocks: jobsheetData as Block[],
  },
  rangkuman: {
    title: "Rangkuman & Analisis Laravel 12 Lengkap",
    blocks: rangkumanData as Block[],
  },
};
export const sectionTitles = [
  "Kesimpulan Inti yang Harus Dikuasai",
  "Skenario Proyek, Batasan, IPO, dan Alur Sistem",
  "Kamus Syntax yang Wajib Dipahami",
  "Persiapan Laravel, Composer, Artisan, Database, dan .env",
  "Perancangan Database dan Migration",
  "Model Eloquent: Product, $fillable, dan casts()",
  "Seeder: Data Awal, Array, dan Perulangan",
  "Controller CRUD: Full Bedah Per Baris",
  "Routing: Basic Route, Resource Route, Parameter, dan Nama Route",
  "Blade Layout dan Landing Page Dinamis",
  "Form CRUD: Partial, Create, Edit, Index, CSRF, Error",
  "CSS Responsif: Full Code dan Analisis",
  "Workflow CRUD Lengkap dari Browser sampai Database",
  "Debugging Terstruktur dan 6 Latihan Bug",
  "Pengujian Manual dan Feature Test",
  "README, Portofolio, Presentasi, dan Bukti Serkom",
  "Pertanyaan Lisan Asesor dan Jawaban Mudah Dihafal",
  "Cheat Sheet Hafalan dan Latihan Mandiri",
];
