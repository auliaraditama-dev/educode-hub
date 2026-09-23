import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const worker = await fetch(base + "/sw.js");
assert.equal(worker.status, 200);
assert.match(worker.headers.get("cache-control"), /no-cache/);
const source = await worker.text();
const config = JSON.parse(source.match(/const CONFIG = (\{[^\n]+\});/)[1]);
assert.equal(config.version, (await readFile(".next/BUILD_ID", "utf8")).trim());
for (const url of config.urls) {
  const response = await fetch(base + url);
  assert.equal(response.status, 200, url);
  assert.equal(response.redirected, false, url);
}
const manifest = await (await fetch(base + "/manifest.webmanifest")).json();
assert.equal(manifest.display, "standalone");
assert.equal(manifest.scope, "/");
for (const icon of manifest.icons) {
  const response = await fetch(base + icon.src);
  assert.match(response.headers.get("content-type"), /image\/png/);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.readUInt32BE(0), 0x89504e47);
}
console.log(
  `PASS: ${config.urls.length} offline resources, build version, manifest, PNG icons, worker headers.`,
);
