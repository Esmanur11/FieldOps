export interface Audit {
  id: number;
  siteId: number;
  siteName: string;
  inspectorId: number;
  inspectorName: string;
  auditDate: string;
  type: string;
  status: string;
}

export interface AuditFinding {
  id: number;
  auditId: number;
  category: string | null;
  severity: string;
  description: string;
  correctiveAction: string | null;
  dueDate: string | null;
  status: string;
}

export interface AuditDetail extends Audit {
  findings: AuditFinding[];
}

export interface CreateAuditRequest {
  siteId: number;
  inspectorId: number;
  auditDate: string;
  type: string;
  status: string;
}

export interface CreateAuditFindingRequest {
  auditId: number;
  category: string;
  severity: string;
  description: string;
  correctiveAction: string;
  dueDate: string;
}

export interface UpdateAuditFindingRequest {
  category: string;
  severity: string;
  description: string;
  correctiveAction: string;
  dueDate: string;
  status: string;
}
