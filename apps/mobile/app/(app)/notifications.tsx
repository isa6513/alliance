import { useCallback, useMemo } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import { router, RelativePathString } from "expo-router";
import {
  NotificationDto,
  notifsFindAll,
  notifsSetRead,
} from "@alliance/shared/client";
import {
  buildNotificationRenderItems,
  getNotificationTime,
  LikesBucket,
  NotificationRenderItem,
} from "@alliance/shared/lib/notificationBucketing";
import { usePostHog } from "posthog-react-native";
import Text from "../../components/system/Text";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LegendList } from "@legendapp/list";
import SwipeableNotification from "../../components/SwipeableNotification";
import { SimplePageTitle } from "../../components/system/SimplePageTitle";
import MobileLikesGroup from "../../components/LikesGroup";

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

export default function NotificationsScreen() {
  const posthog = usePostHog();
  const queryClient = useQueryClient();

  const {
    data: response,
    isPending,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifsFindAll(),
  });

  const notifications = useMemo(() => {
    if (!response?.data) return [];
    return response.data
      .sort(
        (a, b) =>
          getNotificationTime(b).getTime() - getNotificationTime(a).getTime()
      )
      .filter((notif) => getNotificationTime(notif).getTime() <= Date.now());
  }, [response]);

  const renderItems = useMemo(
    () => buildNotificationRenderItems(notifications),
    [notifications]
  );

  const markNotificationsRead = useCallback(
    (notificationIds: number[]) => {
      if (notificationIds.length === 0) {
        return;
      }

      const ids = new Set(notificationIds);
      const readAt = new Date().toISOString();
      queryClient.setQueryData(
        ["notifications"],
        (oldData: typeof response) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((notification) =>
              ids.has(notification.id)
                ? { ...notification, readAt }
                : notification
            ),
          };
        }
      );
    },
    [queryClient]
  );

  const handleMarkAsRead = useCallback(
    (notificationId: number) => {
      notifsSetRead({ path: { id: notificationId } });
      markNotificationsRead([notificationId]);
      posthog?.capture("notification_swiped_read", { notificationId });
    },
    [markNotificationsRead, posthog]
  );

  const handleMarkBucketAsRead = useCallback(
    (bucket: LikesBucket) => {
      const unreadLikes = bucket.likes.filter(
        (notification) => !notification.readAt
      );
      if (unreadLikes.length === 0) {
        return;
      }

      unreadLikes.forEach((notification) => {
        notifsSetRead({ path: { id: notification.id } });
      });
      markNotificationsRead(unreadLikes.map((notification) => notification.id));
    },
    [markNotificationsRead]
  );

  const handleNotificationPress = useCallback(
    (notification: NotificationDto) => {
      if (!notification.readAt) {
        notifsSetRead({ path: { id: notification.id } });
        markNotificationsRead([notification.id]);
      }

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
    [markNotificationsRead, posthog]
  );

  const renderNotification = useCallback(
    ({ item }: { item: NotificationRenderItem }) => {
      if (item.type === "likes-group") {
        return (
          <MobileLikesGroup
            key={item.key}
            bucket={item.bucket}
            onMarkBucketRead={handleMarkBucketAsRead}
            onPressNotification={handleNotificationPress}
          />
        );
      }

      return (
        <SwipeableNotification
          key={item.key}
          notification={item.notification}
          onPress={() => handleNotificationPress(item.notification)}
          onMarkRead={() => handleMarkAsRead(item.notification.id)}
        />
      );
    },
    [handleMarkAsRead, handleMarkBucketAsRead, handleNotificationPress]
  );

  // const header = useMemo(() => {

  return isPending ? (
    <View className="flex-1">
      <SimplePageTitle title="Notifications" />
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0D1B2A" />
      </View>
    </View>
  ) : error ? (
    <View className="flex-1">
      <SimplePageTitle title="Notifications" />
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-center text-red-500">{error.message}</Text>
      </View>
    </View>
  ) : renderItems.length === 0 ? (
    <View className="flex-1">
      <SimplePageTitle title="Notifications" />
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-zinc-500">You&apos;re all caught up.</Text>
      </View>
    </View>
  ) : (
    <View className="flex-1 bg-white" testID="vr-notifications-ready">
      <LegendList
        ListHeaderComponent={<SimplePageTitle title="Notifications" />}
        data={renderItems}
        keyExtractor={(item) => item.key}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        recycleItems
        renderItem={renderNotification}
        contentContainerStyle={{
          paddingBottom: 40,
          backgroundColor: "white",
        }}
      />
    </View>
  );
}
