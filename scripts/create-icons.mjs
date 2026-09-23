import sharp from "sharp";
import fs from "node:fs";
fs.mkdirSync("public/icons", { recursive: true });
const svg = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="90" fill="#ed683c"/><path d="M204 152h-25q-24 0-24 24v42q0 38-32 38 32 0 32 38v42q0 24 24 24h25M308 152h25q24 0 24 24v42q0 38 32 38-32 0-32 38v42q0 24-24 24h-25" fill="none" stroke="white" stroke-width="25" stroke-linecap="round"/><path d="m273 213-34 86" stroke="white" stroke-width="22" stroke-linecap="round"/></svg>',
);
Promise.all(
  [
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["maskable-512.png", 512],
    ["apple-touch-icon.png", 180],
  ].map(([name, size]) =>
    sharp(svg)
      .resize(size, size)
      .png()
      .toFile("public/icons/" + name),
  ),
).then(() => console.log("PWA PNG icons generated"));
