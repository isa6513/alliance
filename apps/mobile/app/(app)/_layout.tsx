import { View, Text, ActivityIndicator } from "react-native";
import { Redirect, Stack } from "expo-router";

import { useAuth } from "../../lib/AuthContext";
import TabBar from "../../components/TabBar";
import { colors } from "../../lib/style/colors";

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
    <View className="flex-1 bg-white pt-8">
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false, animation: "none" }}>
          <Stack.Screen name="tasks" />
          <Stack.Screen name="actions" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="action/[id]" />
          <Stack.Screen name="forum" />
          <Stack.Screen name="user" />
        </Stack>
      </View>
      <TabBar />
    </View>
  );
}
