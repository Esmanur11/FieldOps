import type { CreateSiteRequest, Site } from "../types/site";

const API_BASE_URL = "http://localhost:5050/api";

export async function getSites(): Promise<Site[]> {
  const response = await fetch(`${API_BASE_URL}/sites`);
  if (!response.ok) {
    throw new Error(`Şantiyeler alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function getSiteById(id: number): Promise<Site> {
  const response = await fetch(`${API_BASE_URL}/sites/${id}`);
  if (response.status === 404) {
    throw new Error("Şantiye bulunamadı");
  }
  if (!response.ok) {
    throw new Error(`Şantiye alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createSite(request: CreateSiteRequest): Promise<Site> {
  const response = await fetch(`${API_BASE_URL}/sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object"
        ? Object.values(body).flat().join(", ")
        : `Şantiye oluşturulamadı (HTTP ${response.status})`;
    throw new Error(message || `Şantiye oluşturulamadı (HTTP ${response.status})`);
  }

  return response.json();
}
