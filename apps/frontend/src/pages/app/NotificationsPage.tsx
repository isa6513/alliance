import { useNotifications } from "@alliance/shared/lib/useNotifications";
import {
  buildNotificationRenderItems,
  getUnreadLikesCount,
  LikesBucket,
} from "@alliance/shared/lib/notificationBucketing";
import { NotificationDto, notifsSetRead } from "@alliance/shared/client";
import {
  getNotificationIdentityKey,
  getNotificationReadRequest,
} from "@alliance/shared/lib/notificationIdentity";
import List from "@alliance/sharedweb/ui/List";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import NotificationText from "./NotificationText";
import { useMemo, useState } from "react";
import { cn } from "@alliance/shared/styles/util";
import { Heart, ChevronDown, ChevronUp, CheckCheck } from "lucide-react";

const LikesGroup = ({
  bucket,
  handleNotifClick,
  onMarkAllRead,
}: {
  bucket: LikesBucket;
  handleNotifClick: (notification: NotificationDto) => () => void;
  onMarkAllRead: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const unreadCount = getUnreadLikesCount(bucket);

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex flex-row items-center justify-between p-4 cursor-pointer hover:bg-zinc-100",
          unreadCount > 0 ? "bg-red-50" : "bg-white"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-row items-center gap-x-2">
          <Heart className="text-zinc-500" size={16} />
          <span className="text-zinc-600">
            {unreadCount > 0
              ? `${unreadCount} new like${unreadCount !== 1 ? "s" : ""} `
              : `${bucket.likes.length} like${
                  bucket.likes.length !== 1 ? "s" : ""
                }`}
          </span>
          {expanded ? (
            <ChevronUp className="text-zinc-400" size={16} />
          ) : (
            <ChevronDown className="text-zinc-400" size={16} />
          )}
        </div>
        {unreadCount > 0 && (
          <button
            className="flex flex-row items-center gap-x-1 text-xs text-zinc-500 hover:text-zinc-700 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllRead();
            }}
          >
            <CheckCheck className="w-3 h-3" />
            Dismiss
          </button>
        )}
      </div>
      {expanded && (
        <div className="flex flex-col divide-y divide-zinc-200 border-t border-zinc-200">
          {bucket.likes.map((notification) => (
            <NotificationText
              key={getNotificationIdentityKey(notification)}
              notification={notification}
              handleNotifClick={handleNotifClick}
              className={cn(
                "hover:bg-zinc-100 px-4 py-3 pl-10 flex cursor-pointer flex-col gap-y-1",
                notification.readAt ? "bg-white" : "bg-red-50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NotificationsPage = () => {
  const {
    notifications,
    handleMarkAllAsRead,
    handleNotifClick,
    refreshNotifications,
  } = useNotifications();

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt
  ).length;

  const handleMarkBucketAsRead = (bucket: LikesBucket) => async () => {
    const unreadLikes = bucket.likes.filter((n) => !n.readAt);
    await Promise.all(
      unreadLikes.map((n) => notifsSetRead(getNotificationReadRequest(n)))
    );
    refreshNotifications();
  };

  const renderItems = useMemo(
    () => buildNotificationRenderItems(notifications),
    [notifications]
  );

  return (
    <CenterLayout>
      <div className="flex flex-col items-center w-[calc(min(650px,100%))] gap-y-6">
        <div className="w-full flex flex-row justify-between items-end">
          <h1 className="text-title">Notifications</h1>
          {unreadCount > 0 && (
            <Button color={ButtonColor.White} onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <List className="w-full">
          {renderItems.map((item) =>
            item.type === "likes-group" ? (
              <LikesGroup
                key={item.key}
                bucket={item.bucket}
                handleNotifClick={handleNotifClick}
                onMarkAllRead={handleMarkBucketAsRead(item.bucket)}
              />
            ) : (
              <NotificationText
                key={item.key}
                notification={item.notification}
                handleNotifClick={handleNotifClick}
                className={cn(
                  "hover:bg-zinc-100 p-4 flex cursor-pointer flex-col gap-y-2",
                  item.notification.readAt ? "bg-white" : "bg-red-50"
                )}
              />
            )
          )}
        </List>
      </div>
    </CenterLayout>
  );
};

export default NotificationsPage;
