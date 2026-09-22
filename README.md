# EduCode Hub

Portal pembelajaran Laravel 12 dan persiapan SERKOM RPL, dibangun ulang dari `educode_hub.html` menggunakan Next.js App Router, React, dan TypeScript. Portal mempertahankan seluruh kategori fitur lama serta menambahkan materi dan alat dokumentasi berdasarkan kedua dokumen pengguna.

## Jalankan

Gunakan Node.js 22 LTS atau 24 LTS dan npm.

```bash
npm ci
npm run dev
```

Buka `http://localhost:3000`. Untuk produksi lokal:

```bash
npm run build
npm run start
```

Tidak membutuhkan database, API key, layanan berbayar, atau akun untuk fungsi belajar yang disediakan. Ini portal belajar dengan progres **lokal per browser/perangkat**, bukan layanan LMS multiakun. Proyek latihan Laravel dan MySQL tetap dijalankan sendiri di luar portal. Kode PHP dalam materi ditampilkan sebagai referensi, tidak dijalankan oleh Next.js.

## Deploy Vercel

1. Ekstrak arsip, lalu unggah **isi folder proyek ini** ke repositori Git milik Anda. Jangan sertakan `node_modules`, `.next`, atau `.env.local`.
2. Di Vercel pilih **Add New → Project**, lalu impor repositori tersebut. Gunakan Framework Preset **Next.js** dan Root Directory lokasi `package.json`.
3. Pilih Node.js 22.x atau 24.x. Install command: `npm ci`. Build command: `npm run build`. Biarkan Output Directory menggunakan default Next.js.
4. Atur environment variable `NEXT_PUBLIC_SITE_URL` menjadi URL publik final, misalnya `https://nama-proyek.vercel.app` atau domain Anda. Salin nama variabel dari `.env.example`; jangan gunakan contoh domain sebagai canonical produksi.
5. Deploy, lalu periksa beranda, satu modul, `/sitemap.xml`, `/robots.txt`, dan tantangan kode pada URL hasil deployment.
6. Ketika mengganti domain, perbarui `NEXT_PUBLIC_SITE_URL` dan redeploy. Tambahkan domain melalui pengaturan Vercel dan arahkan DNS sesuai instruksinya.

Alternatif CLI setelah login ke akun Vercel Anda:

```bash
npx vercel
npx vercel --prod
```

