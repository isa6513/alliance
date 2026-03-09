import { Slot } from "expo-router";
import { AuthProvider } from "../lib/AuthContext";
import { Platform } from "react-native";
import { useCallback, useEffect, useMemo } from "react";
import { client } from "@alliance/shared/client/client.gen";
import WebTokenStore from "../lib/ExpoWebTokenStore";
import SecureStorage from "../lib/SecureStorage";
import { getApiUrl } from "../lib/config";
import { useFonts } from "expo-font";
import "../global.css";
import { PostHogProvider } from "posthog-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isVisualTestMode } from "../lib/visualTest";
import { userRegisterDevice } from "@alliance/shared/client";
import PushNotificationResponseHandler from "../components/PushNotificationResponseHandler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

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

  if (Device.isDevice && Platform.OS !== "web") {
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
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
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
    Berlingske: require("../assets/fonts/BerlingskeSerif-Blk.ttf"),
  });
  useEffect(() => {
    client.setConfig({
      baseUrl: getApiUrl(),
      throwOnError: true,
    });
  }, []);

  const tokenStore = useMemo(() => {
    if (Platform.OS === "web") {
      return WebTokenStore;
    }
    return SecureStorage;
  }, []);

  const registerToken = useCallback(async (token?: string) => {
    if (!token) {
      return;
    }
    const deviceId = await SecureStore.getItem("deviceId");
    const registeredToken = await SecureStore.getItem("registeredToken");
    if (registeredToken === token) {
      return;
    }
    console.log("registering token: ", token);
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
  }, []);

  useEffect(() => {
    if (isVisualTestMode) {
      return;
    }

    //TODO: wait for auth
    registerForPushNotificationsAsync()
      .then((token) => registerToken(token))
      .catch((error: any) => console.error(`${error}`));
  }, [registerToken]);

  if (Platform.OS === "web") {
    return (
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <AuthProvider tokenStore={tokenStore}>
            <PushNotificationResponseHandler queryClient={queryClient} />
            <Slot />
          </AuthProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <PostHogProvider apiKey="phc_4Bkir1Px9qIRnMQfMWQPcGIq6wjodf9jtme8fty3ZLt">
              <AuthProvider tokenStore={tokenStore}>
                <PushNotificationResponseHandler queryClient={queryClient} />
                <Slot />
              </AuthProvider>
            </PostHogProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
