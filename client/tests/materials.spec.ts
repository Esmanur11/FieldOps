import { expect, test } from "@playwright/test";
import { apiCreateMaterial, apiGetFirstSite, apiLogin, loginViaUi, setReorderThreshold } from "./helpers";

test.describe("Materials module", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page);
  });

  test("yeni malzeme eklenince kataloğa yansır", async ({ page }) => {
    await page.goto("/materials");

    const name = `Test Malzeme ${Date.now()}`;
    await page.getByRole("button", { name: "+ Yeni Malzeme Ekle" }).click();
    await page.getByLabel("İsim").fill(name);
    await page.getByLabel("Birim", { exact: true }).fill("adet");
    await page.getByRole("button", { name: "Kaydet" }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test("stok girişi ve çıkışı miktarı doğru günceller", async ({ page, request }) => {
    const token = await apiLogin(request);
    const material = await apiCreateMaterial(request, token, `Stok Testi ${Date.now()}`);
    const site = await apiGetFirstSite(request, token);

    await page.goto("/materials");
    const row = page.locator("tr", { hasText: material.name });

    await page.getByRole("button", { name: "Stok Hareketi Ekle" }).click();
    await page.getByLabel("Şantiye").selectOption({ label: site.name });
    await page.getByLabel("Malzeme").selectOption({ label: material.name });
    await page.getByLabel("Tip").selectOption({ label: "Giriş" });
    await page.getByLabel("Miktar").fill("50");
    await page.getByRole("button", { name: "Kaydet" }).click();

    await expect(row).toContainText("50");

    await page.getByRole("button", { name: "Stok Hareketi Ekle" }).click();
    await page.getByLabel("Şantiye").selectOption({ label: site.name });
    await page.getByLabel("Malzeme").selectOption({ label: material.name });
    await page.getByLabel("Tip").selectOption({ label: "Çıkış" });
    await page.getByLabel("Miktar").fill("20");
    await page.getByRole("button", { name: "Kaydet" }).click();

    await expect(row).toContainText("30");
  });

  test("yetersiz stokta backend hata mesajı modalde gösterilir", async ({ page, request }) => {
    const token = await apiLogin(request);
    const material = await apiCreateMaterial(request, token, `Yetersiz Stok Testi ${Date.now()}`);
    const site = await apiGetFirstSite(request, token);

    await page.goto("/materials");

    await page.getByRole("button", { name: "Stok Hareketi Ekle" }).click();
    await page.getByLabel("Şantiye").selectOption({ label: site.name });
    await page.getByLabel("Malzeme").selectOption({ label: material.name });
    await page.getByLabel("Tip").selectOption({ label: "Giriş" });
    await page.getByLabel("Miktar").fill("10");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByLabel("Miktar")).toBeHidden();

    await page.getByRole("button", { name: "Stok Hareketi Ekle" }).click();
    await page.getByLabel("Şantiye").selectOption({ label: site.name });
    await page.getByLabel("Malzeme").selectOption({ label: material.name });
    await page.getByLabel("Tip").selectOption({ label: "Çıkış" });
    await page.getByLabel("Miktar").fill("999999");
    await page.getByRole("button", { name: "Kaydet" }).click();

    await expect(page.getByText(/Yetersiz stok/)).toBeVisible();
    // Modal kapanmamalı — miktar alanı hâlâ görünür olmalı.
    await expect(page.getByLabel("Miktar")).toBeVisible();
  });

  test("eşik altına inen stok için düşük stok rozeti görünür", async ({ page, request }) => {
    const token = await apiLogin(request);
    const material = await apiCreateMaterial(request, token, `Düşük Stok Testi ${Date.now()}`);
    const site = await apiGetFirstSite(request, token);

    await page.goto("/materials");

    await page.getByRole("button", { name: "Stok Hareketi Ekle" }).click();
    await page.getByLabel("Şantiye").selectOption({ label: site.name });
    await page.getByLabel("Malzeme").selectOption({ label: material.name });
    await page.getByLabel("Tip").selectOption({ label: "Giriş" });
    await page.getByLabel("Miktar").fill("10");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByLabel("Miktar")).toBeHidden();

    setReorderThreshold(site.id, material.id, 50);
    await page.reload();

    const row = page.locator("tr", { hasText: material.name });
    await expect(row.getByText("Düşük Stok", { exact: true })).toBeVisible();
  });
});