Source sudah dibuild dan disiapkan untuk Vercel; paket ini tidak menyatakan bahwa deployment publik sudah dilakukan. Rujukan resmi: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) dan [Vercel CLI deployment](https://vercel.com/docs/cli/deploying-from-cli).

## Fitur

| Area | Fitur |
| --- | --- |
| Overview | Ringkasan progres aktual, kelanjutan modul, statistik, akses latihan |
| Jobsheet | 12 modul, tujuan, contoh kode, checkpoint, navigasi, bookmark, catatan |
| Cheatsheet | 12 referensi, pencarian, filter Artisan/Blade/PHP/Laravel, salin kode |
| Flashcards | 20 kartu, flip keyboard/mouse, acak, maju/mundur, status dikuasai, filter review |
| Lengkapi kode | 8 soal sintaks, petunjuk, validasi jawaban, status selesai |
| Tantangan kode | 4 soal JavaScript, draft per soal, reset, petunjuk, pembahasan, actual/expected tiap test |
| Simulasi | 10 soal, durasi 10/20/30 menit, sesi pulih setelah reload, timer berbasis deadline, auto-submit, pembahasan |
| Pengujian | TC-01 sampai TC-10, actual result, status, log debugging, ekspor Markdown |
| Portofolio | 10 checklist bukti, panduan presentasi, ekspor laporan dan catatan |
| Progres | XP, level, semua kategori termasuk fill-code, ekspor/impor JSON tervalidasi, reset khusus data EduCode |
| Referensi | Transkripsi lengkap teks dan tabel kedua DOCX, daftar isi rangkuman, kode, pencarian global |
| UI | Sidebar desktop, menu ponsel, tema terang/gelap, keyboard focus, skip link, status aksesibel, print stylesheet |

## Penyimpanan dan migrasi

- Progres menggunakan `localStorage` dengan skema versi 2: `educode:progress:v2`.
- XP dihitung dari penyelesaian unik: modul 50, flashcard 10, fill-code 20, tantangan 100. Mengulang tidak menggandakan XP.
- Halaman Progres menyediakan ekspor/impor cadangan. Maksimal berkas impor 2 MB. Impor mengganti progres setelah konfirmasi; tidak menggabungkan otomatis.
- Migrasi otomatis membaca `edu_modules`, `edu_cards`, `edu_fills`, `edu_problems`, dan `edu_theme` jika kunci lama tersedia pada **origin yang sama**. Origin `file://`, localhost, dan domain Vercel berbeda; browser tidak memindahkan storage antar-origin otomatis.
- Reset tidak memanggil `localStorage.clear()` dan tidak menghapus data aplikasi lain pada origin yang sama.
- Perubahan dari tab lain disinkronkan melalui storage event. Penyuntingan serentak masih menggunakan perubahan terakhir; ini bukan kolaborasi realtime.
- Sesi ujian memakai `sessionStorage`, sehingga tidak ditujukan untuk sinkronisasi antarperangkat dan dapat hilang setelah sesi browser berakhir. Hasil terakhir disimpan bersama progres.
- Progres tidak dikirim ke server. Tidak ada tracking atau analytics pihak ketiga.

## Materi dan sumber

Dokumen pengguna:

1. `Jobsheet_Pembelajaran_Persiapan_SERKOM_RPL_Laravel12_Kopi_Ulee_Kareng.docx`.
2. `Rangkuman_Analisis_Laravel12_SERKOM_Lengkap.docx`.

Transkripsi disimpan di `src/lib/jobsheet.json` dan `src/lib/rangkuman.json`. Array blok mempertahankan paragraf, baris dalam paragraf, serta sel dan baris tabel. Styling dan objek gambar DOCX tidak disalin. Isi sumber tidak diperlakukan sebagai instruksi untuk agent atau portal. Atribusi penyusun jobsheet ditampilkan pada halaman Referensi.

Contoh lama diperbaiki menjadi `nama_produk`, `max:100`, `unsignedInteger`, penyimpanan hasil validasi, dan route resource tanpa `show` sesuai studi kasus. Materi asli dapat dibandingkan di pembaca referensi. Durasi 270 menit pada identitas dokumen berbeda dengan total alokasi tabel 290 menit; halaman simulasi menjelaskannya. Portal tidak mengeluarkan keputusan kompeten/belum kompeten, sertifikasi resmi, maupun klaim afiliasi LSP.

## SEO

- Halaman publik dan modul memiliki HTML prarender, title/description unik, canonical, Open Graph, dan Twitter summary.
- Detail modul menyertakan JSON-LD `LearningResource` yang sesuai konten.
- `sitemap.xml`, `robots.txt`, favicon SVG, `lang="id"`, dan hierarki heading tersedia.
- Halaman catatan, progres, lembar kerja, simulasi, serta pencarian memakai `noindex`. Sandbox memiliki `X-Robots-Tag: noindex` dan tidak masuk sitemap.
- `NEXT_PUBLIC_SITE_URL` menentukan origin canonical. Fallback Vercel memakai `VERCEL_PROJECT_PRODUCTION_URL`; fallback lokal adalah localhost.
- Tidak ada janji ranking mesin pencari. Submit sitemap melalui Search Console setelah domain publik siap.

## Eksekusi kode dan keamanan

Kode latihan berjalan dalam Web Worker di iframe sandbox dengan origin terisolasi (`allow-scripts`, tanpa `allow-same-origin`). Halaman utama tidak menggunakan `eval` atau `new Function`. Route `/runner` memiliki CSP terpisah yang mengizinkan evaluasi hanya untuk latihan, memblokir jaringan (`connect-src 'none'`), dan worker dihentikan setelah 3 detik. Pesan hasil diperiksa sumber frame dan ID permintaannya. Batas input editor 20.000 karakter.

XP dan hasil ujian merupakan data lokal yang dapat diubah oleh pemilik browser; jangan gunakan sebagai bukti penilaian berisiko tinggi atau dasar sertifikasi. Jangan menambahkan kredensial ke worker atau mengubah iframe menjadi same-origin. Tidak ada eksekusi server terhadap kode kiriman pengguna.

Header halaman utama: CSP, nosniff, anti-framing, referrer policy, dan pembatasan kamera/mikrofon/geolokasi. Font dibundel lokal dengan Fontsource, bukan diunduh dari Google saat membuka halaman. SVG ikon aplikasi dibuat khusus; ikon UI menggunakan Lucide.

## Struktur

```text
src/app/                    Route, metadata, layout, stylesheet
  [section]/page.tsx        Halaman fitur belajar
  jobsheet/[slug]/page.tsx  Modul prarender dan JSON-LD
  referensi/[slug]/page.tsx Pembaca dokumen server-rendered
  cari/page.tsx             Pencarian materi dan dokumen
  runner/route.ts           Sandbox Web Worker
src/components/            Shell, dashboard, latihan, lembar kerja, state
src/lib/content.ts         Kurikulum dan bank latihan
src/lib/progress.ts        Validasi data, XP, ekspor
src/lib/*.json             Transkripsi dokumen
tests/                     Unit tests dan skenario Playwright
scripts/test.mjs           Runner unit test tanpa subprocess
```

## Pemeriksaan

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Suite Playwright memakai Google Chrome terpasang (`channel: 'chrome'`) dan menjalankan server produksi otomatis bila belum ada. Jalankan build terlebih dahulu. Untuk Chromium bawaan Playwright, hapus `channel` dari config dan jalankan `npx playwright install chromium` pada lingkungan yang mendukung peluncuran browser.

Pengaturan `experimental.workerThreads`, `cpus: 2`, dan `useTypeScriptCli: false` mempertahankan typecheck penuh sambil menghindari subprocess TypeScript pada lingkungan Windows terbatas. Tidak menggunakan `ignoreBuildErrors`. Output tetap deployment Next.js standar.

Lihat `VALIDATION.md` untuk hasil pemeriksaan aktual dan batas pengujian sesi ini.

## Pembaruan interaksi — 22 September 2026

- Sistem dialog bersama menggantikan konfirmasi browser pada reset draft, reset progres, impor cadangan, dan pengumpulan simulasi. Mendukung Batal, Escape, klik backdrop, penguncian scroll, fokus keyboard, dan pemulihan fokus ke pemicu.
- Reset seluruh progres memerlukan teks `RESET`; impor menampilkan nama berkas, jumlah modul, XP, dan catatan sebelum diterapkan.
- Penyelesaian modul menampilkan checkpoint serta tujuan jobsheet dan meminta pengakuan bahwa praktik sudah dilakukan. Ini refleksi mandiri, bukan penilaian kompetensi otomatis.
- Notifikasi info/sukses/error dapat ditutup, maksimum tiga sekaligus, dan waktu tampil berhenti ketika disorot atau difokuskan.
- Scrollbar mengikuti tema, terdapat indikator posisi baca dan tombol kembali ke atas, serta preferensi reduced-motion dihormati.
- Latihan sintaks memiliki indikator progres, filter belum selesai, validasi dengan Enter, penanda input salah, dan tampilan ketika semua latihan selesai.
- Menu ponsel mendukung Escape, penguncian scroll, fokus terbatas di menu, dan pengembalian fokus. `Ctrl/⌘ + K` memfokuskan pencarian ketika tidak ada dialog atau menu terbuka.
- Semua kategori fitur, materi dokumen, penyimpanan progres versi 2, SEO, serta konfigurasi Vercel tetap tersedia. Tidak ada migrasi yang menghapus data pengguna.
