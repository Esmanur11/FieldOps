import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getAuth } from "../lib/auth";
import { NotificationBell } from "./NotificationBell";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Layout({ title, actions, children }: LayoutProps) {
  const navigate = useNavigate();
  const auth = getAuth();

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-navy-700 bg-navy-900 px-8">
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <div className="flex items-center gap-4">
            {actions}
            <NotificationBell />
            {auth && (
              <div className="flex items-center gap-3 border-l border-navy-700 pl-4">
                <div className="text-right leading-tight">
                  <p className="text-sm font-medium text-white">{auth.username}</p>
                  <p className="text-xs capitalize text-slate-400">{auth.role}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Çıkış yap"
                  title="Çıkış yap"
                  className="rounded-lg p-2 text-slate-400 hover:bg-navy-800 hover:text-white"
                >
                  <LogOut size={18} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
