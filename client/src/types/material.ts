export interface Material {
  id: number;
  name: string;
  unit: string;
  unitCost: number | null;
}

export interface CreateMaterialRequest {
  name: string;
  unit: string;
  unitCost: number | null;
}

export interface MaterialStock {
  id: number;
  siteId: number;
  siteName: string;
  materialId: number;
  materialName: string;
  unit: string;
  quantity: number;
  reorderThreshold: number;
  updatedAt: string;
  isLowStock: boolean;
}

export interface MaterialTransaction {
  id: number;
  siteId: number;
  materialId: number;
  transactionType: string;
  quantity: number;
  workOrderId: number | null;
  performedBy: number;
  transactionDate: string;
}

export interface CreateMaterialTransactionRequest {
  siteId: number;
  materialId: number;
  transactionType: string;
  quantity: number;
  performedBy: number;
}