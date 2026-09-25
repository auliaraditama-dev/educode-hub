# Audit dan implementasi EduCode Hub 2.3

Tanggal pemeriksaan: 25 September 2026. Source berasal dari ZIP produksi pengguna; SHA-256 ZIP awal sama dengan arsip versi 2.2 di workspace. Framework, data materi, dan dokumen referensi dipertahankan.

## 1–2. Bug dan akar penyebab

| Temuan | Akar penyebab | Perbaikan |
| --- | --- | --- |
| Tema terang muncul sebelum dark mode | Theme ditulis dalam effect ProgressProvider sesudah hydration | Bootstrap sinkron di head, sebelum body; warna latar HTML dan color-scheme langsung diatur |
| Navigasi online memuat dokumen ulang | Listener PWA mengambil semua klik internal ketika worker aktif | Intersepsi hanya saat navigator offline dan worker tersedia; online menggunakan Next Link/router |
| Search reload penuh | Form GET tanpa handler router | Submit online menggunakan router.push, query/filter tetap pada URL |
| Reset/impor mengubah tema | Theme berada dalam skema progres | ThemeProvider dan key educode:theme terpisah |
| Fallback offline selalu gelap | Palet fallback hard-coded | Bootstrap sama dengan aplikasi, CSS system fallback, tanpa React |
| Simulasi berisi distractor tidak relevan | Soal dan opsi diambil dari flashcards serta indeks tetap | Bank soal sendiri, urutan acak, answer identity stabil, review dan analisis kategori |
| Total UI mudah tidak sinkron | Angka jumlah modul/kartu/soal ditulis manual | Jumlah diambil dari source data dan panjang sesi |
| Profil JD menyesatkan | Inisial akun palsu pada portal tanpa akun | Identitas level belajar dan XP aktual |
| Kontrol data berulang dan navigasi latihan terpisah | Pengelompokan fitur sebelumnya | Latihan gabungan dan Pusat data tunggal |

## 3–4. File dan arsitektur

- `src/lib/theme.ts`, `src/components/theme-provider.tsx`, `src/app/layout.tsx`: tema sebelum paint, migrasi, Light/Dark/System, perubahan OS dan tab lain. Suppression hydration hanya pada elemen html yang atributnya memang diubah bootstrap.
- `src/components/progress-provider.tsx`, `src/lib/progress.ts`: progres tanpa tema; perlindungan data rusak, konflik, snapshot, antrean update awal tetap ada. Penyelesaian idempotent tidak menandai perubahan palsu.
- `src/lib/navigation.ts`, `src/components/pwa-provider.tsx`, `scripts/sw-template.js`, `scripts/build-pwa.mjs`: navigasi online/offline terpisah, bypass Flight/RSC/POST/external, cache versi BUILD_ID, konfirmasi pembaruan, redirect lama juga saat offline.
- `src/components/shell.tsx`, `src/lib/content.ts`: kelompok sidebar, tema select berlabel, status PWA ringkas di header, prefetch rute inti, pencarian router, profil belajar nyata.
- `src/components/local-search.tsx`: query dan filter URL, indeks modul/kartu/cheatsheet/referensi/latihan, highlight React tanpa HTML mentah.
- `src/lib/simulation.ts`, `src/components/exam.tsx`: soal mandiri, validasi sesi, opsi unik, timer deadline, maju/mundur, ganti jawaban, resume, auto-submit, review, skor dinamis dan topik yang perlu diulang.
- `src/components/practice-hub.tsx`, `src/components/learning.tsx`, `src/components/practice-lab.tsx`, `src/app/[section]/page.tsx`, `next.config.ts`, sitemap/manifest: latihan gabungan dan kompatibilitas URL.
- `src/components/data-center.tsx`, `src/components/workbench.tsx`, `src/lib/safety.ts`: satu pusat backup/import/reset, envelope tervalidasi, storage estimate, waktu build paket offline, snapshot dan restore.
- `src/components/reading-controls.tsx`, `src/components/command-palette.tsx`: skala teks materi, focus mode, Ctrl/Cmd+K dan dialog native dengan pemulihan fokus.
- `src/app/refinements.css`, `globals.css`, `manifest.ts`, `global-error.tsx`, `public/offline.html`: token tema, native form color-scheme, layout kecil, reduced motion, fallback error dan offline.
- `tests/refactor.test.ts`, tes lama yang diperbarui, `tests/e2e/theme-navigation.spec.ts`, `scripts/check-theme.mjs`: regresi migrasi, tema, backup, simulasi, URL, dan urutan bootstrap produksi.

