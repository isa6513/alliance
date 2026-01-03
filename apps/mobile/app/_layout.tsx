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
import { PostHogProvider } from "posthog-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  useFonts({
    SourceSans3: require("../assets/fonts/SourceSans3.ttf"),
    LibreBaskerville: require("../assets/fonts/LibreBaskerville.ttf"),
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
