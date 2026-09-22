# Hasil validasi EduCode Hub

Pemeriksaan dilakukan 21–22 September 2026 pada build produksi lokal. Tidak ada deployment publik Vercel dalam sesi ini.

| Pemeriksaan | Hasil aktual |
| --- | --- |
| Next.js production build | Berhasil, termasuk pemeriksaan TypeScript dan generasi halaman statis |
| ESLint | Lulus setelah perbaikan ref React dan deklarasi timer |
| Unit tests | 4 lulus: normalisasi impor, data rusak, round-trip cadangan, identitas materi |
| HTTP smoke | 20 lulus: 19 endpoint berstatus 200 dan route tidak dikenal berstatus 404 |
| Metadata | Canonical, konten modul SSR, dan JSON-LD terdeteksi pada respons HTML |
| Referensi | Semua 18 anchor bagian rangkuman tersedia |
| Dependensi produksi | `npm audit --omit=dev`: 0 kerentanan dilaporkan saat pemeriksaan |
| Desktop | Screenshot beranda diperiksa pada viewport 1440 × 1000; konten dan navigasi tampil |
| Ponsel | Lebar 375 px diperiksa untuk beranda, jobsheet, detail modul, cheatsheet, tantangan, pengujian, dan rangkuman; tidak ada overflow horizontal halaman setelah perbaikan |
| Console browser | Tidak ada error tercatat pada pemeriksaan terakhir halaman-halaman tersebut |

## Interaksi yang diperiksa melalui browser terhubung

- Menyelesaikan modul memperbarui XP; status selesai pulih setelah reload.
- Bookmark dan catatan dapat dimasukkan, dengan state tersimpan melalui provider progres.
- Flashcard dapat dibalik dan ditandai dikuasai; tombol dikuasai menjadi nonaktif.
- Jawaban `resource` pada latihan sintaks diterima dan input menjadi nonaktif.
- Fungsi subtotal berbasis `reduce` melewati ketiga test case, termasuk array kosong.
- Fungsi dengan `while(true)` dihentikan dengan pesan batas waktu 3 detik; portal tetap dapat digunakan.
- Sesi simulasi dengan satu jawaban pulih setelah reload; pengumpulan menghasilkan 1/10 dan pembahasan.
- Form pengujian menyediakan actual result dan status; hasil belum dapat ditandai lulus tanpa actual result.
- Menu ponsel membuka navigasi dan menuju jobsheet; tema gelap diterapkan.

## Batas pemeriksaan

Suite Playwright otomatis disertakan dalam `tests/e2e/portal.spec.ts`, tetapi **belum dijalankan menyeluruh dengan Playwright Test runner** karena peluncuran subprocess/browser lokal dibatasi lingkungan Windows sesi ini. Pemeriksaan interaktif dilakukan melalui browser Codex yang terhubung. Jangan menyebut seluruh suite E2E otomatis sudah lulus.

Ekspor/impor diuji pada tingkat normalisasi/round-trip data; alur unggah/unduh file browser tidak seluruhnya diverifikasi otomatis. Tidak dilakukan pengukuran Lighthouse, pengujian beban, audit aksesibilitas menyeluruh, pengujian seluruh kombinasi browser, maupun validasi hasil indexing mesin pencari.

Progres dan skor adalah data latihan lokal yang dikelola pengguna, bukan bukti kompetensi yang diverifikasi server. Proyek Laravel/MySQL siswa dan feature test Laravel di dalam materi tidak dijalankan sebagai bagian dari pengujian portal Next.js.

## Menjalankan kembali

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

Pada terminal terpisah, ketika server sudah aktif:

```bash
node scripts/smoke.mjs
npm run test:e2e
```

Untuk memeriksa deployment, set `TEST_BASE_URL` ke URL deployment sebelum menjalankan smoke test. Sesuaikan juga `baseURL` Playwright jika menguji domain remote. Pemeriksaan lokal tidak menggantikan smoke test setelah deploy.

## Pemeriksaan pembaruan interaksi — 22 September 2026

- Production build dengan TypeScript lulus setelah pembaruan dialog dan latihan. ESLint lulus. Empat unit test dan 20 HTTP smoke check lulus.
- Browser terhubung: jawaban salah dengan Enter menampilkan pesan validasi; filter belum selesai menampilkan enam soal dari delapan ketika dua sudah selesai.
- Modal reset: tombol hapus awalnya nonaktif, aktif setelah teks `RESET`, Escape membatalkan; fokus kembali ke tombol reset. Data pengguna tidak direset pada pemeriksaan ini.
- Modal checkpoint menampilkan tujuan dan checkpoint sesuai modul Laravel. Tombol penyelesaian awalnya nonaktif dan menjadi aktif setelah checkbox dipilih melalui keyboard; pengujian dibatalkan sehingga tidak menambah progres pengguna.
- Modal panduan interaksi menampilkan pintasan dan alur belajar.
- Geometri DOM modal reset pada viewport 375 px berada di dalam layar (lebar modal 331 px, batas kanan 348 px); tidak ada overflow horizontal halaman. Penangkapan screenshot top-layer dialog pada browser terhubung tidak konsisten, sehingga pemeriksaan visual modal lintas browser tetap perlu dilakukan.
- Suite E2E lama diperbarui untuk dialog baru; empat skenario tambahan disertakan dalam `tests/e2e/interactions.spec.ts`. Suite Playwright ini belum diklaim lulus otomatis karena batas subprocess yang dijelaskan di atas.
- Pemeriksaan build terakhir setelah perbaikan menu: menu ponsel memberi fokus ke tombol tutup, membuat latar inert, mengunci scroll, dan Escape mengembalikan fokus ke tombol buka. Modal reset memberi fokus awal ke Batal. Console browser tidak mencatat error pada pemeriksaan terakhir.
