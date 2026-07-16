import * as signalR from "@microsoft/signalr";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NOTIFICATIONS_HUB_URL, getNotifications, markAllNotificationsRead, markNotificationRead } from "../lib/api";
import { getToken } from "../lib/auth";
import type { Notification } from "../types/notification";
import { NotificationToasts } from "./NotificationToasts";

const TOAST_DURATION_MS = 6000;

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  toasts: Notification[];
  dismissToast: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

// Mounted once inside ProtectedRoute (which persists across page navigation, unlike Layout,
// which remounts on every route change) so the SignalR connection is established a single time
// per authenticated session rather than reconnecting on every click.
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    getNotifications()
      .then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(() => {
        // Silent: the bell just stays empty until the next successful fetch or a live push.
      });

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(NOTIFICATIONS_HUB_URL, { accessTokenFactory: () => getToken() ?? "" })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNotification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      if (notification.severity === "critical") {
        setToasts((prev) => [...prev, notification]);
      }
    });

    connection.start().catch(() => {
      // Silent: the app still works via polling-on-navigation; live updates just won't arrive.
    });
    connectionRef.current = connection;

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  const markAsRead = useCallback(async (id: number) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, toasts, dismissToast }}
    >
      {children}
      <NotificationToasts />
    </NotificationContext.Provider>
  );
}
