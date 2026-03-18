import { useOutsideClick } from "@alliance/sharedweb/lib/useOutsideClick";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import { useCallback, useLayoutEffect, useState } from "react";
import { href, useNavigate } from "react-router";
import { useNotifications } from "@alliance/shared/lib/useNotifications";
import { cn } from "@alliance/shared/styles/util";
import { Bell } from "lucide-react";
import { NAV_BAR_ICON_HEIGHT } from "@alliance/shared/lib/constants";
import NotificationList from "./NotificationList";

const DROPDOWN_PREFERRED_WIDTH = 450;

const NotificationsIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<{
    left?: number;
    width?: number;
    top?: number;
  }>({});
  const ref = useOutsideClick(() => setIsOpen(false));
  const {
    notifications,
    unreadCount,
    handleMarkAllAsRead,
    handleClearAll,
    handleNotifClick,
    refreshNotifications,
  } = useNotifications();
  const navigate = useNavigate();
  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const left = Math.max(0, rect.right - DROPDOWN_PREFERRED_WIDTH);
      const width = Math.min(DROPDOWN_PREFERRED_WIDTH, rect.right - left);
      setDropdownStyle({
        left,
        width,
        top: rect.bottom + 4,
      });
    } else {
      setDropdownStyle({});
    }
  }, [isOpen, ref]);

  return (
    <div
      className={cn(
        "bg-grey-2 hover:bg-grey-3 text-black",
        "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer relative",
      )}
      onClick={toggle}
      ref={ref}
    >
      <div className="flex items-center gap-x-0.5">
        <Bell size={NAV_BAR_ICON_HEIGHT} fill="black" />
      </div>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5.5 h-5.5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
      {isOpen && (
        <div
          className="fixed shadow-lg/5 bg-white rounded p-4 space-y-2 max-h-[500px] overflow-y-auto cursor-default z-50"
          style={{
            left: dropdownStyle.left,
            width: dropdownStyle.width,
            top: dropdownStyle.top,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <p className="text-title-small text-black">Notifications</p>
            <div className="flex flex-row gap-x-1">
              <Button
                color={ButtonColor.Grey}
                size="mediumDynamic"
                onClick={() => navigate(href("/notifications"))}
              >
                See all
              </Button>
              <Button
                color={ButtonColor.Grey}
                size="mediumDynamic"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
              <Button
                color={ButtonColor.Grey}
                size="mediumDynamic"
                onClick={handleClearAll}
              >
                Clear
              </Button>
            </div>
          </div>
          {notifications.length === 0 ? (
            <p className="text-zinc-500 text-center py-2">No notifications</p>
          ) : (
            <NotificationList
              notifications={notifications}
              handleNotifClick={handleNotifClick}
              refreshNotifications={() => refreshNotifications({ limit: 20 })}
              listClassName="flex flex-col gap-y-8 divide-y divide-grey-2"
              inset={false}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsIcon;
