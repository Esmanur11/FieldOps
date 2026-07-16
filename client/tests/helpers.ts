import type { APIRequestContext, Page } from "@playwright/test";
import { execSync } from "node:child_process";

export const API_BASE_URL = "http://localhost:5050/api";
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "SifreniSecTemel123!";

export async function loginViaUi(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Kullanıcı Adı").fill(ADMIN_USERNAME);
  await page.getByLabel("Şifre").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Giriş Yap" }).click();
  await page.waitForURL("/");
}

export async function apiLogin(request: APIRequestContext): Promise<string> {
  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
  });
  const body = await response.json();
  return body.token as string;
}

export async function apiCreateMaterial(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<{ id: number; name: string }> {
  const response = await request.post(`${API_BASE_URL}/materials`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name, unit: "adet", unitCost: null },
  });
  return response.json();
}

export async function apiGetFirstSite(
  request: APIRequestContext,
  token: string,
): Promise<{ id: number; name: string }> {
  const response = await request.get(`${API_BASE_URL}/sites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const sites = await response.json();
  return sites[0];
}

export function setReorderThreshold(siteId: number, materialId: number, threshold: number): void {
  execSync(
    `docker exec fieldops-db psql -U fieldops -d fieldops_db -c "UPDATE material_stocks SET reorder_threshold = ${threshold} WHERE site_id = ${siteId} AND material_id = ${materialId};"`,
  );
}
