import { View, ActivityIndicator, useWindowDimensions } from "react-native";
import { Redirect, Stack } from "expo-router";

import { useAuth } from "../../lib/AuthContext";
import { AppDrawerProvider, useAppDrawer } from "../../lib/AppDrawerContext";
import TabBar from "../../components/TabBar";
import Sidebar from "../../components/Sidebar";
import AnimatedSidebar from "../../components/AnimatedSidebar";
import { colors } from "../../lib/style/colors";
import { isVisualTestMode } from "../../lib/visualTest";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function AppContent() {
  const insets = useSafeAreaInsets();
  const { isPermanent } = useAppDrawer();

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {isPermanent && (
        <View
          style={{
            width: 280,
            borderRightWidth: 1,
            borderRightColor: colors.borderLight,
          }}
        >
          <Sidebar />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={({ navigation }) => ({
            headerShown: false,
            contentStyle: {
              paddingTop: insets.top,
              backgroundColor: "white",
            },
            ...(navigation.canGoBack()
              ? { animation: "default" as const, gestureEnabled: true }
              : { animation: "none" as const, gestureEnabled: false }),
          })}
        />
        <TabBar />
      </View>
      {!isPermanent && <AnimatedSidebar />}
    </View>
  );
}

export default function AppLayout() {
  const { isAuthenticated, isLoading, canConnectToServer } = useAuth();
  const dimensions = useWindowDimensions();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!isAuthenticated && canConnectToServer) {
    if (isVisualTestMode) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      );
    }
    return <Redirect href="/auth/login" />;
  }

  return (
    <AppDrawerProvider isPermanent={dimensions.width >= 1024}>
      <View className="flex-1" testID="vr-app-shell-ready">
        <AppContent />
      </View>
    </AppDrawerProvider>
  );
}
