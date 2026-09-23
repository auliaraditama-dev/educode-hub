import { test, expect } from "@playwright/test";

test("cancel and Escape preserve data; reset requires an exact acknowledgement", async ({
  page,
}) => {
  await page.goto("/progress");
  const before = await page
    .getByRole("heading", { name: /XP terkumpul/ })
    .textContent();
  const trigger = page.getByRole("button", {
    name: "Reset progres",
    exact: true,
  });
  await trigger.click();
  await expect(
    page.getByRole("button", { name: "Batal", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Hapus progres", exact: true }),
  ).toBeDisabled();
  await page.getByLabel(/Ketik RESET/).fill("reset");
  await expect(
    page.getByRole("button", { name: "Hapus progres", exact: true }),
  ).toBeDisabled();
  await page.getByLabel(/Ketik RESET/).fill("RESET");
  await expect(
    page.getByRole("button", { name: "Hapus progres", exact: true }),
  ).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(
    await page.getByRole("heading", { name: /XP terkumpul/ }).textContent(),
  ).toBe(before);
});

test("checkpoint confirmation is reversible and records progress once", async ({
  page,
}) => {
  await page.goto("/jobsheet/landing-crud");
  await page.getByRole("button", { name: /Tandai selesai/ }).click();
  const accept = page.getByRole("button", { name: /Simpan penyelesaian/ });
  await expect(accept).toBeDisabled();
  await page
    .getByRole("checkbox", { name: /Saya sudah mempraktikkan/ })
    .check();
  await expect(accept).toBeEnabled();
  await page.getByRole("button", { name: "Batal", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Tandai selesai/ }),
  ).toBeEnabled();
  await page.getByRole("button", { name: /Tandai selesai/ }).click();
  await expect(accept).toBeDisabled();
});

test("Enter validates syntax and unfinished filter reflects saved progress", async ({
  page,
}) => {
  await page.goto("/fillcode");
  const answer = page.getByLabel("Jawaban Route resource");
  await answer.fill("wrong");
  await answer.press("Enter");
  await expect(answer).toHaveAttribute("aria-invalid", "true");
  await answer.fill("resource");
  await answer.press("Enter");
  await expect(answer).toBeDisabled();
  await page.getByLabel("Filter latihan sintaks").selectOption("unfinished");
  await expect(page.locator(".fill-card")).toHaveCount(7);
  await page.reload();
  await expect(answer).toBeDisabled();
});

test("mobile navigation traps keyboard focus and closes with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const menu = page.locator(".mobile-menu");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("button", { name: "Tutup menu", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});
