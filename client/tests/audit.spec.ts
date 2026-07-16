import { expect, test } from "@playwright/test";
import {
  apiCreateAudit,
  apiCreateAuditFinding,
  apiGetFirstPersonnel,
  apiGetFirstSite,
  apiLogin,
  formatDate,
  loginViaUi,
} from "./helpers";

test.describe("Audit module", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page);
  });

  test("denetim ve bulgu UI üzerinden oluşturulunca görünür", async ({ page }) => {
    const auditType = `Playwright Denetim ${Date.now()}`;

    await page.goto("/audits");
    await page.getByRole("button", { name: "+ Yeni Denetim Ekle" }).click();
    await page.getByLabel("Tarih").fill(formatDate(new Date()));
    await page.getByLabel("Tip").fill(auditType);
    await page.getByRole("button", { name: "Kaydet" }).click();

    await page.getByPlaceholder("Şantiye, denetçi veya tipe göre ara...").fill(auditType);
    await expect(page.getByText(auditType)).toBeVisible();
    await page.getByText(auditType).click();

    await expect(page.getByRole("heading", { name: auditType })).toBeVisible();

    const findingDescription = `Playwright Bulgu ${Date.now()}`;
    await page.getByRole("button", { name: "+ Bulgu Ekle" }).click();
    await page.getByLabel("Önem Derecesi").selectOption({ label: "high" });
    await page.getByLabel("Açıklama").fill(findingDescription);
    await page.getByRole("button", { name: "Kaydet" }).click();

    const row = page.locator("tr", { hasText: findingDescription });
    await expect(row).toBeVisible();
    await expect(row.getByText("high", { exact: true })).toBeVisible();
  });

  test("önem derecesi rozetleri doğru renklerde görünür", async ({ page, request }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const inspector = await apiGetFirstPersonnel(request, token);
    const audit = await apiCreateAudit(request, token, site.id, inspector.id, "severity-colors");

    const suffix = Date.now();
    const severities: { severity: string; description: string; colorClass: string }[] = [
      { severity: "low", description: `Low Bulgu ${suffix}`, colorClass: "text-slate-400" },
      { severity: "medium", description: `Medium Bulgu ${suffix}`, colorClass: "text-amber-400" },
      { severity: "high", description: `High Bulgu ${suffix}`, colorClass: "text-orange-400" },
      { severity: "critical", description: `Critical Bulgu ${suffix}`, colorClass: "text-red-400" },
    ];

    for (const { severity, description } of severities) {
      await apiCreateAuditFinding(request, token, audit.id, severity, description);
    }

    await page.goto(`/audits/${audit.id}`);

    for (const { description, colorClass } of severities) {
      const row = page.locator("tr", { hasText: description });
      await expect(row.locator(`span.${colorClass}`)).toBeVisible();
    }
  });

  test("bulgu durumu open'dan resolved'a güncellenebilir", async ({ page, request }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const inspector = await apiGetFirstPersonnel(request, token);
    const audit = await apiCreateAudit(request, token, site.id, inspector.id, "status-update");
    const description = `Durum Testi Bulgu ${Date.now()}`;
    await apiCreateAuditFinding(request, token, audit.id, "medium", description);

    await page.goto(`/audits/${audit.id}`);

    const row = page.locator("tr", { hasText: description });
    const statusSelect = row.locator("select");
    await expect(statusSelect).toHaveValue("open");

    await statusSelect.selectOption("resolved");
    await expect(statusSelect).toHaveValue("resolved");

    await page.reload();
    const reloadedRow = page.locator("tr", { hasText: description });
    await expect(reloadedRow.locator("select")).toHaveValue("resolved");
  });
});
