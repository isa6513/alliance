import {
  NotificationDto,
  notifsClear,
  notifsFindAll,
  notifsSetRead,
  notifsSetReadAll,
} from "@alliance/shared/client";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

export function getWebAppLocation(webAppLocation: string) {
  if (webAppLocation.startsWith("/")) {
    return webAppLocation;
  }
  return "/" + webAppLocation;
}

export interface NotificationsHandlers {
  notifications: NotificationDto[];
  allNotifications: NotificationDto[];
  unreadCount: number;
  handleNotifClick: (id: number, webAppLocation: string | null) => () => void;
  handleMarkAllAsRead: (e: React.MouseEvent) => void;
  handleClearAll: () => void;
}

export function useNotifications(): NotificationsHandlers {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [allNotifications, setAllNotifications] = useState<NotificationDto[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    notifsFindAll().then(
      ({ data: notifications }: { data: NotificationDto[] | undefined }) => {
        if (notifications) {
          const sorted = notifications.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAllNotifications(sorted);
          setNotifications(
            sorted.filter((notification) => !notification.cleared)
          );
          setUnreadCount(
            notifications.filter(
              (notification) => !notification.read && !notification.cleared
            ).length
          );
        }
      }
    );
  }, [isAuthenticated]);

  const handleNotifClick = useCallback(
    (id: number, webAppLocation: string | null) => () => {
      notifsSetRead({ path: { id } });
      const newNotifications = notifications.map((notification) => ({
        ...notification,
        read: notification.id === id ? true : notification.read,
      }));
      setNotifications(newNotifications);
      setUnreadCount(
        newNotifications.filter((notification) => !notification.read).length
      );

      const clickedNotif = notifications.find((n) => n.id === id);
      if (clickedNotif?.category === "friend_request") {
        navigate(
          webAppLocation
            ? getWebAppLocation(webAppLocation)
            : window.location.pathname,
          {
            state: {
              openFriendRequest: true,
            },
          }
        );
      } else if (clickedNotif?.category === "friend_request_accepted") {
        navigate(
          webAppLocation
            ? getWebAppLocation(webAppLocation)
            : window.location.pathname,
          {
            state: {
              openFriends: true,
            },
          }
        );
      } else {
        navigate(
          webAppLocation
            ? getWebAppLocation(webAppLocation)
            : window.location.pathname
        );
      }
    },
    [navigate, notifications]
  );

  const handleMarkAllAsRead = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      notifsSetReadAll();
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      setUnreadCount(0);
    },
    [notifications]
  );

  const handleClearAll = useCallback(() => {
    notifsClear();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    allNotifications,
    unreadCount,
    handleNotifClick,
    handleMarkAllAsRead,
    handleClearAll,
  } satisfies NotificationsHandlers;
}
