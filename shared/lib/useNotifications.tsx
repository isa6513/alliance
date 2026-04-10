import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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
  handleMarkAsRead: (
    notification: Pick<NotificationDto, "id" | "sourceType">,
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

  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const markNotificationRead = useCallback(
    (notification: Pick<NotificationDto, "id" | "sourceType">) => {
      notifsSetRead(getNotificationReadRequest(notification));
      setNotifications((prev) => {
        const key = getNotificationIdentityKey(notification);
        const readAt = new Date().toISOString();
        let wasUnread = false;
        const next = prev.map((n) => {
          if (getNotificationIdentityKey(n) === key) {
            if (!n.readAt) wasUnread = true;
            return { ...n, readAt } satisfies NotificationDto;
          }
          return n;
        });
        if (wasUnread) {
          setUnreadCount((c) => Math.max(c - 1, 0));
        }
        return next;
      });
    },
    [],
  );

  const handleNotifClick = useCallback(
    (
      notification: Pick<
        NotificationDto,
        "id" | "sourceType" | "webAppLocation" | "category"
      >,
    ) =>
      () => {
        const clickedNotif = notificationsRef.current.find(
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

        markNotificationRead(notification);

        posthog.capture("notification_read_via_click", {
          notificationId: notification.id,
          notificationSourceType:
            clickedNotif?.sourceType ?? notification.sourceType,
        });
      },
    [navigate, markNotificationRead],
  );

  const handleMarkAsRead = useCallback(
    (notification: Pick<NotificationDto, "id" | "sourceType">) => () => {
      posthog.capture("notification_marked_read", {
        notificationId: notification.id,
        notificationSourceType: notification.sourceType,
      });
      markNotificationRead(notification);
    },
    [markNotificationRead],
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
      const readAt = new Date().toISOString();

      setNotifications((prev) => {
        let markedCount = 0;
        const next = prev.map((notification) => {
          if (
            notification.readAt ||
            notification.contentType !== contentType ||
            notification.contentId === undefined ||
            !ids.has(notification.contentId)
          ) {
            return notification;
          }

          markedCount++;
          return { ...notification, readAt } satisfies NotificationDto;
        });

        if (markedCount > 0) {
          setUnreadCount((c) => Math.max(c - markedCount, 0));
        }

        return markedCount > 0 ? next : prev;
      });
    },
    [],
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        handleNotifClick,
        handleMarkAsRead,
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
