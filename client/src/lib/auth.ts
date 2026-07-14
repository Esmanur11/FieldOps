export interface AuthUser {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
}

const STORAGE_KEY = "fieldops_auth";

export function getAuth(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getAuth()?.token ?? null;
}

export function setAuth(auth: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  const auth = getAuth();
  if (!auth) return false;
  return new Date(auth.expiresAt).getTime() > Date.now();
}
