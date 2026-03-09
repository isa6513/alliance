import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import {
  getNotificationTime,
  getUnreadLikesCount,
  LikesBucket,
} from "@alliance/shared/lib/notificationBucketing";
import { formatTime } from "@alliance/shared/lib/utils";
import { cn } from "@alliance/shared/styles/util";
import { NotificationDto } from "@alliance/shared/client";
import { CheckCheck, ChevronDown, ChevronUp, Heart } from "lucide-react-native";
import ProfileImage from "./ProfileImage";
import Text from "./system/Text";

interface LikesGroupProps {
  bucket: LikesBucket;
  onMarkBucketRead: (bucket: LikesBucket) => void;
  onPressNotification: (notification: NotificationDto) => void;
}

function LikesGroupNotification({
  notification,
  onPress,
}: {
  notification: NotificationDto;
  onPress: () => void;
}) {
  const displayUsers = notification.associatedUsers.slice(0, 3);
  const remainingUsers =
    notification.associatedUsers.length - displayUsers.length;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className={cn(
        "border-t border-zinc-200 px-6 py-4",
        notification.readAt ? "bg-white" : "bg-red-50"
      )}
    >
      <View className="flex-row items-center flex-wrap gap-x-1">
        {displayUsers.map((user) => (
          <ProfileImage key={user.id} pfp={user.profilePicture} size="small" />
        ))}
        {remainingUsers > 0 && (
          <Text className="mr-1 text-xs text-zinc-500">+{remainingUsers}</Text>
        )}
        <Text className="flex-1 text-base text-zinc-900" numberOfLines={2}>
          {notification.category === "action_update" && (
            <Text className="font-semibold">Action update: </Text>
          )}
          {notification.message}
        </Text>
      </View>
      <Text className="mt-1 text-xs text-zinc-500">
        {formatTime(getNotificationTime(notification), {
          addSuffix: true,
        })}
      </Text>
    </TouchableOpacity>
  );
}

export default function LikesGroup({
  bucket,
  onMarkBucketRead,
  onPressNotification,
}: LikesGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const unreadCount = getUnreadLikesCount(bucket);
  const likesLabel =
    unreadCount > 0
      ? `${unreadCount} new like${unreadCount === 1 ? "" : "s"}`
      : `${bucket.likes.length} like${bucket.likes.length === 1 ? "" : "s"}`;

  return (
    <View className="mx-px overflow-hidden border-t border-zinc-200">
      <View
        className={cn(
          "flex-row items-center justify-between px-6 py-4",
          unreadCount > 0 ? "bg-red-50" : "bg-white"
        )}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setExpanded((current) => !current)}
          className="mr-3 flex-1 flex-row items-center gap-x-2"
        >
          <Heart size={16} color="#71717a" />
          <Text className="text-zinc-600">{likesLabel}</Text>
          {expanded ? (
            <ChevronUp size={16} color="#a1a1aa" />
          ) : (
            <ChevronDown size={16} color="#a1a1aa" />
          )}
        </TouchableOpacity>

        {unreadCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onMarkBucketRead(bucket)}
            className="flex-row items-center gap-x-1"
          >
            <CheckCheck size={14} color="#71717a" />
            <Text className="text-xs text-zinc-500">Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>

      {expanded && (
        <View className="border-t border-zinc-200">
          {bucket.likes.map((notification) => (
            <LikesGroupNotification
              key={notification.id}
              notification={notification}
              onPress={() => onPressNotification(notification)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
