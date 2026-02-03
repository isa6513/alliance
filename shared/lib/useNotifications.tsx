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
  notifsSetRead,
  notifsSetReadAll,
} from "@alliance/shared/client";
import { useNavigate } from "react-router";
import posthog from "posthog-js";

export function getWebAppLocation(webAppLocation: string) {
  return webAppLocation.startsWith("/") ? webAppLocation : "/" + webAppLocation;
}

interface NotificationsContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  handleNotifClick: (id: number, webAppLocation: string | null) => () => void;
  handleMarkAllAsRead: (e: React.MouseEvent) => void;
  handleClearAll: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(
  null
);

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  const refreshNotifications = useCallback(async () => {
    const { data } = await notifsFindAll();
    if (!data) return;

    const sorted = data
      .sort(
        (a, b) =>
          new Date(b.sendTime || b.createdAt).getTime() -
          new Date(a.sendTime || a.createdAt).getTime()
      )
      .filter((n) => new Date(n.sendTime).getTime() <= new Date().getTime());

    setNotifications(sorted);
    setUnreadCount(sorted.filter((n) => !n.readAt).length);
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleNotifClick = useCallback(
    (id: number, webAppLocation: string | null) => () => {
      notifsSetRead({ path: { id } });

      const clickedNotif = notifications.find((n) => n.id === id);
      const path = webAppLocation
        ? getWebAppLocation(webAppLocation)
        : window.location.pathname;

      posthog.capture("notification_clicked", {
        notificationId: id,
        category: clickedNotif?.category ?? "unknown category",
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
        return prev.map(
          (n) => (n.id === id ? { ...n, readAt } : n) satisfies NotificationDto
        );
      });
      setUnreadCount((prev) => Math.max(prev - 1, 0));

    },
    [navigate, notifications]
  );

  const handleMarkAllAsRead = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    notifsSetReadAll();
    const readAt = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt } satisfies NotificationDto))
    );
    setUnreadCount(0);

    posthog.capture("notifications_marked_all_as_read");
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        handleNotifClick,
        handleMarkAllAsRead,
        handleClearAll,
        refreshNotifications,
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
      "useNotifications must be used within NotificationsProvider"
    );
  }
  return ctx;
};
