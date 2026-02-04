import { View, ActivityIndicator, Dimensions } from "react-native";
import { Redirect, withLayoutContext } from "expo-router";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { useAuth } from "../../lib/AuthContext";
import TabBar from "../../components/TabBar";
import Sidebar from "../../components/Sidebar";
import { colors } from "../../lib/style/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.round(SCREEN_WIDTH * 0.8);

const { Navigator } = createDrawerNavigator();
const Drawer = withLayoutContext(Navigator);

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <View className="flex-1 bg-white">
      <Drawer
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: "front",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          drawerStyle: { width: DRAWER_WIDTH, backgroundColor: "#fafafa" },
        }}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="actions/index" />
        <Drawer.Screen name="actions/[id]/index" />
        <Drawer.Screen name="information" />
        <Drawer.Screen name="notifications" />
        <Drawer.Screen name="feed" />
        <Drawer.Screen name="forum/index" />
        <Drawer.Screen name="messages/index" />
        <Drawer.Screen name="contract" />
        <Drawer.Screen name="profile" />
        <Drawer.Screen name="settings" />
      </Drawer>
      <TabBar />
    </View>
  );
}
