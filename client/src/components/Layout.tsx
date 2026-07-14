import { Bell } from "lucide-react";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Layout({ title, actions, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-navy-700 bg-navy-900 px-8">
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <div className="flex items-center gap-3">
            {actions}
            <button
              type="button"
              disabled
              aria-label="Bildirimler (yakında)"
              className="cursor-not-allowed rounded-lg p-2 text-slate-500"
            >
              <Bell size={18} strokeWidth={2} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
