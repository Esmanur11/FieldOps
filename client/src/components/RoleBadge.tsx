const roleColors: Record<string, string> = {
  Mühendis: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Operatör: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  İşçi: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  Denetçi: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Şantiye Şefi": "bg-red-500/15 text-red-400 border-red-500/30",
};

const fallbackColor = "bg-teal-500/15 text-teal-400 border-teal-500/30";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const colorClasses = roleColors[role] ?? fallbackColor;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClasses}`}
    >
      {role}
    </span>
  );
}
