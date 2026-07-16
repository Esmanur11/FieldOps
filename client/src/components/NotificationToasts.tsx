import { AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "./NotificationProvider";
import { notificationLink } from "../lib/notificationLink";

export function NotificationToasts() {
  const { toasts, dismissToast, markAsRead } = useNotifications();
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  async function handleClick(toastId: number, relatedEntityType: string | null, relatedEntityId: number | null) {
    dismissToast(toastId);
    await markAsRead(toastId);
    const link = notificationLink(relatedEntityType, relatedEntityId);
    if (link) {
      navigate(link);
    }
  }

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-navy-900 p-4 shadow-xl"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <button
            type="button"
            onClick={() => handleClick(toast.id, toast.relatedEntityType, toast.relatedEntityId)}
            className="flex-1 text-left text-sm text-slate-200 hover:text-white"
          >
            {toast.message}
          </button>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Kapat"
            className="shrink-0 text-slate-500 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
