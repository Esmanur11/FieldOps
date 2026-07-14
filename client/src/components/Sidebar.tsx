interface NavItem {
  label: string;
  enabled: boolean;
}

const navItems: NavItem[] = [
  { label: "Sites", enabled: true },
  { label: "Personnel", enabled: false },
  { label: "Machines", enabled: false },
  { label: "Materials", enabled: false },
  { label: "Audits", enabled: false },
];

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-navy-700 bg-navy-900">
      <div className="flex h-16 items-center gap-2 border-b border-navy-700 px-6">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
        <span className="text-lg font-semibold text-white">FieldOps</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
              item.enabled
                ? "bg-brand-500/10 text-brand-500"
                : "cursor-not-allowed text-slate-500"
            }`}
          >
            <span>{item.label}</span>
            {!item.enabled && (
              <span className="rounded-full bg-navy-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Yakında
              </span>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
