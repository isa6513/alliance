import { Slot } from "expo-router";
import { AuthProvider } from "../lib/AuthContext";
import { Platform } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { client } from "@alliance/shared/client/client.gen";
import WebTokenStore from "../lib/ExpoWebTokenStore";
import SecureStorage from "../lib/SecureStorage";
import { getApiUrl } from "../lib/config";
import { useFonts } from "expo-font";
import "../global.css";
import { PostHogProvider } from "posthog-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
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
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export default function RootLayout() {
  useFonts({
    SourceSans3: require("../assets/fonts/SourceSans3.ttf"),
    LibreBaskerville: require("../assets/fonts/LibreBaskerville.ttf"),
    "LibreBaskerville-Bold": require("../assets/fonts/LibreBaskerville-Bold.ttf"),
    "LibreBaskerville-SemiBold": require("../assets/fonts/LibreBaskerville-SemiBold.ttf"),
    "IBMPlexSans-Medium": require("../assets/fonts/IBMPlexSans-Medium.ttf"),
    "IBMPlexSans-Bold": require("../assets/fonts/IBMPlexSans-Bold.ttf"),
  });
  useEffect(() => {
    client.setConfig({
      baseUrl: getApiUrl(),
    });
  }, []);

  const tokenStore = useMemo(() => {
    if (Platform.OS === "web") {
      return WebTokenStore;
    }
    return SecureStorage;
  }, []);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  if (Platform.OS === "web") {
    return (
      <AuthProvider tokenStore={tokenStore}>
        <Slot />
      </AuthProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider apiKey="phc_4Bkir1Px9qIRnMQfMWQPcGIq6wjodf9jtme8fty3ZLt">
        <AuthProvider tokenStore={tokenStore}>
          <Slot />
        </AuthProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}
