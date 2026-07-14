export interface Personnel {
  id: number;
  siteId: number;
  fullName: string;
  role: string;
  phone: string | null;
  hireDate: string;
  status: string;
}

export interface CreatePersonnelRequest {
  siteId: number;
  fullName: string;
  role: string;
  phone: string;
  hireDate: string;
  status: string;
}
