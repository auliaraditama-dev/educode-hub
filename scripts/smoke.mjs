import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const paths = [
  "/",
  "/jobsheet",
  "/cheatsheet",
  "/flashcards",
  "/fillcode",
  "/tantangan",
  "/simulasi",
  "/pengujian",
  "/catatan",
  "/portofolio",
  "/progress",
  "/referensi",
  "/referensi/jobsheet",
  "/referensi/rangkuman",
  "/jobsheet/database-mvc",
  "/cari?q=fillable",
  "/sitemap.xml",
  "/robots.txt",
  "/runner",
];
for (const path of paths) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  const text = await response.text();
  assert.ok(text.length > 50, path);
  if (path === "/jobsheet/database-mvc") {
    assert.ok(text.includes("application/ld+json"));
    assert.ok(text.includes("unsignedInteger"));
    assert.ok(text.includes('rel="canonical"'));
  }
  if (path === "/referensi/rangkuman")
    for (let i = 1; i <= 18; i++)
      assert.ok(text.includes(`id="bagian-${i}"`), `anchor ${i}`);
  if (path === "/runner") {
    assert.ok(
      response.headers
        .get("content-security-policy")
        .includes("connect-src 'none'"),
    );
    assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
  }
  console.log(`PASS ${path}`);
}
assert.equal((await fetch(base + "/halaman-tidak-ada")).status, 404);
console.log("PASS 404; all 20 HTTP checks passed");
