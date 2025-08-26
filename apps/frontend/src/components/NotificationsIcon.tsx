import {
  NotificationDto,
  notifsClear,
  notifsFindAll,
  notifsSetRead,
  notifsSetReadAll,
} from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { formatDate } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import notifBell from "../assets/notif-bell.svg";
import { useAuth } from "../lib/AuthContext";

function getWebAppLocation(webAppLocation: string) {
  if (webAppLocation.startsWith("/")) {
    return webAppLocation;
  }
  return "/" + webAppLocation;
}

const useOutsideClick = (onClickOutside: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref, onClickOutside]);

  return ref;
};

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

  const ref = useOutsideClick(() => setIsOpen(false));

  return (
    <div
      className={`${
        unreadCount > 0
          ? "bg-red-500 text-white"
          : "bg-white text-zinc-600 border-1 border-zinc-200"
      } w-12 h-8 rounded-full flex items-center justify-center cursor-pointer`}
      onClick={toggle}
      ref={ref}
    >
      <div className="flex items-center gap-x-0.5">
        <img
          src={notifBell}
          alt="Notifications"
          className="w-4 h-4"
          style={unreadCount > 0 ? { filter: "invert(1)" } : { opacity: 0.7 }}
        />
        <p className="text-sm">{unreadCount}</p>
      </div>
      {isOpen && (
        <div
          className="absolute top-[calc(100%-10px)] shadow-lg/5 right-5 bg-white rounded border border-zinc-200 p-4 min-w-[370px] space-y-2 max-h-[500px] overflow-y-auto cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row border-b border-zinc-200 justify-end gap-x-8 pb-2">
            <Button
              color={ButtonColor.Transparent}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
            <Button color={ButtonColor.Transparent} onClick={handleClearAll}>
              Clear
            </Button>
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
              <p className="text-gray-500 text-xs">
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
