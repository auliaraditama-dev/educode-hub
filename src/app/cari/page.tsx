import { Suspense } from "react";
import { LocalSearch } from "@/components/local-search";
export const metadata = {
  title: "Cari materi",
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <Suspense fallback={<p>Menyiapkan pencarian lokal…</p>}>
      <LocalSearch />
    </Suspense>
  );
}
