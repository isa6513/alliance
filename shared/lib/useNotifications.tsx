import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  NotificationDto,
  notifsFindAll,
  notifsGetUnreadCount,
  notifsSetRead,
  notifsSetReadAll,
  UnreadContentType,
} from "@alliance/shared/client";
import { useNavigate } from "react-router";
import posthog from "posthog-js";
import {
  getNotificationIdentityKey,
  getNotificationReadRequest,
} from "./notificationIdentity";

export function getWebAppLocation(webAppLocation: string) {
  return webAppLocation.startsWith("/") ? webAppLocation : "/" + webAppLocation;
}

interface NotificationsContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  handleNotifClick: (
    notification: Pick<
      NotificationDto,
      "id" | "sourceType" | "webAppLocation" | "category"
    >,
  ) => () => void;
  handleMarkAllAsRead: (e: React.MouseEvent) => void;
  refreshNotifications: (options?: { limit?: number }) => Promise<void>;
  applyNotificationsReadByContent: (
    contentType: UnreadContentType,
    contentIds: number[],
  ) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(
  null,
);

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  const refreshNotifications = useCallback(
    async (options?: { limit?: number }) => {
      const limit = options?.limit;
      if (limit !== undefined) {
        const [{ data }, { data: unreadCountData }] = await Promise.all([
          notifsFindAll({ query: { limit } }),
          notifsGetUnreadCount(),
        ]);
        if (data) setNotifications(data);
        if (unreadCountData !== undefined) {
          setUnreadCount(unreadCountData.unreadCount);
        }
      } else {
        const { data } = await notifsFindAll();
        if (!data) return;
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.readAt).length);
      }
    },
    [],
  );

  useEffect(() => {
    refreshNotifications({ limit: 20 });
  }, [refreshNotifications]);

  const handleNotifClick = useCallback(
    (
      notification: Pick<
        NotificationDto,
        "id" | "sourceType" | "webAppLocation" | "category"
      >,
    ) =>
      () => {
        notifsSetRead(getNotificationReadRequest(notification));

        const clickedNotif = notifications.find(
          (n) =>
            getNotificationIdentityKey(n) ===
            getNotificationIdentityKey(notification),
        );
        const path = notification.webAppLocation
          ? getWebAppLocation(notification.webAppLocation)
          : window.location.pathname;

        posthog.capture("notification_clicked", {
          notificationId: notification.id,
          notificationSourceType:
            clickedNotif?.sourceType ?? notification.sourceType,
          category: clickedNotif?.category ?? notification.category,
          webAppLocation: path,
        });

        if (clickedNotif?.category === "friend_request") {
          navigate(path, { state: { openFriendRequest: true } });
        } else if (clickedNotif?.category === "friend_request_accepted") {
          navigate(path, { state: { openFriends: true } });
        } else {
          navigate(path);
        }

        setNotifications((prev) => {
          const readAt = new Date().toISOString();
          return prev.map((n) =>
            getNotificationIdentityKey(n) ===
            getNotificationIdentityKey(notification)
              ? ({ ...n, readAt } satisfies NotificationDto)
              : n,
          );
        });
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      },
    [navigate, notifications],
  );

  const handleMarkAllAsRead = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    notifsSetReadAll();
    const readAt = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt }) satisfies NotificationDto),
    );
    setUnreadCount(0);

    posthog.capture("notifications_marked_all_as_read");
  }, []);

  const applyNotificationsReadByContent = useCallback(
    (contentType: UnreadContentType, contentIds: number[]) => {
      if (contentIds.length === 0) {
        return;
      }

      const ids = new Set(contentIds);
      const markedCount = notifications.filter(
        (notification) =>
          !notification.readAt &&
          notification.contentType === contentType &&
          notification.contentId !== undefined &&
          ids.has(notification.contentId),
      ).length;

      if (markedCount === 0) {
        return;
      }

      const readAt = new Date().toISOString();

      setNotifications((prev) =>
        prev.map((notification) => {
          if (
            notification.readAt ||
            notification.contentType !== contentType ||
            notification.contentId === undefined ||
            !ids.has(notification.contentId)
          ) {
            return notification;
          }

          return { ...notification, readAt } satisfies NotificationDto;
        }),
      );
      setUnreadCount((prev) => Math.max(prev - markedCount, 0));
    },
    [notifications],
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        handleNotifClick,
        handleMarkAllAsRead,
        refreshNotifications,
        applyNotificationsReadByContent,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider",
    );
  }
  return ctx;
};

export const useOptionalNotifications = (): NotificationsContextType | null =>
  useContext(NotificationsContext);
