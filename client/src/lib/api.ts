import type { CreateMachineRequest, Machine } from "../types/machine";
import type { CreatePersonnelRequest, Personnel } from "../types/personnel";
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

export async function getPersonnel(siteId?: number): Promise<Personnel[]> {
  const url =
    siteId !== undefined ? `${API_BASE_URL}/personnel?siteId=${siteId}` : `${API_BASE_URL}/personnel`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Personel alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function getPersonnelById(id: number): Promise<Personnel> {
  const response = await fetch(`${API_BASE_URL}/personnel/${id}`);
  if (response.status === 404) {
    throw new Error("Personel bulunamadı");
  }
  if (!response.ok) {
    throw new Error(`Personel alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createPersonnel(request: CreatePersonnelRequest): Promise<Personnel> {
  const response = await fetch(`${API_BASE_URL}/personnel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object"
        ? Object.values(body).flat().join(", ")
        : `Personel oluşturulamadı (HTTP ${response.status})`;
    throw new Error(message || `Personel oluşturulamadı (HTTP ${response.status})`);
  }

  return response.json();
}

export async function getMachines(siteId?: number): Promise<Machine[]> {
  const url =
    siteId !== undefined ? `${API_BASE_URL}/machines?siteId=${siteId}` : `${API_BASE_URL}/machines`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Makineler alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function getMachineById(id: number): Promise<Machine> {
  const response = await fetch(`${API_BASE_URL}/machines/${id}`);
  if (response.status === 404) {
    throw new Error("Makine bulunamadı");
  }
  if (!response.ok) {
    throw new Error(`Makine alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createMachine(request: CreateMachineRequest): Promise<Machine> {
  const payload = {
    ...request,
    serialNumber: request.serialNumber || null,
    purchaseDate: request.purchaseDate || null,
  };

  const response = await fetch(`${API_BASE_URL}/machines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object"
        ? Object.values(body).flat().join(", ")
        : `Makine oluşturulamadı (HTTP ${response.status})`;
    throw new Error(message || `Makine oluşturulamadı (HTTP ${response.status})`);
  }

  return response.json();
}
