import { expect, test } from "@playwright/test";
import {
  apiCreateShift,
  apiGetFirstSite,
  apiLogin,
  formatDate,
  loginViaUi,
} from "./helpers";

test.describe("Shift module", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page);
  });

  test("vardiya oluşturulunca şablon listesinde görünür", async ({ page }) => {
    const name = `Test Vardiya ${Date.now()}`;

    await page.goto("/shifts");
    await page.getByRole("button", { name: "+ Yeni Vardiya Ekle" }).click();
    await page.getByLabel("İsim").fill(name);
    await page.getByLabel("Başlangıç Saati").fill("08:00");
    await page.getByLabel("Bitiş Saati").fill("16:00");
    await page.getByRole("button", { name: "Kaydet" }).click();

    await expect(page.getByText(name, { exact: true })).toBeVisible();
  });

  test("atama oluşturma ve check-in/check-out akışı çalışır", async ({ page, request }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const shift = await apiCreateShift(request, token, site.id, `Akış Vardiyası ${Date.now()}`);

    await page.goto("/shifts");
    await page.getByRole("button", { name: "+ Yeni Atama" }).click();
    await page.getByLabel("Vardiya").selectOption({ label: `${shift.name} (${site.name})` });
    await page.getByLabel("Tarih").fill(formatDate(new Date()));
    await page.getByRole("button", { name: "Kaydet" }).click();

    const row = page.locator("tr", { hasText: shift.name });
    await expect(row).toBeVisible();
    await expect(row.getByText("scheduled", { exact: true })).toBeVisible();

    await row.getByRole("button", { name: "Check-in Yap" }).click();
    // "Check-out Yap" only renders once checkIn is set (see ShiftsPage's conditional row
    // action), so its appearance is itself proof the check-in timestamp was persisted.
    await expect(row.getByRole("button", { name: "Check-out Yap" })).toBeVisible();

    await row.getByRole("button", { name: "Check-out Yap" }).click();
    await expect(row.getByText("completed", { exact: true })).toBeVisible();
    await expect(row.getByText("Tamamlandı", { exact: true })).toBeVisible();
  });
});
