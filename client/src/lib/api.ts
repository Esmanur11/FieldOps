import type {
  Audit,
  AuditDetail,
  AuditFinding,
  CreateAuditFindingRequest,
  CreateAuditRequest,
  UpdateAuditFindingRequest,
} from "../types/audit";
import type { CreateMachineRequest, Machine } from "../types/machine";
import type {
  CreateMachineUsageLogRequest,
  CreateMaintenanceRecordRequest,
  MachineUsageLog,
  MaintenancePrediction,
  MaintenanceRecord,
} from "../types/maintenance";
import type {
  CreateMaterialRequest,
  CreateMaterialTransactionRequest,
  Material,
  MaterialStock,
  MaterialTransaction,
} from "../types/material";
import type { CreatePersonnelRequest, Personnel } from "../types/personnel";
import type { CreateSiteRequest, Site } from "../types/site";
import { clearAuth, getToken, type AuthUser } from "./auth";

const API_BASE_URL = "http://localhost:5050/api";

// Central fetch wrapper: attaches the bearer token to every request and,
// on a 401 (missing/expired/invalid token), clears the session and forces
// a redirect to /login — a hard navigation since this module sits outside
// the React tree and has no router context to navigate through.
async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearAuth();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return response;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Kullanıcı adı veya şifre hatalı.");
  }

  const data = await response.json();
  return {
    token: data.token,
    username: data.username,
    role: data.role,
    expiresAt: data.expiresAt,
  };
}

