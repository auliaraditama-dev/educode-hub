# Keamanan dan operasi EduCode Hub 2.2

Portal belajar mandiri dengan data lokal. Dokumen ini menjelaskan perlindungan yang diterapkan dan batasnya; bukan sertifikasi keamanan atau jaminan bebas risiko.

## Perlindungan yang diterapkan

- Progres yang tidak bisa diparse atau bukan format v2 tidak otomatis ditimpa dengan data kosong.
- Perubahan dari tab lain dibandingkan sebelum menulis. Jika terdeteksi konflik, penyimpanan otomatis dijeda dan pengguna bisa mengekspor perubahan di memori.
- Impor/reset/pemulihan terlebih dahulu mencadangkan data sebelumnya. Jika backup gagal karena kuota atau izin, penggantian dibatalkan. Data rusak disalin ke area pemulihan mentah sebelum penggantian eksplisit.
- Pusat data menyimpan tiga snapshot terakhir; ekspor ke berkas tetap diperlukan untuk melindungi dari penghapusan data browser.
- Impor dibatasi 2 MB dan format v2. ID, panjang teks, nilai statistik, dan status hasil uji dinormalisasi. Status uji tanpa bukti aktual menjadi `belum`.
- Data pengguna dirender sebagai teks React, bukan HTML mentah. HTML/JavaScript dari input tidak disisipkan ke halaman utama.
- Runner menggunakan iframe `sandbox="allow-scripts"` tanpa `allow-same-origin`; kode berjalan dalam Blob Worker, tidak mendapat akses DOM/storage aplikasi. CSP runner menolak jaringan dan worker dihentikan setelah 3 detik. Ini sandbox latihan lokal, bukan layanan eksekusi multi-tenant.
- Header aplikasi meliputi CSP, nosniff, frame denial, referrer policy, serta penolakan kamera/mikrofon/geolokasi. Script inline masih diizinkan untuk kompatibilitas Next.js statis/offline; CSP ini bukan nonce-based strict CSP.
- Service worker hanya menyimpan sumber publik origin sendiri. Respons RSC, POST, dan situs pihak ketiga tidak dimasukkan sebagai dokumen HTML. Versi baru diaktifkan lewat konfirmasi pengguna.
- Audit npm dependensi produksi pada 23 September 2026 melaporkan 0 kerentanan yang dikenal. Jalankan ulang audit secara berkala; hasil ini tidak menjamin ketiadaan kerentanan baru.

## Batas dan tanggung jawab deploy

- Tidak ada autentikasi, otorisasi per akun, database cloud, ataupun sinkronisasi antarperangkat. Jangan memakai portal ini sebagai LMS multiakun atau sistem penilaian resmi tanpa backend dan kontrol akses tambahan.
- localStorage/snapshot tidak dienkripsi. Orang atau ekstensi yang mengakses profil browser yang sama dapat membaca data. Jangan memasukkan password, token, atau data sensitif ke catatan/editor.
- localStorage tidak menyediakan transaksi atomik. Pemeriksaan konflik mengurangi overwrite yang terdeteksi tetapi tidak menjamin konsistensi untuk dua penulisan yang benar-benar bersamaan. Hindari mengedit progres pada beberapa tab sekaligus.
- Kode latihan dapat dimodifikasi pengguna, termasuk hasil yang dikirim worker. XP dan statistik tidak boleh dipercaya sebagai bukti kompetensi atau sebagai sumber otorisasi.
- Worker mengurangi risiko UI macet, tetapi bukan pembatas memori/CPU tingkat OS; alokasi memori berlebihan masih dapat membebani browser. Jangan menjalankan kode yang tidak dipahami.
- Deploy melalui HTTPS di Vercel, set `NEXT_PUBLIC_SITE_URL` ke domain final, gunakan `npm run build`, dan jangan mengunggah `.env.local`, `.git`, atau kredensial.
- Uji domain produksi setelah deploy: manifest, semua ikon, worker header, offline, impor/ekspor, dan sandbox. Prompt instalasi PWA berbeda menurut browser. Jalankan E2E dan audit pada CI yang mendukung browser sebelum merilis ke audiens luas.

## Pemeriksaan berkala

```bash
npm ci
npm run check
npm audit --omit=dev
npm run test:e2e
```

Setelah server produksi berjalan, gunakan `node scripts/smoke.mjs` dan `node scripts/check-pwa.mjs`. Variabel `TEST_BASE_URL` dapat dipakai untuk port atau domain uji. Snapshot lokal bukan pengganti backup eksternal.
