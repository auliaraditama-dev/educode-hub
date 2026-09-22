"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty">
      <h1>Halaman belum dapat dimuat.</h1>
      <p>
        Coba lagi. Cadangan progres dapat dikelola melalui halaman Progres
        belajar.
      </p>
      <button className="button primary" onClick={reset}>
        Coba lagi
      </button>
    </div>
  );
}
