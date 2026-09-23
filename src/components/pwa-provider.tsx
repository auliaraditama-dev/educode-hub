"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Download, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useInteractions } from "./interaction-provider";
import { PageHeading } from "./ui";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
type State = {
  online: boolean;
  ready: boolean;
  installed: boolean;
  installable: boolean;
  status: string;
  version: string;
  count: number;
  waiting: boolean;
  install: () => Promise<void>;
  update: () => Promise<void>;
  retry: () => Promise<void>;
};
const Context = createContext<State>({
  online: true,
  ready: false,
  installed: false,
  installable: false,
  status: "Menyiapkan aplikasi…",
  version: "",
  count: 0,
  waiting: false,
  install: async () => {},
  update: async () => {},
  retry: async () => {},
});
export const usePwa = () => useContext(Context);
export function PwaProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true),
    [ready, setReady] = useState(false),
    [installed, setInstalled] = useState(false),
    [installable, setInstallable] = useState(false),
    [waiting, setWaiting] = useState(false),
    [status, setStatus] = useState("Menyiapkan paket offline…"),
    [version, setVersion] = useState(""),
    [count, setCount] = useState(0);
  const deferred = useRef<InstallEvent | null>(null),
    registration = useRef<ServiceWorkerRegistration | null>(null),
    reloadAfterUpdate = useRef(false);
  const { confirm, notify } = useInteractions();
  useEffect(() => {
    let disposed = false;
    const listeners: Array<() => void> = [];
    const connection = () => setOnline(navigator.onLine);
    connection();
    const media = matchMedia("(display-mode: standalone)");
    const standalone = () =>
      setInstalled(
        media.matches ||
          Boolean(
            (navigator as Navigator & { standalone?: boolean }).standalone,
          ),
      );
    standalone();
    media.addEventListener("change", standalone);
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      deferred.current = event as InstallEvent;
      setInstallable(true);
    };
    const didInstall = () => {
      deferred.current = null;
      setInstallable(false);
      setInstalled(true);
    };
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", didInstall);
    // Full-document navigation keeps offline pages independent of Next flight cache keys.
    const navigate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        !navigator.serviceWorker?.controller
      )
        return;
      const anchor = (event.target as Element)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      )
        return;
      const url = new URL(anchor.href);
      if (
        url.origin !== location.origin ||
        (url.pathname === location.pathname &&
          url.search === location.search &&
          url.hash)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      location.assign(url.href);
    };
    document.addEventListener("click", navigate, true);
    const report = async () => {
      const worker = registration.current?.active;
      if (!worker || disposed) return;
      const channel = new MessageChannel();
      const timer = setTimeout(() => {
        channel.port1.close();
      }, 8000);
      channel.port1.onmessage = (event) => {
        clearTimeout(timer);
        channel.port1.close();
        if (disposed) return;
        setWaiting(Boolean(registration.current?.waiting));
        setReady(Boolean(event.data.ready));
        setVersion(String(event.data.version));
        setCount(Number(event.data.count));
        setStatus(
          event.data.ready
            ? "Paket lengkap tersimpan. Materi dan latihan siap dibuka offline."
            : "Paket offline belum lengkap.",
        );
      };
      worker.postMessage({ type: "STATUS" }, [channel.port2]);
    };
    const controlled = () => {
      if (reloadAfterUpdate.current) location.reload();
      else void report();
    };
    if (!("serviceWorker" in navigator) || !window.isSecureContext)
      setStatus(
        "PWA memerlukan browser yang mendukung service worker dan HTTPS (atau localhost).",
      );
    else if (process.env.NODE_ENV !== "production")
      setStatus(
        "Mode pengembangan: paket offline hanya aktif setelah npm run build dan npm start.",
      );
    else {
      navigator.serviceWorker.addEventListener("controllerchange", controlled);
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((reg) => {
          if (disposed) return;
          registration.current = reg;
          setWaiting(Boolean(reg.waiting));
          void report();
          const track = () => {
            const worker = reg.installing;
            if (!worker) return;
            setStatus(
              "Mengunduh seluruh materi dan aset. Tetap online hingga paket siap…",
            );
            const changed = () => {
              if (disposed) return;
              if (worker.state === "installed") {
                setWaiting(Boolean(reg.waiting));
                if (reg.active) void report();
              }
              if (worker.state === "activated") void report();
              if (worker.state === "redundant")
                setStatus(
                  "Paket gagal diperbarui. Periksa koneksi atau ruang penyimpanan lalu coba lagi.",
                );
            };
            worker.addEventListener("statechange", changed);
            listeners.push(() =>
              worker.removeEventListener("statechange", changed),
            );
          };
          track();
          reg.addEventListener("updatefound", track);
          listeners.push(() => reg.removeEventListener("updatefound", track));
        })
        .catch(() => {
          if (!disposed)
            setStatus(
              "Paket offline belum terpasang. Periksa koneksi dan pengaturan penyimpanan browser.",
            );
        });
    }
    return () => {
      disposed = true;
      listeners.forEach((fn) => fn());
      media.removeEventListener("change", standalone);
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", didInstall);
      document.removeEventListener("click", navigate, true);
      navigator.serviceWorker?.removeEventListener(
        "controllerchange",
        controlled,
      );
    };
  }, []);
  const install = async () => {
    if (!deferred.current) {
      notify(
        "Gunakan menu browser: Pasang aplikasi atau Tambahkan ke Layar Utama. Di iPhone gunakan Safari → Bagikan.",
      );
      return;
    }
    const event = deferred.current;
    deferred.current = null;
    setInstallable(false);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      notify(
        choice.outcome === "accepted"
          ? "Permintaan pemasangan diterima browser."
          : "Pemasangan dibatalkan; portal tetap bisa digunakan.",
      );
    } catch {
      notify("Pemasangan belum tersedia. Gunakan menu browser.");
    }
  };
  const update = async () => {
    if (!registration.current?.waiting) return;
    if (
      await confirm({
        title: "Gunakan versi terbaru?",
        description:
          "Halaman akan dimuat ulang. Progres tersimpan tetap ada, tetapi isian latihan yang belum diperiksa akan hilang. Tutup tab EduCode lain setelah memperbarui.",
        accept: "Perbarui & muat ulang",
      })
    ) {
      reloadAfterUpdate.current = true;
      registration.current.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };
  const retry = async () => {
    try {
      if (registration.current) {
        await registration.current.update();
        notify(
          "Pemeriksaan pembaruan selesai. Paket baru diunduh jika tersedia.",
        );
      } else location.reload();
    } catch {
      notify(
        "Belum dapat memeriksa pembaruan. Sambungkan internet lalu coba lagi.",
        "danger",
      );
    }
  };
  return (
    <Context.Provider
      value={{
        online,
        ready,
        installed,
        installable,
        status,
        version,
        count,
        waiting,
        install,
        update,
        retry,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function PwaStatus() {
  const pwa = usePwa();
  return (
    <div className="pwa-status">
      <Link prefetch={false} href="/offline">
        {pwa.online ? <CheckCircle2 size={14} /> : <WifiOff size={14} />}{" "}
        {pwa.online
          ? pwa.ready
            ? "Siap offline"
            : "Siapkan offline"
          : "Mode offline"}
      </Link>
      {pwa.waiting && <button onClick={pwa.update}>Versi baru tersedia</button>}
    </div>
  );
}
export function OfflinePage() {
  const pwa = usePwa();
  return (
    <>
      <PageHeading
        eyebrow="BELAJAR DI MANA SAJA"
        title="Ruang belajar, tanpa batas koneksi."
        description="Pasang EduCode di perangkat dan simpan materi untuk belajar tanpa internet. Buka secara online sekali dan tunggu paket selesai diunduh."
      />
      <section className="panel offline-panel">
        <span className="eyebrow">
          {pwa.online ? "TERHUBUNG" : "TANPA INTERNET"}
        </span>
        <h2>{pwa.ready ? "Paket offline siap." : "Persiapan paket offline"}</h2>
        <p role="status">{pwa.status}</p>
        {pwa.ready && (
          <p>
            {pwa.count} sumber daya tersimpan · versi {pwa.version.slice(0, 12)}
          </p>
        )}
        <div className="button-row">
          <button
            className="button primary"
            onClick={pwa.install}
            disabled={pwa.installed}
          >
            <Download size={16} />
            {pwa.installed
              ? "Aplikasi terpasang"
              : pwa.installable
                ? "Pasang aplikasi"
                : "Cara memasang aplikasi"}
          </button>
          <button
            className="button secondary"
            onClick={pwa.retry}
            disabled={!pwa.online}
          >
            <RefreshCw size={16} /> Periksa pembaruan
          </button>
          {pwa.waiting && (
            <button className="button primary" onClick={pwa.update}>
              Gunakan versi baru
            </button>
          )}
        </div>
      </section>
      <div className="offline-grid">
        <section className="panel">
          <h2>Tetap tersedia offline</h2>
          <ul>
            <li>Semua jobsheet dan kedua dokumen referensi.</li>
            <li>
              Latihan dasar, flashcards, variasi kode, dan sandbox JavaScript.
            </li>
            <li>
              Pencarian lokal, simulasi, catatan, serta ekspor/impor progres.
            </li>
            <li>Progres otomatis tersimpan di browser ini.</li>
          </ul>
          <Link
            prefetch={false}
            className="button secondary"
            href="/latihan-variasi"
          >
            Buka latihan variasi
          </Link>
        </section>
        <section className="panel">
          <h2>Hal yang perlu diketahui</h2>
          <ul>
            <li>Unduhan pertama dan pembaruan membutuhkan internet.</li>
            <li>
              Instalasi melalui menu browser; iPhone: Safari → Bagikan →
              Tambahkan ke Layar Utama.
            </li>
            <li>
              Cache dapat dihapus oleh browser ketika penyimpanan penuh. Ekspor
              progres secara berkala.
            </li>
            <li>
              Tautan eksternal dan aplikasi Laravel/MySQL lokal bukan bagian
              paket offline.
            </li>
            <li>
              Menghapus data situs juga menghapus progres dan paket offline.
            </li>
          </ul>
          <Link prefetch={false} href="/progress" className="text-link">
            Cadangkan progres belajar →
          </Link>
        </section>
      </div>
    </>
  );
}
