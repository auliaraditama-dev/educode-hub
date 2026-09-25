import { test, expect } from "@playwright/test";
test("dashboard, responsive menu, theme and all public learning routes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Selangkah lebih dekat/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "../../work/dashboard-desktop.png",
    fullPage: true,
  });
  await page.getByLabel("Tema tampilan").selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({
    path: "../../work/dashboard-dark.png",
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByLabel("Tema tampilan").selectOption("light");
  for (const route of [
    "/jobsheet",
    "/cheatsheet",
    "/flashcards",
    "/fillcode",
    "/simulasi",
    "/pengujian",
    "/catatan",
    "/portofolio",
    "/progress",
    "/referensi",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Buka menu" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "../../work/dashboard-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Buka menu" }).click();
  await page.getByRole("link", { name: "Jobsheet", exact: true }).click();
  await expect(page.locator("main h1")).toContainText("Belajar dari awal");
  expect(errors).toEqual([]);
});
test("module completion is idempotent, notes and bookmarks persist", async ({
  page,
}) => {
  await page.goto("/jobsheet/skenario-spesifikasi");
  await page.getByRole("button", { name: /Tandai selesai/ }).click();
  await expect(
    page.getByRole("button", { name: /Simpan penyelesaian/ }),
  ).toBeDisabled();
  await page
    .getByRole("checkbox", { name: /Saya sudah mempraktikkan/ })
    .check();
  await page.getByRole("button", { name: /Simpan penyelesaian/ }).click();
  await expect(
    page.getByRole("button", { name: "Modul selesai" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await page.locator("#lesson-note").fill("Saya memahami alur MVC.");
  await page.reload();
  await expect(page.locator("#lesson-note")).toHaveValue(
    "Saya memahami alur MVC.",
  );
  await expect(
    page.getByRole("button", { name: "Tersimpan", exact: true }),
  ).toBeVisible();
  await page.goto("/progress");
  await expect(
    page.getByRole("heading", { name: /50 XP terkumpul/ }),
  ).toBeVisible();
  await page.goto("/catatan");
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await expect(page.locator(".notes-grid .panel")).toHaveCount(1);
});
test("search, filter, flashcards and fill exercises", async ({ page }) => {
  await page.goto("/cheatsheet");
  await page.getByLabel("Cari sintaks").fill("tidakditemukan");
  await expect(page.getByText("Sintaks tidak ditemukan.")).toBeVisible();
  await page.getByLabel("Cari sintaks").fill("validasi");
  await expect(page.locator(".cheat-card")).not.toHaveCount(0);
  await page.goto("/flashcards");
  await page.getByRole("button", { name: "Tampilkan jawaban" }).click();
  await expect(page.locator(".flashcard-text")).toContainText("products");
  await page.getByRole("button", { name: /Saya sudah paham/ }).click();
  await expect(
    page.getByRole("button", { name: "Sudah dikuasai" }),
  ).toBeDisabled();
  await page.goto("/fillcode");
  await page.getByLabel("Jawaban Route resource").fill("wrong");
  await page.getByRole("button", { name: "Periksa jawaban" }).first().click();
  await expect(page.getByText(/Belum tepat/)).toBeVisible();
  await page.getByLabel("Jawaban Route resource").fill("resource");
  await page.getByRole("button", { name: "Periksa jawaban" }).first().click();
  await expect(page.getByLabel("Jawaban Route resource")).toBeDisabled();
  await page.goto("/cari?q=fillable");
  await expect(page.locator(".search-results")).toContainText("$fillable");
});
test("sandbox runs solutions, rejects errors and terminates infinite loops", async ({
  page,
}) => {
  await page.goto("/tantangan");
  await page.frameLocator("iframe").locator("body").waitFor();
  await page
    .getByLabel("Editor solusi JavaScript")
    .fill("function hitungSubtotal(xs) { return xs.reduce((a,b)=>a+b,0); }");
  await page.getByRole("button", { name: "Jalankan kode" }).click();
  await expect(page.locator(".output")).toContainText("Semua test lulus.", {
    timeout: 10000,
  });
  await page
    .getByLabel("Editor solusi JavaScript")
    .fill(
      'function hitungSubtotal(xs) { return localStorage.getItem("educode:progress:v2"); }',
    );
  await page.getByRole("button", { name: "Jalankan kode" }).click();
  await expect(page.locator(".output")).toContainText(
    "localStorage is not defined",
  );
  await page
    .getByLabel("Editor solusi JavaScript")
    .fill("function hitungSubtotal(xs) { while(true){} }");
  await page.getByRole("button", { name: "Jalankan kode" }).click();
  await expect(page.locator(".output")).toContainText("Batas waktu", {
    timeout: 10000,
  });
  await expect(
    page.getByRole("button", { name: "Jalankan kode" }),
  ).toBeEnabled();
});
test("exam survives reload and generates review", async ({ page }) => {
  await page.goto("/simulasi");
  await page.getByRole("button", { name: "Mulai simulasi" }).click();
  await page.locator(".quiz-card").first().getByRole("radio").first().check();
  await page.reload();
  await expect(
    page.locator(".quiz-card").first().getByRole("radio").first(),
  ).toBeChecked();
  await page.getByRole("button", { name: "Kumpulkan jawaban" }).click();
  await page.getByRole("button", { name: "Kumpulkan sekarang" }).click();
  await expect(page.locator(".exam-bar")).toContainText("Hasil: 1/10");
  await expect(page.locator(".correct")).toHaveCount(10);
  await page.goto("/progress");
  await expect(page.getByText("Simulasi terakhir")).toBeVisible();
});
test("manual test requires evidence, reports export, invalid imports and reset stay scoped", async ({
  page,
}) => {
  await page.goto("/pengujian");
  await page.getByLabel("Status TC-01").selectOption("lulus");
  await expect(page.getByLabel("Status TC-01")).toHaveValue("belum");
  await page
    .locator(".test-card")
    .first()
    .locator("textarea")
    .fill("HTTP 200, screenshot landing.png");
  await page.getByLabel("Status TC-01").selectOption("lulus");
  await expect(page.getByLabel("Status TC-01")).toHaveValue("lulus");
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor laporan" }).click();
  expect((await dl).suggestedFilename()).toBe("laporan-pengujian.md");
  await page.goto("/keamanan");
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByRole("alert")).toContainText("Format cadangan");
  await page.evaluate(() =>
    localStorage.setItem("unrelated-data", "preserved"),
  );
  await page.getByRole("button", { name: "Reset Seluruh Data Belajar" }).click();
  await expect(
    page.getByRole("button", { name: "Hapus progres" }),
  ).toBeDisabled();
  await page.getByLabel(/Ketik RESET/).fill("RESET");
  await page.getByRole("button", { name: "Hapus progres" }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("unrelated-data")),
  ).toBe("preserved");
});
test("server rendered documents, metadata, sitemap, robots and 404", async ({
  page,
  request,
}) => {
  await page.goto("/referensi/rangkuman#bagian-8");
  await expect(page.locator("#bagian-8")).toHaveText(
    "8. Controller CRUD: Full Bedah Per Baris",
  );
  await expect(page.locator(".document-table").first()).toBeVisible();
  await page.goto("/referensi/jobsheet");
  await expect(page.locator(".document-blocks")).toContainText("nama_produk");
  await page.goto("/jobsheet/database-mvc");
  await expect(page.locator("head title")).toHaveText(
    "Database & arsitektur MVC | EduCode Hub",
  );
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    /\/jobsheet\/database-mvc$/,
  );
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/jobsheet/database-mvc");
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect((await request.get("/tidak-ada")).status()).toBe(404);
  const html = await (await request.get("/jobsheet/database-mvc")).text();
  expect(html).toContain("unsignedInteger");
  expect(html).toContain("application/ld+json");
});

