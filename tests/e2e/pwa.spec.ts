import { test, expect } from "@playwright/test";
test("complete offline package opens unvisited lessons, search and varied exercises", async ({
  page,
  context,
}) => {
  test.setTimeout(120000);
  await page.goto("/offline");
  await expect(
    page.getByRole("heading", { name: "Paket offline siap.", exact: true }),
  ).toBeVisible({ timeout: 90000 });
  await context.setOffline(true);
  await page.goto("/jobsheet/blade-form");
  await expect(page.locator("main h1")).toContainText("Blade");
  await page.goto("/cari?q=fillable");
  await expect(page.locator(".search-results")).toContainText("$fillable");
  await page.goto("/latihan-variasi");
  await expect(page.locator(".fill-card")).toHaveCount(12);
  const first = await page
    .locator(".fill-card .code-block")
    .first()
    .textContent();
  await page.reload();
  await expect(page.locator(".fill-card")).toHaveCount(12);
  expect(
    await page.locator(".fill-card .code-block").first().textContent(),
  ).not.toBe(first);
  await page.goto("/tantangan");
  await page
    .getByLabel("Editor solusi JavaScript")
    .fill("function hitungSubtotal(xs) { return xs.reduce((a,b)=>a+b,0); }");
  await page.getByRole("button", { name: "Jalankan kode" }).click();
  await expect(page.locator(".output")).toContainText("Semua test lulus.", {
    timeout: 10000,
  });
  await context.setOffline(false);
});
test("PWA manifest has actual PNG icons and a revalidated worker", async ({
  request,
}) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.status()).toBe(200);
  const manifest = await response.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  for (const icon of manifest.icons) {
    const asset = await request.get(icon.src);
    expect(asset.status()).toBe(200);
    expect(asset.headers()["content-type"]).toContain("image/png");
  }
  const worker = await request.get("/sw.js");
  expect(worker.headers()["cache-control"]).toContain("no-cache");
  expect(await worker.text()).not.toContain("/* PWA_CONFIG */ null");
});
