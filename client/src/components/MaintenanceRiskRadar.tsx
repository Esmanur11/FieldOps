import { Radar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "./Card";
import { RiskGauge } from "./RiskGauge";
import type { TopRiskMachine } from "../types/maintenance";

interface MaintenanceRiskRadarProps {
  machines: TopRiskMachine[];
  isLoading: boolean;
}

export function MaintenanceRiskRadar({ machines, isLoading }: MaintenanceRiskRadarProps) {
  const navigate = useNavigate();

  return (
    <Card className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
          <Radar size={16} />
        </span>
        <h2 className="text-sm font-semibold text-white">Bakım Riski Radarı</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Yükleniyor...</p>
      ) : machines.length === 0 ? (
        <p className="text-sm text-slate-400">Henüz bir bakım tahmini hesaplanmadı.</p>
      ) : (
        <div className="flex flex-1 flex-col divide-y divide-navy-800">
          {machines.map((machine) => (
            <button
              key={machine.machineId}
              type="button"
              onClick={() => navigate(`/machines/${machine.machineId}`)}
              className="flex items-center gap-4 py-3 text-left first:pt-0 last:pb-0 hover:bg-navy-800/60"
            >
              <RiskGauge riskScore={machine.riskScore} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{machine.machineName}</p>
                <p className="truncate text-xs text-slate-400">{machine.siteName}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
