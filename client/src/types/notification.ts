export interface Notification {
  id: number;
  type: string;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  message: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}
