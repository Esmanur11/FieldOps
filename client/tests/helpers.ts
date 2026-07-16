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

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export async function apiGetFirstPersonnel(
  request: APIRequestContext,
  token: string,
): Promise<{ id: number; fullName: string }> {
  const response = await request.get(`${API_BASE_URL}/personnel`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const personnel = await response.json();
  return personnel[0];
}

export async function apiCreateMachine(
  request: APIRequestContext,
  token: string,
  siteId: number,
  name: string,
  purchaseDate: string,
): Promise<{ id: number; name: string }> {
  const response = await request.post(`${API_BASE_URL}/machines`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      siteId,
      name,
      type: "excavator",
      serialNumber: null,
      purchaseDate,
      status: "active",
    },
  });
  return response.json();
}

export async function apiCreateMaintenanceRecord(
  request: APIRequestContext,
  token: string,
  machineId: number,
  maintenanceDate: string,
): Promise<void> {
  await request.post(`${API_BASE_URL}/maintenance-records`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      machineId,
      maintenanceDate,
      type: "routine",
      description: "Rutin bakım",
      cost: 500,
      performedBy: "Test Tekniker",
    },
  });
}

export async function apiCreateUsageLog(
  request: APIRequestContext,
  token: string,
  machineId: number,
  operatorId: number,
  logDate: string,
  hoursUsed: number,
): Promise<void> {
  await request.post(`${API_BASE_URL}/machine-usage-logs`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { machineId, logDate, hoursUsed, fuelConsumed: null, operatorId },
  });
}
