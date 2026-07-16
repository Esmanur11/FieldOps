import { expect, test } from "@playwright/test";
import {
  apiCreateAudit,
  apiCreateAuditFinding,
  apiGetFirstPersonnel,
  apiGetFirstSite,
  apiLogin,
  loginViaUi,
} from "./helpers";

test.describe("Notification module", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page);
  });

  test("kritik bulgu bildirim zilini canlı artırır, dropdown'da görünür ve okundu işaretlenebilir", async ({
    page,
    request,
  }) => {
    const bellButton = page.getByLabel("Bildirimler");
    await expect(bellButton).toBeVisible();
    // Give the SignalR connection a moment to finish negotiating before triggering the event,
    // or the server push can arrive before this client has subscribed.
    await page.waitForTimeout(1000);

    const token = await apiLogin(request);
    const site = await apiGetFirstSite(request, token);
    const inspector = await apiGetFirstPersonnel(request, token);
    const audit = await apiCreateAudit(request, token, site.id, inspector.id, "notification-test");
    const description = `Bildirim Testi ${Date.now()}`;
    await apiCreateAuditFinding(request, token, audit.id, "critical", description);

    // The unread badge should appear live via SignalR, with no page reload.
    const badge = bellButton.locator("span").first();
    await expect(badge).toBeVisible({ timeout: 10000 });

    await bellButton.click();
    await expect(page.getByText("Bildirimler", { exact: true })).toBeVisible();

    const notificationItem = page.getByRole("button", { name: description });
    await expect(notificationItem).toBeVisible();
    await expect(notificationItem.getByText("critical", { exact: true })).toBeVisible();

    await notificationItem.click();
    await page.waitForURL(new RegExp(`/audits/${audit.id}$`));
  });
});
