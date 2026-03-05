import { useNotifications } from "@alliance/shared/lib/useNotifications";
import { notifsSetRead, NotificationDto } from "@alliance/shared/client";
import List from "@alliance/sharedweb/ui/List";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import NotificationText from "./NotificationText";
import { useMemo, useState } from "react";
import { cn } from "@alliance/shared/styles/util";
import { Heart, ChevronDown, ChevronUp, CheckCheck } from "lucide-react";
import { formatDate } from "date-fns";

function getDayKey(date: Date): string {
  return formatDate(date, "yyyy-MM-dd");
}

type LikesBucket = {
  dayKey: string;
  time: number;
  likes: NotificationDto[];
};

const LikesGroup = ({
  bucket,
  handleNotifClick,
  onMarkAllRead,
}: {
  bucket: LikesBucket;
  handleNotifClick: (id: number, webAppLocation: string | null) => () => void;
  onMarkAllRead: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const unreadCount = bucket.likes.filter((n) => !n.readAt).length;

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
              key={notification.id}
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

type RenderItem =
  | { type: "notification"; data: NotificationDto; time: number }
  | { type: "likes-group"; bucket: LikesBucket; time: number };

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

  const { likesBuckets, other } = useMemo(() => {
    const bucketMap = new Map<string, LikesBucket>();
    const other: NotificationDto[] = [];

    for (const n of notifications) {
      if (n.category === "likes") {
        const date = new Date(n.sendTime || n.createdAt);
        const key = getDayKey(date);
        const existing = bucketMap.get(key);
        if (existing) {
          existing.likes.push(n);
          existing.time = Math.max(existing.time, date.getTime());
        } else {
          bucketMap.set(key, {
            dayKey: key,
            time: date.getTime(),
            likes: [n],
          });
        }
      } else {
        other.push(n);
      }
    }
    return { likesBuckets: Array.from(bucketMap.values()), other };
  }, [notifications]);

  const handleMarkBucketAsRead = (bucket: LikesBucket) => async () => {
    const unreadLikes = bucket.likes.filter((n) => !n.readAt);
    await Promise.all(
      unreadLikes.map((n) => notifsSetRead({ path: { id: n.id } }))
    );
    refreshNotifications();
  };

  // Merge other notifications and likes buckets into a single sorted list,
  // collapsing adjacent likes buckets and unwrapping single-like buckets
  const renderItems = useMemo(() => {
    const items: RenderItem[] = [];
    for (const n of other) {
      items.push({
        type: "notification",
        data: n,
        time: new Date(n.sendTime || n.createdAt).getTime(),
      });
    }
    for (const bucket of likesBuckets) {
      items.push({ type: "likes-group", bucket, time: bucket.time });
    }
    items.sort((a, b) => b.time - a.time);

    // Merge adjacent likes-group items into a single bucket
    const merged: RenderItem[] = [];
    for (const item of items) {
      const prev = merged[merged.length - 1];
      if (item.type === "likes-group" && prev?.type === "likes-group") {
        const combined: LikesBucket = {
          dayKey: prev.bucket.dayKey + "+" + item.bucket.dayKey,
          time: prev.bucket.time,
          likes: [...prev.bucket.likes, ...item.bucket.likes],
        };
        merged[merged.length - 1] = {
          type: "likes-group",
          bucket: combined,
          time: combined.time,
        };
      } else {
        merged.push(item);
      }
    }

    // Unwrap single-like buckets into regular notification items
    const final: RenderItem[] = [];
    for (const item of merged) {
      if (item.type === "likes-group" && item.bucket.likes.length === 1) {
        const n = item.bucket.likes[0];
        final.push({
          type: "notification",
          data: n,
          time: new Date(n.sendTime || n.createdAt).getTime(),
        });
      } else {
        final.push(item);
      }
    }
    return final;
  }, [other, likesBuckets]);

  return (
    <CenterLayout>
      <div className="flex flex-col items-center w-[calc(min(650px,100%))] gap-y-6">
        <div className="w-full flex flex-row justify-between items-end">
          <h2 className="!font-semibold font-serif !text-3xl md:!text-4xl">
            Notifications
          </h2>

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
                key={`likes-${item.bucket.dayKey}`}
                bucket={item.bucket}
                handleNotifClick={handleNotifClick}
                onMarkAllRead={handleMarkBucketAsRead(item.bucket)}
              />
            ) : (
              <NotificationText
                key={item.data.id}
                notification={item.data}
                handleNotifClick={handleNotifClick}
                className={cn(
                  "hover:bg-zinc-100 p-4 flex cursor-pointer flex-col gap-y-2",
                  item.data.readAt ? "bg-white" : "bg-red-50"
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
