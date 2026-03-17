import {
  View,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { Redirect, usePathname, withLayoutContext } from "expo-router";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { useAuth } from "../../lib/AuthContext";
import TabBar from "../../components/TabBar";
import Sidebar from "../../components/Sidebar";
import { colors } from "../../lib/style/colors";
import { isVisualTestMode } from "../../lib/visualTest";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.round(SCREEN_WIDTH * 0.8);

const { Navigator } = createDrawerNavigator();
const Drawer = withLayoutContext(Navigator);

/** Routes where the drawer swipe gesture should be enabled (base/index pages). */
const BASE_PATHS = [
  "/",
  "/actions",
  "/information",
  "/search",
  "/notifications",
  "/feed",
  "/forum",
  "/invites",
  "/contract",
  "/profile",
  "/settings",
  "/groups",
  "/messages",
];

export default function AppLayout() {
  const { isAuthenticated, isLoading, canConnectToServer } = useAuth();
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const pathname = usePathname();

  const isBasePage = BASE_PATHS.includes(pathname);

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
    <View className="flex-1 " testID="vr-app-shell-ready">
      <Drawer
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: dimensions.width >= 1024 ? "permanent" : "slide",
          overlayColor: "rgba(0, 0, 0, 0.3)",
          drawerStyle: { width: DRAWER_WIDTH, backgroundColor: "#ffffff" },
          swipeEdgeWidth: 300,
          swipeMinDistance: 30,
          swipeEnabled: isBasePage,
          sceneStyle: { paddingTop: insets.top, backgroundColor: "white" },
        }}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="actions" />
        <Drawer.Screen name="information" />
        <Drawer.Screen name="search" />
        <Drawer.Screen name="notifications" />
        <Drawer.Screen name="feed" />
        <Drawer.Screen name="forum" />
        <Drawer.Screen name="invites" />
        <Drawer.Screen name="contract" />
        <Drawer.Screen name="profile" />
        <Drawer.Screen name="settings" />
        <Drawer.Screen name="groups" />
        <Drawer.Screen name="messages" />
        <Drawer.Screen name="member/[id]" />
      </Drawer>
      <TabBar />
    </View>
  );
}
