import {
  NotificationDto,
  notifsClear,
  notifsFindAll,
  notifsSetRead,
  notifsSetReadAll,
} from "@alliance/shared/client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router";
import { formatDate } from "date-fns";

function getWebAppLocation(webAppLocation: string) {
  if (webAppLocation.startsWith("/")) {
    return webAppLocation;
  }
  return "/" + webAppLocation;
}

const NotificationsIcon = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    notifsFindAll().then(
      ({ data: notifications }: { data: NotificationDto[] | undefined }) => {
        if (notifications) {
          setNotifications(
            notifications.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
          );
          setUnreadCount(
            notifications.filter((notification) => !notification.read).length
          );
        }
      }
    );
  }, [isAuthenticated]);

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

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
      navigate(
        webAppLocation
          ? getWebAppLocation(webAppLocation)
          : window.location.pathname
      );
    },
    [navigate, notifications]
  );

  const handleMarkAllAsRead = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
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

  return (
    <div
      className={`${
        unreadCount > 0
          ? "bg-red-500 text-white"
          : "bg-white text-zinc-600 border-1 border-zinc-500"
      } w-7 h-7 rounded-full flex items-center justify-center cursor-pointer`}
      onClick={toggle}
    >
      <p className="text-sm">{unreadCount}</p>
      {isOpen && (
        <div className="absolute top-8 shadow-lg/5 right-0 bg-white rounded border border-zinc-200 p-4 min-w-[370px] space-y-2 max-h-[500px] overflow-y-auto cursor-default">
          <div className="flex flex-row border-b border-zinc-200 justify-end gap-x-8 pb-2">
            <a className="text-zinc-800" onClick={handleMarkAllAsRead}>
              Mark all as read
            </a>
            <a className="text-zinc-800" onClick={handleClearAll}>
              Clear
            </a>
          </div>
          {notifications.length === 0 && (
            <p className="text-zinc-500">No notifications</p>
          )}
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={handleNotifClick(
                notification.id,
                notification.webAppLocation
              )}
              className={`text-black hover:bg-zinc-100 p-2 rounded-md flex cursor-pointer flex-col ${
                !notification.read ? "bg-red-50" : ""
              }`}
            >
              <p className="text-gray-500 text-xs border-r border-zinc-200 pr-2">
                {formatDate(notification.updatedAt, "MM/dd/yyyy")}
              </p>
              {notification.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsIcon;
