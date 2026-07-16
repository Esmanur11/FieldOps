import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "./NotificationProvider";
import { notificationLink } from "../lib/notificationLink";
import { getSeverityBadgeClasses } from "../lib/severityColor";
import type { Notification } from "../types/notification";

function formatTime(createdAt: string): string {
  return new Date(createdAt).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
    const link = notificationLink(notification.relatedEntityType, notification.relatedEntityId);
    if (link) {
      navigate(link);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Bildirimler"
        className="relative rounded-lg p-2 text-slate-400 hover:bg-navy-800 hover:text-white"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-xl border border-navy-700 bg-navy-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-navy-700 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Bildirimler</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-xs text-brand-500 hover:underline"
              >
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Henüz bildirim yok.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex w-full flex-col gap-1 border-b border-navy-800 px-4 py-3 text-left last:border-b-0 hover:bg-navy-800 ${
                    notification.isRead ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${getSeverityBadgeClasses(notification.severity)}`}
                    >
                      {notification.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">{formatTime(notification.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-200">{notification.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
