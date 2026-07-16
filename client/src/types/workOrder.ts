export interface WorkOrder {
  id: number;
  siteId: number;
  siteName: string;
  title: string;
  description: string | null;
  sourceType: string | null;
  sourceId: number | null;
  assignedTo: number | null;
  assignedToName: string | null;
  priority: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateWorkOrderRequest {
  siteId: number;
  title: string;
  description: string;
  priority: string;
  assignedTo: number | null;
}
