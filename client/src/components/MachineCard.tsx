import { useNavigate } from "react-router-dom";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { MachineTypeBadge } from "./MachineTypeBadge";
import type { Machine } from "../types/machine";

interface MachineCardProps {
  machine: Machine;
  siteName: string;
}

export function MachineCard({ machine, siteName }: MachineCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/machines/${machine.id}`)}
      className="cursor-pointer p-5 transition-colors hover:border-navy-600"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{machine.name}</p>
          <p className="mt-0.5 text-xs text-slate-400">{siteName}</p>
        </div>
        <MachineTypeBadge type={machine.type} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-navy-700 pt-3">
        <span className="text-xs text-slate-400">{machine.serialNumber ?? "—"}</span>
        <Badge>{machine.status}</Badge>
      </div>
    </Card>
  );
}
