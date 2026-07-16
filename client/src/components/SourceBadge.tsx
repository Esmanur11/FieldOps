import { ClipboardCheck, Package, User, Wrench, type LucideIcon } from "lucide-react";

interface SourceMeta {
  label: string;
  icon: LucideIcon;
  colorClasses: string;
}

const sourceMeta: Record<string, SourceMeta> = {
  audit_finding: {
    label: "Denetim Bulgusu",
    icon: ClipboardCheck,
    colorClasses: "border-red-500/30 bg-red-500/15 text-red-400",
  },
  maintenance_prediction: {
    label: "Bakım Tahmini",
    icon: Wrench,
    colorClasses: "border-orange-500/30 bg-orange-500/15 text-orange-400",
  },
  low_stock: {
    label: "Düşük Stok",
    icon: Package,
    colorClasses: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  },
};

const manualMeta: SourceMeta = {
  label: "Manuel",
  icon: User,
  colorClasses: "border-slate-500/30 bg-slate-500/15 text-slate-400",
};

interface SourceBadgeProps {
  sourceType: string | null;
}

export function SourceBadge({ sourceType }: SourceBadgeProps) {
  const meta = (sourceType && sourceMeta[sourceType]) || manualMeta;
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.colorClasses}`}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
}
