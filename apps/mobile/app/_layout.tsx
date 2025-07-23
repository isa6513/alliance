import { Slot } from "expo-router";
import { AuthProvider } from "../lib/AuthContext";
import { Platform } from "react-native";
import { useEffect, useMemo } from "react";
import { client } from "@alliance/shared/client/client.gen";
import WebTokenStore from "../lib/ExpoWebTokenStore";
import SecureStorage from "../lib/SecureStorage";
import { getApiUrl } from "../lib/config";
import { useFonts } from "expo-font";

export default function RootLayout() {
  useFonts({
    "IBMPlexSans-Regular": require("../assets/fonts/IBMPlexSans-Regular.ttf"),
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

  return (
    <AuthProvider tokenStore={tokenStore}>
      <Slot />
    </AuthProvider>
  );
}
