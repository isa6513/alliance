import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { router, RelativePathString } from "expo-router";
import {
  NotificationDto,
  notifsFindAll,
  notifsSetRead,
  notifsSetReadAll,
} from "@alliance/shared/client";
import { usePostHog } from "posthog-react-native";
import {
  Button,
  ButtonColor,
  ButtonSize,
  Text,
  colors,
} from "../../components/system";
import { formatTime } from "@alliance/shared/lib/utils";
import ProfileImage from "../../components/ProfileImage";

const normalizeLocation = (location: string | null) => {
  if (!location) return null;
  const normalized = location.startsWith("/") ? location : `/${location}`;
  const [path, query] = normalized.split("?");
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "tasks") {
    return "/";
  }

  return query ? `${path}?${query}` : path;
};

const getNotifTime = (notification: NotificationDto) => {
  return new Date(notification.sendTime || notification.createdAt);
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const posthog = usePostHog();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notifsFindAll();
      if (response.error) {
        throw new Error("Failed to fetch notifications");
      }
      const sorted = (response.data || [])
        .sort((a, b) => getNotifTime(b).getTime() - getNotifTime(a).getTime())
        .filter((notif) => getNotifTime(notif).getTime() <= Date.now());
      setNotifications(sorted);
      setError(null);
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleMarkAllAsRead = useCallback(() => {
    notifsSetReadAll();
    const readAt = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt })));
    posthog?.capture("notifications_marked_all_as_read");
  }, [posthog]);

  const handleNotificationPress = useCallback(
    (notification: NotificationDto) => {
      notifsSetRead({ path: { id: notification.id } });
      const readAt = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, readAt } : n))
      );

      const destination = normalizeLocation(
        notification.mobileAppLocation ?? notification.webAppLocation
      );

      posthog?.capture("notification_clicked", {
        notificationId: notification.id,
        category: notification.category ?? "unknown category",
        webAppLocation: destination ?? "",
      });

      if (destination) {
        router.push(destination as RelativePathString);
      }
    },
    [posthog]
  );

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View className="px-4 pt-6 pb-10 gap-y-4">
        <View className="flex-row items-end justify-between gap-x-3">
          <Text className="text-2xl font-semibold text-zinc-900">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Button
              color={ButtonColor.White}
              size={ButtonSize.Small}
              onPress={handleMarkAllAsRead}
              title="Mark all as read"
            />
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.green} />
        ) : error ? (
          <View className="bg-red-50 border border-red-200 rounded p-4">
            <Text className="text-red-600">{error}</Text>
            <Button
              className="mt-3"
              color={ButtonColor.Light}
              size={ButtonSize.Small}
              onPress={fetchNotifications}
              title="Retry"
            />
          </View>
        ) : notifications.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-zinc-500">You&apos;re all caught up.</Text>
          </View>
        ) : (
          <View className="rounded border border-zinc-200 overflow-hidden bg-white">
            {notifications.map((notification, index) => {
              const displayUsers = notification.associatedUsers.slice(0, 3);
              const remainingUsers =
                notification.associatedUsers.length - displayUsers.length;

              return (
                <TouchableOpacity
                  key={notification.id}
                  activeOpacity={0.75}
                  onPress={() => handleNotificationPress(notification)}
                  className={`px-4 py-3 ${
                    notification.readAt ? "bg-white" : "bg-red-50"
                  } ${index === 0 ? "" : "border-t border-zinc-200"}`}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center flex-wrap gap-x-1">
                      {displayUsers.map((user) => (
                        <ProfileImage
                          key={user.id}
                          pfp={user.profilePicture}
                          size="small"
                          className="mr-1 border border-white"
                        />
                      ))}
                      {remainingUsers > 0 && (
                        <Text className="text-xs text-zinc-500 mr-1">
                          +{remainingUsers}
                        </Text>
                      )}
                      <Text
                        className="text-base text-zinc-900 flex-1"
                        numberOfLines={2}
                      >
                        {notification.category === "action_update" && (
                          <Text className="font-semibold">Action update: </Text>
                        )}
                        {notification.message}
                      </Text>
                    </View>
                    <Text className="text-xs text-zinc-500 mt-1">
                      {formatTime(getNotifTime(notification), {
                        addSuffix: true,
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