export async function getSites(): Promise<Site[]> {
  const response = await apiFetch("/sites");
  if (!response.ok) {
    throw new Error(`Şantiyeler alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function getSiteById(id: number): Promise<Site> {
  const response = await apiFetch(`/sites/${id}`);
  if (response.status === 404) {
    throw new Error("Şantiye bulunamadı");
  }
  if (!response.ok) {
    throw new Error(`Şantiye alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createSite(request: CreateSiteRequest): Promise<Site> {
  const response = await apiFetch("/sites", {
    method: "POST",
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
  const path = siteId !== undefined ? `/personnel?siteId=${siteId}` : "/personnel";
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`Personel alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function getPersonnelById(id: number): Promise<Personnel> {
  const response = await apiFetch(`/personnel/${id}`);
  if (response.status === 404) {
    throw new Error("Personel bulunamadı");
  }
  if (!response.ok) {
    throw new Error(`Personel alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createPersonnel(request: CreatePersonnelRequest): Promise<Personnel> {
  const response = await apiFetch("/personnel", {
    method: "POST",
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
  const path = siteId !== undefined ? `/machines?siteId=${siteId}` : "/machines";
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`Makineler alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function getMachineById(id: number): Promise<Machine> {
  const response = await apiFetch(`/machines/${id}`);
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

  const response = await apiFetch("/machines", {
    method: "POST",
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

export async function getMaterials(): Promise<Material[]> {
  const response = await apiFetch("/materials");
  if (!response.ok) {
    throw new Error(`Malzemeler alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createMaterial(request: CreateMaterialRequest): Promise<Material> {
  const response = await apiFetch("/materials", {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object"
        ? Object.values(body).flat().join(", ")
        : `Malzeme oluşturulamadı (HTTP ${response.status})`;
    throw new Error(message || `Malzeme oluşturulamadı (HTTP ${response.status})`);
  }

  return response.json();
}

export async function getMaterialStocks(siteId?: number): Promise<MaterialStock[]> {
  const path = siteId !== undefined ? `/material-stocks?siteId=${siteId}` : "/material-stocks";
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`Stok bilgisi alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createMaterialTransaction(
  request: CreateMaterialTransactionRequest,
): Promise<MaterialTransaction> {
  const response = await apiFetch("/material-transactions", {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object"
        ? Object.values(body).flat().join(", ")
        : `Stok hareketi kaydedilemedi (HTTP ${response.status})`;
    throw new Error(message || `Stok hareketi kaydedilemedi (HTTP ${response.status})`);
  }

  return response.json();
}

export async function getMaterialTransactions(
  siteId?: number,
  materialId?: number,
): Promise<MaterialTransaction[]> {
  const params = new URLSearchParams();
  if (siteId !== undefined) params.set("siteId", String(siteId));
  if (materialId !== undefined) params.set("materialId", String(materialId));
  const query = params.toString();
  const response = await apiFetch(`/material-transactions${query ? `?${query}` : ""}`);
  if (!response.ok) {
    throw new Error(`Stok hareketleri alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function getMachineUsageLogs(machineId?: number): Promise<MachineUsageLog[]> {
  const path = machineId !== undefined ? `/machine-usage-logs?machineId=${machineId}` : "/machine-usage-logs";
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`Kullanım kayıtları alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createMachineUsageLog(
  request: CreateMachineUsageLogRequest,
): Promise<MachineUsageLog> {
  const response = await apiFetch("/machine-usage-logs", {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object"
        ? Object.values(body).flat().join(", ")
        : `Kullanım kaydı oluşturulamadı (HTTP ${response.status})`;
    throw new Error(message || `Kullanım kaydı oluşturulamadı (HTTP ${response.status})`);
  }

  return response.json();
}

export async function getMaintenanceRecords(machineId?: number): Promise<MaintenanceRecord[]> {
  const path = machineId !== undefined ? `/maintenance-records?machineId=${machineId}` : "/maintenance-records";
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`Bakım kayıtları alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createMaintenanceRecord(
  request: CreateMaintenanceRecordRequest,
): Promise<MaintenanceRecord> {
  const response = await apiFetch("/maintenance-records", {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object"
        ? Object.values(body).flat().join(", ")
        : `Bakım kaydı oluşturulamadı (HTTP ${response.status})`;
    throw new Error(message || `Bakım kaydı oluşturulamadı (HTTP ${response.status})`);
  }

  return response.json();
}

export async function getMaintenancePredictions(machineId?: number): Promise<MaintenancePrediction[]> {
  const path =
    machineId !== undefined
      ? `/maintenance-predictions?machineId=${machineId}`
      : "/maintenance-predictions";
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`Bakım tahmini alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function recalculateMaintenancePrediction(
  machineId: number,
): Promise<MaintenancePrediction> {
  const response = await apiFetch(`/maintenance-predictions/recalculate?machineId=${machineId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Bakım tahmini hesaplanamadı (HTTP ${response.status})`);
  }

  return response.json();
}

export async function getAudits(siteId?: number): Promise<Audit[]> {
  const path = siteId !== undefined ? `/audits?siteId=${siteId}` : "/audits";
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`Denetimler alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function getAuditById(id: number): Promise<AuditDetail> {
  const response = await apiFetch(`/audits/${id}`);
  if (response.status === 404) {
    throw new Error("Denetim bulunamadı");
  }
  if (!response.ok) {
    throw new Error(`Denetim alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createAudit(request: CreateAuditRequest): Promise<AuditDetail> {
  const response = await apiFetch("/audits", {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object"
        ? Object.values(body).flat().join(", ")
        : `Denetim oluşturulamadı (HTTP ${response.status})`;
    throw new Error(message || `Denetim oluşturulamadı (HTTP ${response.status})`);
  }

  return response.json();
}

export async function getAuditFindings(auditId?: number): Promise<AuditFinding[]> {
  const path = auditId !== undefined ? `/audit-findings?auditId=${auditId}` : "/audit-findings";
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(`Bulgular alınamadı (HTTP ${response.status})`);
  }
  return response.json();
}

export async function createAuditFinding(
  request: CreateAuditFindingRequest,
): Promise<{ id: number }> {
  const payload = {
    ...request,
    category: request.category || null,
    correctiveAction: request.correctiveAction || null,
    dueDate: request.dueDate || null,
  };

  const response = await apiFetch("/audit-findings", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object"
        ? Object.values(body).flat().join(", ")
        : `Bulgu oluşturulamadı (HTTP ${response.status})`;
    throw new Error(message || `Bulgu oluşturulamadı (HTTP ${response.status})`);
  }

  return response.json();
}

export async function updateAuditFinding(
  id: number,
  request: UpdateAuditFindingRequest,
): Promise<void> {
  const payload = {
    ...request,
    category: request.category || null,
    correctiveAction: request.correctiveAction || null,
    dueDate: request.dueDate || null,
  };

  const response = await apiFetch(`/audit-findings/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body === "object"
        ? Object.values(body).flat().join(", ")
        : `Bulgu güncellenemedi (HTTP ${response.status})`;
    throw new Error(message || `Bulgu güncellenemedi (HTTP ${response.status})`);
  }
}
