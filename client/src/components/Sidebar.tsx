import {
  Building2,
  ClipboardCheck,
  LayoutDashboard,
  Package,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItem {
  label: string;
  icon: LucideIcon;
  to?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Sites", icon: Building2, to: "/sites" },
  { label: "Personnel", icon: Users, to: "/personnel" },
  { label: "Machines", icon: Truck, to: "/machines" },
  { label: "Materials", icon: Package, to: "/materials" },
  { label: "Audits", icon: ClipboardCheck },
];

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-navy-700 bg-navy-900">
      <div className="flex h-16 items-center gap-2 border-b border-navy-700 px-6">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
        <span className="text-lg font-semibold text-white">FieldOps</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) =>
          item.to ? (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500/10 text-brand-500"
                    : "text-slate-300 hover:bg-navy-800 hover:text-white"
                }`
              }
            >
              <item.icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ) : (
            <div
              key={item.label}
              className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-500"
            >
              <span className="flex items-center gap-2.5">
                <item.icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </span>
              <span className="rounded-full bg-navy-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Yakında
              </span>
            </div>
          ),
        )}
      </nav>
    </aside>
  );
}
