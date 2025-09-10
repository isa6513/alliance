import { useOutsideClick } from "@alliance/shared/lib/useOutsideClick";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import { formatDate } from "date-fns";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import notifBell from "../assets/notif-bell.svg";
import { useNotifications } from "../lib/useNotifications";
import ProfileImage from "./ProfileImage";

const NotificationsIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    handleMarkAllAsRead,
    handleClearAll,
    handleNotifClick,
  } = useNotifications();

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

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
          <div className="flex flex-row border-b border-zinc-200 justify-between">
            <Link
              to="/notifications"
              className="text-black hover:bg-zinc-100 p-2 rounded-md flex cursor-pointer flex-col text-sm font-medium"
            >
              See all
            </Link>
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
              <div className="flex flex-row items-center gap-x-2">
                {notification.associatedUser && (
                  <ProfileImage
                    pfp={notification.associatedUser.profilePicture}
                    size="small"
                  />
                )}
                {notification.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsIcon;
