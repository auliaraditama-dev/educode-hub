import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty">
      <span className="eyebrow">404</span>
      <h1>Materi belum ditemukan.</h1>
      <p>
        Alamat mungkin sudah berubah. Kembali ke daftar jobsheet untuk
        melanjutkan.
      </p>
      <Link className="button primary" href="/jobsheet">
        Buka jobsheet
      </Link>
    </div>
  );
}
