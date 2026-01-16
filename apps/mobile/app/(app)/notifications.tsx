import { useCallback, useMemo } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import { router, RelativePathString } from "expo-router";
import {
  NotificationDto,
  notifsFindAll,
  notifsSetRead,
  notifsSetReadAll,
} from "@alliance/shared/client";
import { usePostHog } from "posthog-react-native";
import Button, {
  ButtonColor,
  ButtonSize,
} from "../../components/system/Button";
import Text from "../../components/system/Text";
import GreenHeader from "../../components/GreenHeader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LegendList } from "@legendapp/list";
import SwipeableNotification, {
  getNotifTime,
} from "../../components/SwipeableNotification";

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
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifsFindAll(),
  });

  const notifications = useMemo(() => {
    if (!response?.data) return [];
    return response.data
      .sort((a, b) => getNotifTime(b).getTime() - getNotifTime(a).getTime())
      .filter((notif) => getNotifTime(notif).getTime() <= Date.now());
  }, [response]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications]
  );

  const handleMarkAsRead = useCallback(
    (notificationId: number) => {
      notifsSetRead({ path: { id: notificationId } });
      const readAt = new Date().toISOString();
      queryClient.setQueryData(
        ["notifications"],
        (oldData: typeof response) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((n) =>
              n.id === notificationId ? { ...n, readAt } : n
            ),
          };
        }
      );
      posthog?.capture("notification_swiped_read", { notificationId });
    },
    [posthog, queryClient]
  );

  const handleMarkAllAsRead = useCallback(() => {
    notifsSetReadAll();
    const readAt = new Date().toISOString();
    queryClient.setQueryData(["notifications"], (oldData: typeof response) => {
      if (!oldData?.data) return oldData;
      return {
        ...oldData,
        data: oldData.data.map((n) => ({ ...n, readAt })),
      };
    });
    posthog?.capture("notifications_marked_all_as_read");
  }, [posthog, queryClient]);

  const handleNotificationPress = useCallback(
    (notification: NotificationDto) => {
      if (!notification.readAt) {
        notifsSetRead({ path: { id: notification.id } });
        const readAt = new Date().toISOString();
        queryClient.setQueryData(
          ["notifications"],
          (oldData: typeof response) => {
            if (!oldData?.data) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((n) =>
                n.id === notification.id ? { ...n, readAt } : n
              ),
            };
          }
        );
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
    [posthog, queryClient]
  );

  const renderNotification = useCallback(
    ({ item: notification }: { item: NotificationDto }) => {
      return (
        <SwipeableNotification
          key={notification.id}
          notification={notification}
          onPress={() => handleNotificationPress(notification)}
          onMarkRead={() => handleMarkAsRead(notification.id)}
        />
      );
    },
    [handleNotificationPress, handleMarkAsRead]
  );

  return (
    <GreenHeader>
      {isPending ? (
        <View className="flex-1">
          <View className="bg-green p-4 pt-12 pb-3 flex-row items-center justify-between">
            <Text className="text-white font-bold">Notifications</Text>
          </View>
          <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#0D1B2A" />
          </View>
        </View>
      ) : error ? (
        <View className="flex-1">
          <View className="bg-green p-4 pt-12 pb-3 flex-row items-center justify-between">
            <Text className="text-white font-bold">Notifications</Text>
          </View>
          <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-center text-red-500">{error.message}</Text>
          </View>
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1">
          <View className="bg-green p-4 pt-12 pb-3 flex-row items-center justify-between">
            <Text className="text-white font-bold">Notifications</Text>
          </View>
          <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-zinc-500">You&apos;re all caught up.</Text>
          </View>
        </View>
      ) : (
        <LegendList
          ListHeaderComponent={
            <View className="bg-green p-4 pt-12 pb-3 flex-row items-center justify-between">
              <Text className="text-white font-bold">Notifications</Text>
              {unreadCount > 0 && (
                <Button
                  color={ButtonColor.White}
                  size={ButtonSize.Small}
                  onPress={handleMarkAllAsRead}
                  title="Mark all as read"
                />
              )}
            </View>
          }
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={isPending} onRefresh={refetch} />
          }
          recycleItems
          renderItem={renderNotification}
          contentContainerStyle={{
            paddingBottom: 40,
            backgroundColor: "white",
          }}
        />
      )}
    </GreenHeader>
  );
}
