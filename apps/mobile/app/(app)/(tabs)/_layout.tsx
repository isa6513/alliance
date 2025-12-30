import { Tabs } from "expo-router";
import { View } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
import { faList } from "@fortawesome/free-solid-svg-icons/faList";
import { faComments } from "@fortawesome/free-solid-svg-icons/faComments";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { colors } from "../../../lib/style/colors";
import {
  Home,
  Layers,
  ListTodo,
  MessagesSquare,
  User,
} from "lucide-react-native";

export default function TabLayout() {
  const iconSize = 24;
  return (
    <View
      style={{
        position: "absolute",
        backgroundColor: colors.page,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 20,
      }}
    >
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "white",
            justifyContent: "center",
            height: 70,
            paddingTop: 10,
          },
          tabBarItemStyle: {
            alignItems: "center",
          },
          tabBarInactiveTintColor: "#aaa",
          tabBarActiveTintColor: colors.green,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: "Home",
            tabBarIcon: ({ color }) => (
              <ListTodo size={iconSize} color={color} />
            ),
            tabBarShowLabel: false,
          }}
        />
        <Tabs.Screen
          name="actions"
          options={{
            headerShown: false,
            title: "Actions",
            tabBarIcon: ({ color }) => <Layers size={iconSize} color={color} />,
            tabBarShowLabel: false,
          }}
        />
        <Tabs.Screen
          name="forum"
          options={{
            headerShown: false,
            title: "Forum",
            tabBarIcon: ({ color }) => (
              <MessagesSquare size={iconSize} color={color} />
            ),
            tabBarShowLabel: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            title: "Profile",
            tabBarIcon: ({ color }) => <User size={iconSize} color={color} />,
            tabBarShowLabel: false,
          }}
        />
      </Tabs>
    </View>
  );
}
