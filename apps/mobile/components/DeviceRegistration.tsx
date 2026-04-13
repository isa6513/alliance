import { useEffect, useCallback } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { userRegisterDevice } from "@alliance/shared/client";
import { useAuth } from "../lib/AuthContext";
import { isVisualTestMode } from "../lib/visualTest";

function handleRegistrationError(errorMessage: string) {
  console.error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!",
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
      return;
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  }
}

export default function DeviceRegistration() {
  const { isAuthenticated } = useAuth();

  const registerToken = useCallback(async (token?: string) => {
    if (!token) {
      return;
    }
    try {
      const deviceId = await SecureStore.getItem("deviceId");
      const resp = await userRegisterDevice({
        body: {
          deviceType: Device.modelId ?? Device.modelName,
          expoPushToken: token,
          deviceId: deviceId ?? undefined,
        },
      });
      if (resp.data) {
        const id = resp.data.id;
        await SecureStore.setItemAsync("deviceId", id);
        await SecureStore.setItemAsync("registeredToken", token);
      }
    } catch (e) {
      console.error("push device registration failed", e);
    }
  }, []);

  useEffect(() => {
    if (isVisualTestMode || !isAuthenticated) {
      return;
    }

    registerForPushNotificationsAsync()
      .then((token) => registerToken(token))
      .catch((error: any) => console.error(error));
  }, [isAuthenticated, registerToken]);

  return null;
}
