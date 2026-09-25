"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Download, ShieldCheck, History, Upload, Trash2 } from "lucide-react";
import { useProgress } from "./progress-provider";
import { useInteractions } from "./interaction-provider";
import { usePwa } from "./pwa-provider";
import { PageHeading } from "./ui";
import { download, STORAGE_KEY, xpOf, emptyProgress } from "@/lib/progress";
import {
  readSnapshots,
  parseBackup,
  serializeBackup,
  saveSnapshot,
  QUARANTINE_KEY,
  type Snapshot,
} from "@/lib/safety";
export function DataCenter() {
  const { progress, ready, storageStatus, replace, reloadSaved, notify } =
    useProgress();
  const { confirm } = useInteractions();
  const pwa = usePwa();
  const file = useRef<HTMLInputElement>(null);
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]),
    [secure, setSecure] = useState(false);
  const refresh = () => {
    try {
      setSnapshots(readSnapshots(localStorage));
    } catch {
      notify("Penyimpanan snapshot tidak tersedia.", "danger");
    }
  };
  useEffect(() => {
    setSecure(window.isSecureContext);
    if (navigator.storage?.estimate)
      void navigator.storage
        .estimate()
        .then(setEstimate)
        .catch(() => {});
    try {
      setSnapshots(readSnapshots(localStorage));
    } catch {}
  }, []);
  const status = {
    loading: "Memuat data",
    saved: "Tersimpan pada browser ini",
    blocked: "Data sumber tidak dapat dibaca",
    conflict: "Perubahan tab lain perlu diperiksa",
    memory: "Hanya tersimpan dalam memori",
  }[storageStatus];
  return (
    <>
      <PageHeading
        eyebrow="PUSAT DATA & PEMULIHAN"
        title="Belajar tenang. Simpan bukti kemajuan."
        description="Periksa penyimpanan, buat snapshot, dan pulihkan progres. Snapshot lokal melindungi dari salah impor, tetapi tidak menggantikan cadangan berkas di perangkat lain."
      />
      <section className="panel offline-panel">
        <h2>
          <ShieldCheck size={22} /> Kondisi perangkat ini
        </h2>
        <dl className="data-health">
          <div>
            <dt>Penyimpanan progres</dt>
            <dd role="status">{status}</dd>
          </div>
          <div>
            <dt>Konteks aman browser</dt>
            <dd>{secure ? "HTTPS / localhost tersedia" : "Tidak tersedia"}</dd>
          </div>
          <div>
            <dt>Paket offline</dt>
            <dd>{pwa.ready ? "Siap digunakan" : "Belum siap"}</dd>
          </div>
          <div>
            <dt>Ukuran cadangan saat ini</dt>
            <dd>
              {Math.ceil(
                new TextEncoder().encode(JSON.stringify(progress)).length /
                  1024,
              )}{" "}
              KB
            </dd>
          </div>
          <div>
            <dt>Penyimpanan situs (perkiraan)</dt>
            <dd>
              {estimate
                ? `${Math.round((estimate.usage || 0) / 1024 / 1024)} MB / ${Math.round((estimate.quota || 0) / 1024 / 1024)} MB kuota`
                : "Tidak tersedia pada browser ini"}
            </dd>
          </div>
          <div>
            <dt>Paket terakhir dibangun</dt>
            <dd>
              {pwa.builtAt
                ? new Date(pwa.builtAt).toLocaleString("id-ID")
                : "Belum tersedia"}
            </dd>
          </div>
        </dl>
        <div className="button-row">
          <button
            className="button primary"
            disabled={!ready}
            onClick={() =>
              download(
                `educode-cadangan-${new Date().toISOString().slice(0, 10)}.json`,
                serializeBackup(progress),
              )
            }
          >
            <Download size={16} /> Ekspor progres sekarang
          </button>
          <button
            className="button secondary"
            disabled={!ready}
            onClick={() => {
              try {
                saveSnapshot(localStorage, progress, "Snapshot manual");
                refresh();
                notify("Snapshot tersimpan pada perangkat ini.", "success");
              } catch {
                notify(
                  "Snapshot gagal disimpan. Unduh cadangan berkas terlebih dahulu.",
                  "danger",
                );
              }
            }}
          >
            <History size={16} /> Buat snapshot
          </button>
        </div>
      </section>
      <section className="panel data-panel" id="backup">
        <h2>Data belajar milikmu</h2>
        <p>
          Progres, catatan, dan draft kode tersimpan di browser/perangkat ini.
          Tidak ada akun atau sinkronisasi cloud. Ekspor sebelum berganti
          perangkat atau membersihkan browser.
        </p>
        <div className="button-row">
          <button
            className="button secondary"
            onClick={() => file.current?.click()}
          >
            <Upload size={16} />
            Impor cadangan
          </button>
          <button
            className="button danger"
            onClick={async () => {
              if (
                await confirm({
                  title: "Reset seluruh progres?",
                  description:
                    "Catatan, hasil uji, draft kode, dan progres pada perangkat ini akan dihapus. Ekspor cadangan terlebih dahulu; snapshot pemulihan dibuat sebelum penggantian data.",
                  tone: "danger",
                  requireText: "RESET",
                  accept: "Hapus progres",
                })
              ) {
                if (!replace(emptyProgress(), "Sebelum reset progres")) return;
                try {
                  [
                    "edu_modules",
                    "edu_cards",
                    "edu_fills",
                    "edu_problems",
                    "edu_xp",
                    "educode:exam",
                  ].forEach((k) => localStorage.removeItem(k));
                  sessionStorage.removeItem("educode:exam");
                  sessionStorage.removeItem("educode:exam:v2");
                } catch {}
                refresh();
                notify(
                  "Data belajar direset. Tema tetap dipertahankan.",
                  "success",
                );
              }
            }}
          >
            <Trash2 size={16} />
            Reset Seluruh Data Belajar
          </button>
        </div>
        <input
          ref={file}
          hidden
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            const selected = e.target.files?.[0];
            e.target.value = "";
            if (!selected) return;
            if (selected.size > 2000000) {
              notify("Ukuran cadangan maksimal 2 MB.", "danger");
              return;
            }
            try {
              const imported = parseBackup(await selected.text());
              if (
                await confirm({
                  title: "Impor cadangan belajar?",
                  description:
                    "Cadangan akan mengganti progres, tanpa mengubah tema. Snapshot data sebelumnya dibuat otomatis. Ekspor perubahan yang belum tersimpan terlebih dahulu.",
                  accept: "Ganti dengan cadangan",
                  details: [
                    selected.name,
                    `${imported.completedModules.length} modul selesai · ${xpOf(imported)} XP`,
                    `${Object.keys(imported.notes).length} catatan · ${imported.completedFills.length} latihan sintaks selesai`,
                  ],
                })
              ) {
                if (!replace(imported, "Sebelum impor cadangan")) return;
                refresh();
                notify("Cadangan berhasil diimpor.", "success");
              }
            } catch {
              notify(
                "Format cadangan tidak valid. Gunakan ekspor EduCode Hub atau cadangan v2 lama.",
                "danger",
              );
            }
          }}
        />
      </section>
      <section className="panel offline-panel">
        <h2>Riwayat pemulihan</h2>
        <p>
          Tiga snapshot terakhir disimpan lokal. Impor, reset, dan pemulihan
          membuat snapshot data sebelumnya jika data tersebut valid.
        </p>
        {!snapshots.length ? (
          <p>
            Belum ada snapshot. Buat snapshot pertama atau ekspor cadangan
            sekarang.
          </p>
        ) : (
          <div className="snapshot-list">
            {snapshots.map((snapshot) => (
              <article key={snapshot.id} className="snapshot-card">
                <h3>{snapshot.label}</h3>
                <p>
                  {new Date(snapshot.date).toLocaleString("id-ID")} ·{" "}
                  {xpOf(snapshot.data)} XP ·{" "}
                  {snapshot.data.completedModules.length} modul selesai
                </p>
                <div className="button-row">
                  <button
                    className="button secondary"
                    onClick={() =>
                      download(
                        `educode-snapshot-${snapshot.id}.json`,
                        serializeBackup(snapshot.data),
                      )
                    }
                  >
                    Unduh snapshot
                  </button>
                  <button
                    className="button primary"
                    onClick={async () => {
                      if (
                        await confirm({
                          title: "Pulihkan snapshot?",
                          description:
                            "Progres aktif akan diganti dengan snapshot ini. Data aktif di penyimpanan dicadangkan lebih dulu. Ekspor perubahan yang belum tersimpan sebelum melanjutkan.",
                          accept: "Pulihkan progres",
                          details: [
                            snapshot.label,
                            new Date(snapshot.date).toLocaleString("id-ID"),
                          ],
                        })
                      ) {
                        if (replace(snapshot.data, "Sebelum pemulihan")) {
                          refresh();
                          notify("Snapshot berhasil dipulihkan.", "success");
                        }
                      }
                    }}
                  >
                    Pulihkan
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="offline-grid">
        <section className="panel">
          <h2>Data rusak atau konflik tab?</h2>
          <p>
            Unduh data asli untuk diperiksa. Berkas mentah dapat berisi catatan
            pribadi. Jangan membagikannya tanpa memeriksa isinya.
          </p>
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => {
                try {
                  const raw =
                    localStorage.getItem(QUARANTINE_KEY) ||
                    localStorage.getItem(STORAGE_KEY);
                  if (raw)
                    download("educode-data-mentah.txt", raw, "text/plain");
                  else notify("Belum ada data mentah untuk diekspor.");
                } catch {
                  notify(
                    "Browser tidak mengizinkan pembacaan penyimpanan.",
                    "danger",
                  );
                }
              }}
            >
              Ekspor data mentah
            </button>
            <button
              className="button secondary"
              onClick={async () => {
                if (
                  await confirm({
                    title: "Muat ulang data tersimpan?",
                    description:
                      "Perubahan dalam memori akan diganti dengan data di penyimpanan. Ekspor progres sekarang jika masih ingin menyimpannya.",
                    accept: "Muat data tersimpan",
                  })
                )
                  reloadSaved();
              }}
            >
              Baca ulang penyimpanan
            </button>
          </div>
          <Link prefetch={false} className="text-link" href="#backup">
            Buka impor cadangan →
          </Link>
        </section>
        <section className="panel">
          <h2>Privasi & batas perlindungan</h2>
          <ul>
            <li>
              Tidak ada akun, telemetry, maupun pengiriman catatan ke server
              aplikasi.
            </li>
            <li>
              Progres dan snapshot tidak dienkripsi. Pengguna lain pada profil
              browser yang sama dapat membacanya.
            </li>
            <li>
              Menghapus data situs juga menghapus snapshot. Cadangkan ke berkas
              secara berkala.
            </li>
            <li>XP adalah indikator latihan, bukan bukti asesmen resmi.</li>
            <li>
              Runner menggunakan iframe terisolasi, worker, pembatasan jaringan,
              dan timeout. Jangan memasukkan rahasia ke editor.
            </li>
          </ul>
          <Link prefetch={false} href="/offline" className="text-link">
            Periksa paket offline →
          </Link>
        </section>
      </div>
    </>
  );
}
