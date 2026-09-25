import type { MetadataRoute } from "next";
import { modules } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/jobsheet",
    "/cheatsheet",
    "/flashcards",
    "/latihan",
    "/tantangan",

    "/offline",
    "/referensi",
    "/referensi/jobsheet",
    "/referensi/rangkuman",
    ...modules.map((m) => `/jobsheet/${m.slug}`),
  ].map((path) => ({
    url: siteUrl + path,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path.startsWith("/jobsheet/") ? 0.8 : 0.6,
  }));
}
