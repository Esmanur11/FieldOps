export interface Machine {
  id: number;
  siteId: number;
  name: string;
  type: string;
  serialNumber: string | null;
  purchaseDate: string | null;
  status: string;
}

export interface CreateMachineRequest {
  siteId: number;
  name: string;
  type: string;
  serialNumber: string;
  purchaseDate: string;
  status: string;
}
