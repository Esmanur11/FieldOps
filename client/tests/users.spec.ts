import { expect, test } from "@playwright/test";
import {
  apiCreatePersonnel,
  apiCreateUser,
  apiGetFirstSite,
  apiLogin,
  loginAsViaUi,
  loginViaUi,
} from "./helpers";

test.describe("User management module", () => {
  test("admin, Kullanıcılar menüsünü görür ve sayfaya erişebilir", async ({ page }) => {
    await loginViaUi(page);

    await expect(page.getByRole("link", { name: "Kullanıcılar" })).toBeVisible();
    await page.getByRole("link", { name: "Kullanıcılar" }).click();
    await page.waitForURL("/users");

    await expect(page.getByRole("heading", { name: "Hesaplar" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hesabı Olmayan Personel" })).toBeVisible();
  });

  test("admin olmayan kullanıcı Kullanıcılar menüsünü göremez ve /users'a yönlendirilir", async ({
    page,
    request,
  }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const personnel = await apiCreatePersonnel(request, token, site.id, `Test Personel ${Date.now()}`);
    const username = `test.user.${Date.now()}`;
    const password = "GucluBirSifre123!";
    await apiCreateUser(request, token, username, password, "User", personnel.id);

    await loginAsViaUi(page, username, password);

    await expect(page.getByRole("link", { name: "Kullanıcılar" })).not.toBeVisible();

    await page.goto("/users");
    await page.waitForURL("/");
    await expect(page.getByRole("heading", { name: "Hesaplar" })).not.toBeVisible();
  });

  test("hesap oluşturma akışı çalışır", async ({ page, request }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const fullName = `Yeni Personel ${Date.now()}`;
    await apiCreatePersonnel(request, token, site.id, fullName);

    await loginViaUi(page);
    await page.goto("/users");

    const withoutAccountCard = page
      .locator("h2", { hasText: "Hesabı Olmayan Personel" })
      .locator("xpath=following-sibling::*[1]");
    const accountsCard = page
      .locator("h2", { hasText: "Hesaplar" })
      .locator("xpath=following-sibling::*[1]");

    const personnelRow = withoutAccountCard.locator("tr", { hasText: fullName });
    await expect(personnelRow).toBeVisible();
    await personnelRow.getByRole("button", { name: "Hesap Oluştur", exact: true }).click();

    const usernameInput = page.getByLabel("Kullanıcı Adı");
    const passwordInput = page.getByLabel("Geçici Şifre");
    await expect(usernameInput).not.toHaveValue("");
    await expect(passwordInput).not.toHaveValue("");
    const generatedUsername = await usernameInput.inputValue();
    const generatedPassword = await passwordInput.inputValue();
    expect(generatedPassword.length).toBeGreaterThanOrEqual(12);

    await page.getByRole("button", { name: "Oluştur", exact: true }).click();

    const revealModal = page.getByRole("heading", { name: "Hesap Oluşturuldu" }).locator("xpath=../..");
    await expect(revealModal.getByText("bu şifreyi kaydedin, bir daha gösterilmeyecek", { exact: false })).toBeVisible();
    await expect(revealModal.getByText(generatedUsername, { exact: true })).toBeVisible();
    await expect(revealModal.getByText(generatedPassword, { exact: true })).toBeVisible();

    await revealModal.getByRole("button", { name: "Kapat", exact: true }).last().click();

    await expect(accountsCard.locator("tr", { hasText: generatedUsername })).toBeVisible();
    await expect(withoutAccountCard.locator("tr", { hasText: fullName })).not.toBeVisible();
  });

  test("kullanılan bir kullanıcı adıyla hesap oluşturma reddedilir", async ({ page, request }) => {
    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const fullName = `Doğrulama Personeli ${Date.now()}`;
    await apiCreatePersonnel(request, token, site.id, fullName);

    await loginViaUi(page);
    await page.goto("/users");

    const withoutAccountCard = page
      .locator("h2", { hasText: "Hesabı Olmayan Personel" })
      .locator("xpath=following-sibling::*[1]");
    const personnelRow = withoutAccountCard.locator("tr", { hasText: fullName });
    await personnelRow.getByRole("button", { name: "Hesap Oluştur", exact: true }).click();

    await page.getByLabel("Kullanıcı Adı").fill("admin");
    await page.getByRole("button", { name: "Oluştur", exact: true }).click();

    await expect(page.getByText("Bu kullanıcı adı zaten kullanılıyor.", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Kullanıcı Adı")).toBeVisible();
  });
});
