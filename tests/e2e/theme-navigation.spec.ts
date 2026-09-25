import { test, expect } from "@playwright/test";
declare global { interface Window { recordTheme: (theme: string) => void; } }
test("dark theme paints before hydration and survives client navigation/history", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("educode:theme", "dark"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const origin = await page.evaluate(() => performance.timeOrigin);
  const readings: string[] = [];
  await page.exposeFunction("recordTheme", (theme: string) => readings.push(theme));
  await page.evaluate(() => {
    const record = () => window.recordTheme(getComputedStyle(document.body).backgroundColor);
    new MutationObserver(record).observe(document.documentElement, { attributes: true }); record();
  });
  await page.getByRole("link", {name:"Jobsheet",exact:true}).click();
  await expect(page).toHaveURL(/\/jobsheet$/);
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(origin);
  await page.locator(".global-search input").fill("validasi");
  await page.locator(".global-search input").press("Enter");
  await expect(page).toHaveURL(/\/cari\?q=validasi/);
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(origin);
  await page.goBack(); await page.goForward();
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
  expect(readings.every(color => color === "rgb(20, 25, 35)")).toBeTruthy();
  await page.route("**/_next/**/*.js",route=>route.abort());
  await page.reload({waitUntil:"domcontentloaded"});
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(20, 25, 35)");
});
test("system theme changes live and reset/import leave preference intact", async ({page}) => {
  await page.emulateMedia({colorScheme:"dark"});
  await page.goto("/keamanan");
  await page.getByLabel("Tema tampilan").selectOption("system");
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
  await page.emulateMedia({colorScheme:"light"});
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
  await page.getByLabel("Tema tampilan").selectOption("dark");
  await page.locator("input[type=file]").setInputFiles({name:"legacy.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify({version:2,completedModules:[1],theme:"light"}))});
  await page.getByRole("button",{name:"Ganti dengan cadangan"}).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
  await page.getByRole("button",{name:"Reset Seluruh Data Belajar"}).click();
  await page.getByLabel(/Ketik RESET/).fill("RESET");
  await page.getByRole("button",{name:"Hapus progres"}).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
  expect(await page.evaluate(()=>localStorage.getItem("educode:theme"))).toBe("dark");
});
test("responsive reading and simulation work across requested viewport widths", async ({page}) => {
  for (const width of [320,375,390,430,768,1024,1280,1440]) {
    await page.setViewportSize({width,height:900});
    for(const route of ["/", "/jobsheet/database-mvc", "/cari?q=harga", "/simulasi", "/keamanan"]) {
      await page.goto(route);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    }
  }
});

