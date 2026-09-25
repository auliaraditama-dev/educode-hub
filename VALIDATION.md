# Validasi EduCode Hub 2.1 — PWA dan latihan variasi

Pemeriksaan 23 September 2026 pada build produksi lokal. Proyek berasal dari ZIP pengguna dan tidak mengubah ZIP asli. Belum dipublikasikan ke Vercel.

## Hasil otomatis

| Pemeriksaan                    | Hasil                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Production build + TypeScript  | Lulus; 30 halaman masuk paket offline                                                                                        |
| ESLint                         | Lulus tanpa error/warning setelah perbaikan                                                                                  |
| Unit/data/service-worker tests | 11 lulus                                                                                                                     |
| Pergantian paket soal          | 500 seed berturut-turut berbeda, masing-masing 6 soal lengkapi dan 6 perbaiki                                                |
| Progres lama                   | Normalisasi cadangan v2 mempertahankan progres lama; statistik latihan baru mendapat nilai default                           |
| Service worker harness         | Unduhan atomik, fallback offline, pencarian query, pengecualian RSC/POST/third-party, dan cache antarversi lulus             |
| HTTP smoke                     | 20 pemeriksaan lulus, termasuk dokumen, 18 anchor, SEO, runner dan 404                                                       |
| Paket PWA HTTP                 | Semua 59 URL sumber daya berstatus 200 tanpa redirect; BUILD_ID, header worker, manifest standalone, dan signature PNG valid |

## Pemeriksaan browser saat server benar-benar dimatikan

- Halaman latihan variasi yang belum dikunjungi terbuka dari paket offline.
- Refresh menghasilkan kode/paket berbeda dengan 12 soal.
- Modul Blade, form & keamanan terbuka.
- Pencarian `fillable` menampilkan hasil materi dan kedua dokumen.
- Soal subtotal menerima `49800`; soal perbaikan menerima `const total = 24900 * 2;`.
- Statistik 2 benar dari 2 pemeriksaan pulih setelah refresh; paket aktif kembali kosong dan berganti nomor.
- Runner JavaScript dengan fungsi subtotal `reduce` melewati tiga test case secara offline.
- Akses `localStorage` dari worker menghasilkan `localStorage is not defined`.
- `while(true)` dihentikan setelah 3 detik; editor tetap dapat digunakan.
- Tampilan kartu, form, feedback, notifikasi, dan scrollbar diperiksa di browser berlebar 405 px; lebar dokumen 395 px, tanpa overflow horizontal halaman.

## Pembaruan aplikasi

Paket pertama selesai menyimpan 59 sumber daya. Setelah build berikutnya tersedia, tombol pembaruan membuka konfirmasi, mengaktifkan worker baru, dan memuat ulang. Versi pada halaman offline berubah dari `v1YXcQjaV5Pt` ke `yDMeZu83lwS9`. Tombol pembaruan menghilang setelah aktivasi.

## Batas pemeriksaan

Suite Playwright disertakan, termasuk `tests/e2e/pwa.spec.ts` untuk emulasi offline dan validasi manifest. **Seluruh suite Playwright otomatis belum selesai dijalankan dalam sesi ini**; jangan menyatakan semua E2E otomatis lulus. Interaksi offline di atas diuji melalui browser terhubung dengan server lokal dimatikan, bukan dengan mematikan jaringan perangkat.

Pemasangan sebagai aplikasi mandiri pada Android/iOS belum diverifikasi pada perangkat fisik. Browser terhubung tidak menyediakan prompt instalasi native, sehingga UI menampilkan panduan pemasangan. Belum dilakukan audit Lighthouse, kuota/eviksi cache lintas browser, pengujian beban, atau deployment Vercel. Cache awal/pembaruan memerlukan internet dan HTTPS/localhost; data tetap lokal per browser.

## Pembaruan 2.2 — perlindungan data

- Audit `npm audit --omit=dev --json` melaporkan nol kerentanan produksi yang dikenal pada saat pemeriksaan.
- Total 17 tes lulus, termasuk penolakan input rusak/terlalu besar, preservasi sumber rusak, pembatalan penggantian saat kuota backup habis, perlindungan konflik tab terdeteksi, batas tiga snapshot, dan normalisasi ID/bukti uji.
- Build dengan TypeScript lulus; Pusat data masuk paket offline (31 halaman, 60 sumber daya).
- Penanganan konflik localStorage bukan transaksi atomik. Batas lengkap tercatat dalam SECURITY.md. Tidak ada klaim pentest, sertifikasi keamanan, atau seluruh E2E otomatis lulus.

- Pemeriksaan HTTP versi 2.2 lulus untuk 60 sumber daya, manifest, ikon PNG, versi build, dan header worker.
- Browser berhasil memperbarui paket ke SveCnfWcvCsj, menampilkan status tersimpan, membuat snapshot 100 XP, mempertahankannya setelah reload, serta membuka dan membatalkan dialog pemulihan. Tampilan kartu diperiksa pada viewport mobile.

## Validasi versi 2.3

Lihat [AUDIT-2.3.md](AUDIT-2.3.md) untuk pemeriksaan source terbaru. Bagian versi sebelumnya di atas adalah riwayat, bukan laporan pengujian versi 2.3.