## 5–7. Fitur digabung, dihapus, dan baru

Digabung: `/fillcode` dan `/latihan-variasi` menjadi `/latihan` dengan Dasar dan Variasi & perbaikan. Import/reset/cadangan dipusatkan di `/keamanan`; `/progress` fokus pada statistik dan tautan pengelolaan data.

Dihapus: profil JD, banner PWA permanen di bawah header, generator soal simulasi dari flashcard, penyimpanan tema dalam progres baru, promo lintas halaman latihan yang sekarang sudah menjadi tab. Tidak ada materi, catatan, bookmark, tantangan, lembar pengujian, portofolio, dokumen, atau keluarga latihan yang dihapus.

Baru: system theme live, question bank simulasi, analisis kategori/topik lemah dari jawaban nyata, filter pencarian dan highlight aman, A−/A/A+, mode fokus, command palette, storage estimate dan metadata backup.

## 8. Migrasi dan kompatibilitas

- Key progres tetap `educode:progress:v2`; tidak perlu memaksa v3. Normalisasi menghilangkan theme dari penulisan progres berikutnya.
- Sebelum hydration, bila `educode:theme` belum ada, preferensi dipindahkan dari theme pada progres lama atau `edu_theme`. Bootstrap tidak menulis ulang dokumen progres lama.
- Impor lama v2 dan envelope `{ app: "EduCode Hub", version: 1, exportedAt, data }` diterima setelah validasi. Theme dalam backup lama tidak mengganti preferensi aktif.
- Reset/restore/import tidak mengubah theme atau font scale. Snapshot tetap tersedia setelah reset.
- HTTP 308: `/fillcode` → `/latihan`; `/latihan-variasi` → `/latihan?tab=variasi`. Service worker menyediakan redirect ekuivalen saat jaringan tidak tersedia.
- Sesi simulasi baru memakai `educode:exam:v2` di sessionStorage. Sesi aktif generator lama tidak dicampur dengan bank soal baru; hasil simulasi terakhir di progres tetap dipertahankan. Sesi baru perlu dimulai setelah upgrade.

## 9–12. Hasil validasi

