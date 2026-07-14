import { Construction, Cylinder, Droplets, TowerControl, Truck, Wrench, type LucideIcon } from "lucide-react";

interface TypeConfig {
  icon: LucideIcon;
  colorClasses: string;
}

const typeConfig: Record<string, TypeConfig> = {
  Ekskavatör: { icon: Construction, colorClasses: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  Vinç: { icon: TowerControl, colorClasses: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  Kamyon: { icon: Truck, colorClasses: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  "Beton Pompası": { icon: Droplets, colorClasses: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
  Silindir: { icon: Cylinder, colorClasses: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  Diğer: { icon: Wrench, colorClasses: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
};

const fallback: TypeConfig = typeConfig["Diğer"];

interface MachineTypeBadgeProps {
  type: string;
}

export function MachineTypeBadge({ type }: MachineTypeBadgeProps) {
  const config = typeConfig[type] ?? fallback;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.colorClasses}`}
    >
      <Icon size={12} />
      {type}
    </span>
  );
}
