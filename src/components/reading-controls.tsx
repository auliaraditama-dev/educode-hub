"use client";
import { useEffect, useState } from "react";
import { Focus } from "lucide-react";
export function ReadingControls() {
  const [scale, setScale] = useState(1);
  const [focus, setFocus] = useState(false);
  useEffect(() => {
    try {
      const value = Number(localStorage.getItem("educode:font-scale"));
      if ([0.9, 1, 1.1, 1.2].includes(value)) setScale(value);
    } catch {}
    return () => {
      delete document.documentElement.dataset.focus;
      document.documentElement.style.removeProperty("--reading-scale");
    };
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--reading-scale",
      String(scale),
    );
  }, [scale]);
  useEffect(() => {
    document.documentElement.dataset.focus = String(focus);
  }, [focus]);
  const resize = (value: number) => {
    const bounded = Math.max(0.9, Math.min(1.2, Math.round(value * 10) / 10));
    setScale(bounded);
    try {
      localStorage.setItem("educode:font-scale", String(bounded));
    } catch {}
  };
  return (
    <div className="reading-controls" aria-label="Pengaturan membaca">
      <div role="group" aria-label="Ukuran teks materi">
        <button
          className="button secondary"
          aria-label="Perkecil teks materi"
          disabled={scale <= 0.9}
          onClick={() => resize(scale - 0.1)}
        >
          A−
        </button>
        <button
          className="button secondary"
          aria-label="Ukuran teks normal"
          onClick={() => resize(1)}
        >
          A
        </button>
        <button
          className="button secondary"
          aria-label="Perbesar teks materi"
          disabled={scale >= 1.2}
          onClick={() => resize(scale + 0.1)}
        >
          A+
        </button>
      </div>
      <button
        className="button secondary"
        aria-pressed={focus}
        onClick={() => setFocus((value) => !value)}
      >
        <Focus size={16} />
        {focus ? "Keluar mode fokus" : "Mode fokus"}
      </button>
    </div>
  );
}
