import { View, TouchableOpacity, Text } from "react-native";
import { usePathname, useRouter } from "expo-router";
import {
  Bell,
  Layers,
  ListTodo,
  MessageSquare,
  Users,
} from "lucide-react-native";
import { colors } from "../lib/style/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabs = [
  {
    href: "/" as const,
    icon: ListTodo,
    label: "Tasks",
    matchPaths: ["/", ""],
  },
  {
    href: "/actions" as const,
    icon: Layers,
    label: "Actions",
    matchPaths: ["/actions", "/action"],
  },
  {
    href: "/notifications" as const,
    icon: Bell,
    label: "Notifications",
    matchPaths: ["/notifications"],
  },
  {
    href: "/messages" as const,
    icon: MessageSquare,
    label: "Messages",
    matchPaths: ["/messages"],
  },
  {
    href: "/groups" as const,
    icon: Users,
    label: "Groups",
    matchPaths: ["/groups"],
  },
];

export default function TabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isActive = (matchPaths: string[]) => {
    return matchPaths.some((path) => {
      if (path === "/" || path === "") {
        return pathname === "/" || pathname === "";
      }
      return pathname.startsWith(path);
    });
  };

  return (
    <View
      className="flex-row bg-white border-t border-zinc-200 pt-3"
      style={{ paddingBottom: insets.bottom }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.matchPaths);
        const Icon = tab.icon;
        return (
          <TouchableOpacity
            key={tab.href}
            className="flex-1 items-center gap-0.5"
            onPress={() => {
              router.replace(tab.href);
            }}
            activeOpacity={0.7}
          >
            <Icon
              size={26}
              color={active ? colors.green : "#888"}
              strokeWidth={active ? 2.5 : 2}
            />
            <Text
              className="text-[10px]"
              style={{ color: active ? colors.green : "#888" }}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
