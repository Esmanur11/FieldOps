interface BadgeProps {
  children: string;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  completed: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  on_hold: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  inactive: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export function Badge({ children }: BadgeProps) {
  const colorClasses = statusColors[children] ?? statusColors.inactive;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${colorClasses}`}
    >
      {children}
    </span>
  );
}
