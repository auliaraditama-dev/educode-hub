import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
async function files(dir) {
  const found = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      found.map((entry) =>
        entry.isDirectory()
          ? files(path.join(dir, entry.name))
          : path.join(dir, entry.name),
      ),
    )
  ).flat();
}
const version = (await readFile(".next/BUILD_ID", "utf8")).trim();
const manifest = JSON.parse(
  await readFile(".next/prerender-manifest.json", "utf8"),
);
const routes = Object.keys(manifest.routes).filter(
  (route) =>
    !route.startsWith("/_") &&
    !route.endsWith(".xml") &&
    !route.endsWith(".txt"),
);
const assets = (await files(".next/static"))
  .filter((file) => !file.endsWith(".map"))
  .map(
    (file) => "/" + file.replaceAll("\\", "/").replace(/^\.next\//, "_next/"),
  );
const urls = [
  ...new Set([
    ...routes,
    ...assets,
    "/runner",
    "/offline.html",
    "/icon.svg",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/maskable-512.png",
    "/icons/apple-touch-icon.png",
  ]),
];
for (const required of ["/", "/cari", "/latihan-variasi", "/offline"])
  if (!urls.includes(required))
    throw new Error(`Missing static offline route: ${required}`);
const template = await readFile("scripts/sw-template.js", "utf8");
await writeFile(
  "public/sw.js",
  template.replace("/* PWA_CONFIG */ null", JSON.stringify({ version, urls })),
);
await writeFile(
  "public/offline-build.json",
  JSON.stringify(
    { version, pages: routes.length, resources: urls.length },
    null,
    2,
  ),
);
console.log(
  `PWA: ${routes.length} pages and ${urls.length} resources prepared for offline use (${version}).`,
);
