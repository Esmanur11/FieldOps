import { expect, test } from "@playwright/test";
import {
  apiCreateMachine,
  apiCreateMaintenanceRecord,
  apiCreateUsageLog,
  apiGetFirstPersonnel,
  apiGetFirstSite,
  apiLogin,
  daysAgo,
  formatDate,
  loginViaUi,
} from "./helpers";

test.describe("Predictive Maintenance module", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page);
  });

  test("kullanım kaydı eklenince listede görünür", async ({ page, request }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const personnel = await apiGetFirstPersonnel(request, token);
    const machine = await apiCreateMachine(
      request,
      token,
      site.id,
      `Kullanım Testi ${Date.now()}`,
      formatDate(daysAgo(30)),
    );

    await page.goto(`/machines/${machine.id}`);

    await page.getByRole("button", { name: "+ Kayıt Ekle" }).click();
    await page.getByLabel("Tarih").fill(formatDate(new Date()));
    await page.getByLabel("Saat").fill("25");
    await page.getByLabel("Operatör").selectOption({ label: personnel.fullName });
    await page.getByRole("button", { name: "Kaydet" }).click();

    await expect(page.getByRole("row").filter({ hasText: "25 saat" })).toBeVisible();
  });

  test("bakım kaydı eklenince geçmişte görünür", async ({ page, request }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const machine = await apiCreateMachine(
      request,
      token,
      site.id,
      `Bakım Testi ${Date.now()}`,
      formatDate(daysAgo(30)),
    );

    await page.goto(`/machines/${machine.id}`);

    await page.getByRole("button", { name: "+ Bakım Ekle" }).click();
    await page.getByLabel("Tarih").fill(formatDate(new Date()));
    await page.getByLabel("Tip").fill("repair");
    await page.getByLabel("Yapan").fill("Playwright Tekniker");
    await page.getByRole("button", { name: "Kaydet" }).click();

    await expect(page.getByRole("row").filter({ hasText: "repair" })).toBeVisible();
    await expect(page.getByText("Playwright Tekniker")).toBeVisible();
  });

  test("bakım geçmişi olmayan yoğun kullanılan makinede risk göstergesi yüksek ve kırmızı", async ({
    page,
    request,
  }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const personnel = await apiGetFirstPersonnel(request, token);
    const machine = await apiCreateMachine(
      request,
      token,
      site.id,
      `Yuksek Risk Testi ${Date.now()}`,
      formatDate(daysAgo(60)),
    );
    await apiCreateUsageLog(request, token, machine.id, personnel.id, formatDate(daysAgo(30)), 50);

    await page.goto(`/machines/${machine.id}`);
    await page.getByRole("button", { name: "Şimdi Yeniden Hesapla" }).click();

    await expect(page.locator('circle[stroke="#ef4444"]')).toBeVisible();
    await expect(page.getByText("100", { exact: true })).toBeVisible();
  });

  test("yakın zamanda bakımı yapılmış az kullanılan makinede risk göstergesi düşük ve yeşil", async ({
    page,
    request,
  }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const personnel = await apiGetFirstPersonnel(request, token);
    const machine = await apiCreateMachine(
      request,
      token,
      site.id,
      `Dusuk Risk Testi ${Date.now()}`,
      formatDate(daysAgo(90)),
    );

    await apiCreateMaintenanceRecord(request, token, machine.id, formatDate(daysAgo(80)));
    await apiCreateUsageLog(request, token, machine.id, personnel.id, formatDate(daysAgo(70)), 100);
    await apiCreateUsageLog(request, token, machine.id, personnel.id, formatDate(daysAgo(50)), 100);
    await apiCreateMaintenanceRecord(request, token, machine.id, formatDate(daysAgo(30)));
    await apiCreateUsageLog(request, token, machine.id, personnel.id, formatDate(daysAgo(10)), 10);

    await page.goto(`/machines/${machine.id}`);
    await page.getByRole("button", { name: "Şimdi Yeniden Hesapla" }).click();

    await expect(page.locator('circle[stroke="#10b981"]')).toBeVisible();
    await expect(page.getByText("5", { exact: true })).toBeVisible();
  });
});
