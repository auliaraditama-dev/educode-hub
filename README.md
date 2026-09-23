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

Kode latihan berjalan dalam Web Worker di iframe sandbox dengan origin terisolasi (`allow-scripts`, tanpa `allow-same-origin`). Runner tersedia langsung melalui `srcDoc` sehingga tetap berjalan offline. Kode dimuat ke Blob Web Worker tanpa `eval` atau `new Function`; CSP iframe memblokir jaringan (`connect-src 'none'`) dan worker dihentikan setelah 3 detik. Route `/runner` tetap tersedia dengan pembatasan CSP yang sama. Pesan hasil diperiksa sumber frame dan ID permintaannya. Batas input editor 20.000 karakter.

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

## PWA dan latihan variasi — versi 2.1

Versi ini menggunakan ZIP `educode-hub.zip` pengguna sebagai dasar. Seluruh kategori fitur sebelumnya tetap tersedia; sumber ZIP asli tidak diubah.

### Memasang dan memakai offline

1. Jalankan `npm ci`, `npm run build`, lalu `npm start`. PWA sengaja tidak aktif dalam `npm run dev`.
2. Buka situs melalui HTTPS atau `http://localhost:3000`. Buka **PWA & Offline** (`/offline`) dan tetap online sampai muncul **Paket offline siap**.
3. Semua halaman publik yang diprerender, JavaScript, CSS, font, ikon, dokumen, serta runner latihan diunduh. Halaman yang belum pernah dibuka pun bisa diakses setelah paket selesai.
4. Pilih **Pasang aplikasi** jika browser menyediakan prompt. Alternatifnya gunakan menu browser; iPhone memakai Safari → Bagikan → Tambahkan ke Layar Utama. Dukungan prompt instalasi tergantung browser.
5. Setelah paket siap, putuskan koneksi lalu buka jobsheet, pencarian, atau latihan. Kunjungan pertama tetap membutuhkan internet. Aplikasi tidak bisa dipasang dari ZIP dengan membuka HTML langsung.
6. Pembaruan tersedia melalui tombol **Gunakan versi baru** setelah unduhan lengkap. Halaman dimuat ulang setelah konfirmasi; jawaban variasi yang belum diperiksa akan hilang. Progres tersimpan tetap ada.

`npm run build` menjalankan generator service worker sesudah Next.js selesai. Jangan menggantinya dengan `next build` langsung pada Vercel; gunakan build command `npm run build`. Worker memiliki versi dari BUILD_ID dan `Cache-Control: no-cache`. Cache hanya menyimpan sumber publik dari origin sendiri, tidak mencampur respons React Flight dengan HTML. Navigasi antarlaman memakai dokumen penuh saat service worker mengontrol halaman agar seluruh rute tetap dapat dipakai offline. Pencarian kini berjalan lokal terhadap materi dan dokumen yang dibundel.

Cache dapat dibuang oleh browser saat ruang penyimpanan menipis. Pembersihan data situs menghapus cache dan progres. Ekspor cadangan berkala. Tautan eksternal, layanan Vercel, serta proyek PHP/MySQL di luar portal memerlukan lingkungan masing-masing. PWA ini tidak menjalankan server Laravel secara offline.

### Latihan baru

`/latihan-variasi` menyediakan 12 soal per paket: enam lengkapi kode dan enam perbaiki kode. Enam belas template menggunakan rotasi urutan dan parameter dinamis: angka harga, kuantitas, ID, dan konteks produk. Refresh atau tombol **Soal baru** menghasilkan paket berikutnya. Template dapat muncul kembali; ini bukan generator soal AI tanpa batas.

- Topik: subtotal, konversi angka, equality, query Eloquent, findOrFail, update, route resource, escaping Blade, format rupiah, dan validasi harga sesuai jobsheet.
- Petunjuk, feedback langsung, filter jenis soal, dan pembahasan dengan mode belajar.
- Pemeriksa mengharapkan format jawaban contoh. Ia bukan parser PHP dan tidak mengklaim menerima semua kode ekuivalen. Tantangan JavaScript lama tetap memakai sandbox/test case.
- Statistik benar/pemeriksaan disimpan dan ikut ekspor/impor progres v2 dalam field `practice`. Cadangan lama mendapatkan nilai awal nol. Latihan variasi tidak menggandakan XP latihan dasar.
- Jawaban paket aktif tidak dipertahankan saat refresh; statistik hasil yang sudah diperiksa tetap tersimpan. Progres soal dasar lama tidak direset.

Rujukan implementasi: [PWA Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps) dan [Service worker MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

## Pusat data dan pemulihan — versi 2.2

Menu **Pusat data** (`/keamanan`) menyediakan status penyimpanan, tiga snapshot lokal terakhir, pemulihan dengan konfirmasi, unduh snapshot, ekspor progres saat ini, ekspor data mentah, dan pembacaan ulang data tersimpan.

Impor/reset/pemulihan membuat salinan data aktif terlebih dahulu. Jika salinan gagal disimpan, penggantian dibatalkan. Data yang rusak tidak ditimpa otomatis dengan progres kosong. Saat kuota habis atau konflik tab terdeteksi, banner menyediakan ekspor perubahan di memori; lakukan ekspor sebelum berpindah halaman. Snapshot dan area pemulihan tetap tersimpan setelah reset progres agar dapat dipulihkan, tetapi ikut hilang jika data situs dihapus dari browser.

Lihat `SECURITY.md` untuk perlindungan yang diterapkan, hasil audit dependensi, dan batas keamanan. Portal tetap berupa aplikasi belajar lokal tanpa akun atau backend multiuser. Tidak ada jaminan keamanan absolut.
