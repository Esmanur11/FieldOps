import { expect, test } from "@playwright/test";
import {
  apiCreateAudit,
  apiCreateAuditFinding,
  apiCreateWorkOrder,
  apiGetFirstPersonnel,
  apiGetFirstSite,
  apiLogin,
  loginViaUi,
} from "./helpers";

test.describe("Work Order module", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page);
  });

  test("kritik denetim bulgusundan otomatik üretilen iş emri listede görünür", async ({
    page,
    request,
  }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const inspector = await apiGetFirstPersonnel(request, token);
    const audit = await apiCreateAudit(request, token, site.id, inspector.id, "work-order-trigger");
    const description = `Otomatik Tetik Bulgu ${Date.now()}`;
    await apiCreateAuditFinding(request, token, audit.id, "critical", description);

    await page.goto("/work-orders");
    await page.getByPlaceholder("Şantiye veya başlığa göre ara...").fill(description);

    const row = page.locator("tr", { hasText: description });
    await expect(row).toBeVisible();
    await expect(row.getByText("Denetim Bulgusu", { exact: true })).toBeVisible();
  });

  test("manuel iş emri oluşturulunca listede görünür", async ({ page }) => {
    const title = `Manuel İş Emri ${Date.now()}`;

    await page.goto("/work-orders");
    await page.getByRole("button", { name: "+ Yeni İş Emri" }).click();
    await page.getByLabel("Başlık").fill(title);
    await page.getByRole("button", { name: "Kaydet" }).click();

    await page.getByPlaceholder("Şantiye veya başlığa göre ara...").fill(title);
    const row = page.locator("tr", { hasText: title });
    await expect(row).toBeVisible();
    await expect(row.getByText("Manuel", { exact: true })).toBeVisible();
  });

  test("durum open'dan in_progress'e ve completed'a geçirilebilir", async ({ page, request }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const title = `Durum Testi ${Date.now()}`;
    const workOrder = await apiCreateWorkOrder(request, token, site.id, title);

    await page.goto(`/work-orders/${workOrder.id}`);

    await expect(page.getByText("open", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Başlat (in_progress)" }).click();
    await expect(page.getByText("in_progress", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Tamamla (completed)" }).click();
    await expect(page.getByText("completed", { exact: true })).toBeVisible();

    const completedAtValue = page
      .locator("p", { hasText: "Tamamlanma Tarihi" })
      .locator("xpath=following-sibling::p[1]");
    await expect(completedAtValue).not.toHaveText("—");
  });
});
