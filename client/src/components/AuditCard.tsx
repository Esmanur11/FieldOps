import { ClipboardCheck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Audit } from "../types/audit";
import { Badge } from "./Badge";
import { Card } from "./Card";

interface AuditCardProps {
  audit: Audit;
}

export function AuditCard({ audit }: AuditCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/audits/${audit.id}`)}
      className="cursor-pointer p-5 transition-colors hover:border-navy-600"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
          <ClipboardCheck size={20} />
        </span>
        <div>
          <p className="font-medium text-white">{audit.type}</p>
          <p className="mt-0.5 text-xs text-slate-400">{audit.siteName}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <User size={12} />
            {audit.inspectorName}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-navy-700 pt-3">
        <span className="text-xs text-slate-400">{audit.auditDate}</span>
        <Badge>{audit.status}</Badge>
      </div>
    </Card>
  );
}
