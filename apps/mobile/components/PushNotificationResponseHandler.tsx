import { NotificationDto, notifsSetRead } from "@alliance/shared/client";
import { QueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { RelativePathString, router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useAuth } from "../lib/AuthContext";
import { isVisualTestMode } from "../lib/visualTest";

type PushData = {
  screen?: string;
  notificationId?: number;
};

type NotificationsQueryData = {
  data?: NotificationDto[];
} & Record<string, unknown>;

type PendingNotificationAction = {
  notificationId?: number;
  screen?: string;
};

function getPushRoute(screen: string | undefined): RelativePathString | null {
  if (typeof screen !== "string" || screen.length === 0) {
    return null;
  }

  const normalized = screen.startsWith("/") ? screen : `/${screen}`;
  return normalized as RelativePathString;
}

function setNotificationReadOptimistically(
  notificationId: number,
  queryClient: QueryClient
) {
  const existingData =
    queryClient.getQueryData<NotificationsQueryData>(["notifications"]);

  if (!existingData?.data) {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    return;
  }

  const readAt = new Date().toISOString();
  let foundNotification = false;
  const nextData = existingData.data.map((notification) => {
    if (notification.id !== notificationId) {
      return notification;
    }

    foundNotification = true;
    return { ...notification, readAt };
  });

  if (!foundNotification) {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    return;
  }

  queryClient.setQueryData<NotificationsQueryData>(["notifications"], {
    ...existingData,
    data: nextData,
  });
}

export default function PushNotificationResponseHandler({
  queryClient,
}: {
  queryClient: QueryClient;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const pendingNotificationActionRef =
    useRef<PendingNotificationAction | null>(null);
  const authStateRef = useRef({ isAuthenticated, isLoading });
  const lastHandledResponseIdentifierRef = useRef<string | null>(null);
  const responseSub = useRef<Notifications.EventSubscription | null>(null);

  const markNotificationReadFromTap = useCallback(
    (notificationId: number) => {
      setNotificationReadOptimistically(notificationId, queryClient);

      void notifsSetRead({ path: { id: notificationId } }).catch((error) => {
        console.error(
          "failed to mark notification as read from push tap",
          error
        );
      });
    },
    [queryClient]
  );

  const handlePendingNotificationAction = useCallback(
    (pendingAction: PendingNotificationAction) => {
      if (pendingAction.notificationId) {
        markNotificationReadFromTap(pendingAction.notificationId);
      }

      const route = getPushRoute(pendingAction.screen);
      if (route) {
        router.push(route);
      }
    },
    [markNotificationReadFromTap]
  );

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse | null) => {
      if (!response) {
        return;
      }

      const responseIdentifier = response.notification.request.identifier;
      if (lastHandledResponseIdentifierRef.current === responseIdentifier) {
        return;
      }
      lastHandledResponseIdentifierRef.current = responseIdentifier;

      const data = response.notification.request.content.data as
        | PushData
        | undefined;
      const pendingAction: PendingNotificationAction = {
        notificationId:
          typeof data?.notificationId === "number"
            ? data.notificationId
            : undefined,
        screen: data?.screen,
      };

      const authState = authStateRef.current;
      if (authState.isLoading || !authState.isAuthenticated) {
        // Last tap wins while auth is unavailable.
        pendingNotificationActionRef.current = pendingAction;
        return;
      }

      handlePendingNotificationAction(pendingAction);
    },
    [handlePendingNotificationAction]
  );

  useEffect(() => {
    authStateRef.current = { isAuthenticated, isLoading };
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    const pendingAction = pendingNotificationActionRef.current;
    if (!pendingAction) {
      return;
    }

    pendingNotificationActionRef.current = null;
    handlePendingNotificationAction(pendingAction);
  }, [handlePendingNotificationAction, isAuthenticated, isLoading]);

  useEffect(() => {
    if (Platform.OS === "web" || isVisualTestMode) {
      return;
    }

    void Notifications.getLastNotificationResponseAsync().then(
      handleNotificationResponse
    );

    // Only tapped notification responses should mark reads, not delivered pushes.
    responseSub.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      responseSub.current?.remove();
    };
  }, [handleNotificationResponse]);

  return null;
}
