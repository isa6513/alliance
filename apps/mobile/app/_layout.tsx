import { Slot } from "expo-router";
import { AuthProvider } from "../lib/AuthContext";
import { Platform } from "react-native";
import { useEffect, useMemo } from "react";
import { client } from "@alliance/shared/client/client.gen";
import WebTokenStore from "../lib/ExpoWebTokenStore";
import SecureStorage from "../lib/SecureStorage";
import { getApiUrl } from "../lib/config";
import { useFonts } from "expo-font";
import "../global.css";
import { PostHogOptions, PostHogProvider } from "posthog-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as Notifications from "expo-notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authRefreshTokens } from "@alliance/shared/client";
import PushNotificationResponseHandler from "../components/PushNotificationResponseHandler";
import DeviceRegistration from "../components/DeviceRegistration";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
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

const options: Partial<PostHogOptions> = {
  enableSessionReplay: true,
  captureAppLifecycleEvents: true,
  sessionReplayConfig: {
    maskAllTextInputs: false,
  },
};

export default function RootLayout() {
  useFonts({
    SourceSans3: require("../assets/fonts/SourceSans3.ttf"),
    LibreBaskerville: require("../assets/fonts/LibreBaskerville.ttf"),
    "LibreBaskerville-Bold": require("../assets/fonts/LibreBaskerville-Bold.ttf"),
    "LibreBaskerville-SemiBold": require("../assets/fonts/LibreBaskerville-SemiBold.ttf"),
    Berlingske: require("../assets/fonts/BerlingskeSerif-Blk.ttf"),
  });
  useEffect(() => {
    const tokenStore = Platform.OS === "web" ? WebTokenStore : SecureStorage;
    const originalFetch = fetch.bind(globalThis);

    const wrappedFetch: typeof fetch = async (input, init) => {
      const req = new Request(input, init);
      const retryReq = req.clone();
      const res = await originalFetch(req);

      if (res.status !== 401 || req.url.includes("auth/refresh")) {
        return res;
      }

      const refreshToken = await tokenStore.getItem("refreshToken");
      if (!refreshToken) return res;

      const refreshRes = await authRefreshTokens({
        query: { mode: "header" },
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      if (refreshRes.response.ok && refreshRes.data?.access_token) {
        await tokenStore.setItem("accessToken", refreshRes.data.access_token);
        if (refreshRes.data.refresh_token) {
          await tokenStore.setItem(
            "refreshToken",
            refreshRes.data.refresh_token,
          );
        }
        client.setConfig({
          baseUrl: getApiUrl(),
          headers: { Authorization: `Bearer ${refreshRes.data.access_token}` },
          fetch: wrappedFetch,
          throwOnError: true,
        });
        const retryHeaders = new Headers(retryReq.headers);
        retryHeaders.set(
          "Authorization",
          `Bearer ${refreshRes.data.access_token}`,
        );
        return originalFetch(new Request(retryReq, { headers: retryHeaders }));
      }

      return res;
    };

    client.setConfig({
      baseUrl: getApiUrl(),
      fetch: wrappedFetch,
      throwOnError: true,
    });
  }, []);

  const tokenStore = useMemo(() => {
    if (Platform.OS === "web") {
      return WebTokenStore;
    }
    return SecureStorage;
  }, []);

  if (Platform.OS === "web") {
    return (
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <PostHogProvider
            apiKey="phc_4Bkir1Px9qIRnMQfMWQPcGIq6wjodf9jtme8fty3ZLt"
            options={options}
          >
            <AuthProvider tokenStore={tokenStore}>
              <DeviceRegistration />
              <PushNotificationResponseHandler queryClient={queryClient} />
              <Slot />
            </AuthProvider>
          </PostHogProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <PostHogProvider
              apiKey="phc_4Bkir1Px9qIRnMQfMWQPcGIq6wjodf9jtme8fty3ZLt"
              options={options}
            >
              <AuthProvider tokenStore={tokenStore}>
                <DeviceRegistration />
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