- Instalasi: `npm install --ignore-scripts --offline` selesai memakai cache dependensi yang tersedia. Tidak menambah library runtime.
- TypeScript: `npm run typecheck` lulus pada source akhir.
- Unit/data/worker: 23 tes lulus, termasuk 500 paket latihan berbeda, migrasi tema, storage rusak/ditolak, envelope lama/baru, permutasi dan skor simulasi, serta pemisahan cache Flight.
- Build produksi: `npm run build` lulus; generator menyiapkan 30 halaman dan 59 sumber daya offline. Pengurangan halaman berasal dari penggabungan latihan.
- HTTP: manifest, PNG, worker headers, seluruh sumber precache, rute utama, 404, dan redirect lama diperiksa. `scripts/check-theme.mjs` menjalankan skrip HTML produksi di VM tanpa React dan membuktikan tema dark diterapkan sebelum body pada empat rute; respons RSC tetap `text/x-component`.
- Browser: navigasi Dashboard/Jobsheet/modul next/previous mempertahankan tema dark dan state input shell; pencarian menghasilkan URL dan highlight; back/forward dan reload diperiksa. Console tidak menunjukkan error/warning pada pemeriksaan online yang dibaca.
- Browser: simulasi start, ganti jawaban, next, reload/resume, konfirmasi finish, hasil 2/12 = 17%, analisis kategori, review, dan pengacakan sesi baru diperiksa.
- Browser pada origin uji terpisah: impor v2 dengan theme light menghasilkan 50 XP tanpa mengganti tema dark; reset menghasilkan 0 XP tetap dark; restore mengembalikan 50 XP tetap dark; format invalid ditolak.
- Browser: command palette/Escape mengembalikan fokus ke pemicu; drawer/Escape ke tombol menu; font scale 1.1 menghasilkan teks materi 17.6px; mode fokus menyembunyikan sidebar desktop.
- Responsif: dashboard diperiksa pada 320, 375, 390, 430, 768, 1024, 1280, 1440px tanpa overflow halaman. Modul dan latihan variasi juga diperiksa pada delapan ukuran tersebut. Pusat data diperiksa pada ukuran yang sama kecuali observasi 430px sempat masih melaporkan viewport 320px, sehingga tidak dihitung sebagai bukti 430px Pusat data. Screenshot latihan mobile diperiksa untuk keterbacaan.
- Offline browser: server lokal sengaja dihentikan; modul Blade tetap terbuka dark, URL lama latihan diarahkan ke hub, 12 soal variasi muncul, fallback standalone mengikuti preferensi light.

## 13. Batas pemeriksaan dan remaining known issues

- Suite CLI Playwright disertakan dan diperbarui, tetapi **tidak dijalankan penuh** dalam sesi ini; interaksi dilakukan melalui browser CUA. Jangan menyamakan 23 unit tests dengan seluruh E2E.
- CUA tidak menyediakan emulasi perubahan OS theme, jaringan offline, atau capture filmstrip first paint. System light/dark diuji melalui bootstrap VM dan listener ditinjau; perubahan OS live pada perangkat fisik belum diverifikasi. Offline diuji dengan mematikan server, bukan jaringan perangkat.
- Pengukuran frame-per-frame tidak tersedia. Penyebab flash telah dihilangkan dan urutan bootstrap HTML teruji; tidak ada klaim bahwa semua browser/perangkat sudah diuji bebas flicker.
- Zoom browser 125/150/200%, screen reader, Safari/iOS, dan splash PWA di perangkat terpasang belum diverifikasi. Manifest memiliki satu warna splash netral gelap; platform tidak menyediakan manifest background dinamis per preferensi localStorage. Warna halaman dan meta browser mengikuti preferensi saat dokumen diproses. Rujukan: [MDN app colors](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Customize_your_app_colors).
- Tombol ekspor dipicu, tetapi event download tidak dilaporkan oleh browser terhubung dalam batas waktu; penyimpanan berkas unduhan belum dikonfirmasi. Serialisasi dan round-trip isi backup lulus unit test.
- Storage lokal tetap tidak terenkripsi dan compare-before-write bukan transaksi atomik. Konflik benar-benar simultan masih membutuhkan backend/transactional store. Tidak ada akun, cloud sync, atau klaim asesmen resmi.
- Belum deploy Vercel, pentest, atau audit Lighthouse. Panduan deploy dan konfigurasi URL publik tersedia di README.

Referensi implementasi hydration: [Next.js hydration errors](https://nextjs.org/docs/messages/react-hydration-error). HTML mentah hanya dipakai untuk bootstrap statis tepercaya dan JSON-LD terkontrol, bukan query atau catatan pengguna.

Finalisasi: lint selesai dengan exit code 0; pemeriksaan HTTP source akhir mencakup 24 pemeriksaan sukses, 59 resource offline, dan build sEl_eO8EETg-5uFJJVf6j. Percobaan awal check-theme sempat mendahului startup server; pemeriksaan diulang setelah server Ready.

