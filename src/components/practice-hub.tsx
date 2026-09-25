"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FillCode } from "./learning";
import { PracticeLab } from "./practice-lab";
export function PracticeHub() {
  const variation = useSearchParams().get("tab") === "variasi";
  return (
    <>
      <nav className="tabs" aria-label="Jenis latihan kode">
        <Link
          href="/latihan"
          className={!variation ? "selected button" : "button"}
          aria-current={!variation ? "page" : undefined}
        >
          Dasar
        </Link>
        <Link
          href="/latihan?tab=variasi"
          className={variation ? "selected button" : "button"}
          aria-current={variation ? "page" : undefined}
        >
          Variasi & perbaikan
        </Link>
      </nav>
      {variation ? <PracticeLab /> : <FillCode />}
    </>
  );
}
