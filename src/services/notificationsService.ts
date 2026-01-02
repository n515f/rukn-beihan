// src/services/notificationsService.ts
// Notifications service - now connected to PHP REST API (XAMPP)
// Uses shared apiRequest from src/services/api.ts

import { apiRequest, ApiOkResponse } from "./api";

export interface Notification {
  id: string;
  type: "order" | "promotion" | "info";
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: string;
  read: boolean;
}

/**
 * Backend notification shape (PHP API)
 * notifications/list.php returns:
 * { success: true, notifications: [{ id, user_id, title_en, title_ar, message_en, message_ar, is_read, created_at }] }
 */
type ApiNotification = {
  id: number;
  user_id?: number | null;
  title_en: string;
  title_ar: string;
  message_en?: string | null;
  message_ar?: string | null;
  is_read: boolean | number;
  created_at: string;
  // optional future field:
  type?: "order" | "promotion" | "info" | null;
};

type ApiNotificationsListResponse = {
  success: boolean;
  notifications: ApiNotification[];
};

function mapApiNotification(n: ApiNotification): Notification {
  const read = Boolean(n.is_read);

  // If backend doesn't provide type, default to "info"
  const type: Notification["type"] =
    n.type === "order" || n.type === "promotion" || n.type === "info"
      ? n.type
      : "info";

  return {
    id: String(n.id),
    type,
    title: n.title_en,
    titleAr: n.title_ar,
    message: n.message_en ?? "",
    messageAr: n.message_ar ?? "",
    timestamp: n.created_at,
    read,
  };
}

/**
 * Get notifications for a specific user (recommended).
 * If you don't pass userId, it will still work (depending on backend behavior).
 */
export const getNotifications = async (userId?: string): Promise<Notification[]> => {
  const path = userId
    ? `/notifications/list.php?user_id=${encodeURIComponent(userId)}`
    : "/notifications/list.php";

  const data = await apiRequest<ApiNotificationsListResponse>(path);
  return (data.notifications ?? []).map(mapApiNotification);
};

export const markAsRead = async (notificationId: string): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/notifications/mark-read.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(notificationId) }),
  });

  return true;
};

export const getUnreadCount = async (userId?: string): Promise<number> => {
  const notifications = await getNotifications(userId);
  return notifications.filter((n) => !n.read).length;
};

export const createNotification = async (payload: {
  userId?: string | number | null;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  type?: "order" | "promotion" | "info";
}): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/notifications/create.php", {
    method: "POST",
    body: JSON.stringify({
      user_id: payload.userId != null ? Number(payload.userId) : null,
      title_en: payload.titleEn,
      title_ar: payload.titleAr,
      message_en: payload.messageEn,
      message_ar: payload.messageAr,
      type: payload.type ?? "info",
    }),
  });
  return true;
};

export const createBulkNotification = async (payload: {
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  type?: "order" | "promotion" | "info";
}): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/notifications/bulk-create.php", {
    method: "POST",
    body: JSON.stringify({
      title_en: payload.titleEn,
      title_ar: payload.titleAr,
      message_en: payload.messageEn,
      message_ar: payload.messageAr,
      type: payload.type ?? "info",
    }),
  });
  return true;
};
