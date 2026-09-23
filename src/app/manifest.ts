import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "EduCode Hub — Belajar & Praktik",
    short_name: "EduCode Hub",
    description:
      "Jobsheet Laravel, latihan kode, dan persiapan SERKOM yang dapat dipelajari offline.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8fa",
    theme_color: "#ed683c",
    lang: "id",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Latihan variasi",
        url: "/latihan-variasi",
        description: "Paket sintaks dan perbaikan kode baru",
      },
      { name: "Jobsheet Laravel", url: "/jobsheet" },
    ],
  };
}
