"use client";
import Link from "next/link";
import { themeBootstrap } from "@/lib/theme";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <style>{`body{margin:0;padding:24px;font:16px/1.7 system-ui;background:#f7f8fa;color:#222837}html[data-theme=dark] body{background:#141923;color:#e9edf4}button,a{font:inherit;color:inherit;padding:12px;display:inline-block}main{max-width:640px;margin:auto}`}</style>
      </head>
      <body>
        <main>
          <h1>Aplikasi belum dapat dimuat.</h1>
          <p>Coba kembali. Data belajar yang tersimpan tidak dihapus.</p>
          <button onClick={reset}>Coba lagi</button>
          <Link href="/">Buka beranda</Link>
        </main>
      </body>
    </html>
  );
}

