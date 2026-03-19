import * as Haptics from "expo-haptics";
import { View, Text, Pressable, Animated } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { Bell, ListTodo, MessageSquare, Users } from "lucide-react-native";
import { colors } from "../lib/style/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRef } from "react";

const tabs = [
  {
    href: "/" as const,
    icon: ListTodo,
    label: "Tasks",
    matchPaths: ["/", ""],
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

function AnimatedTabButton({
  onPress,
  onPressIn,
  children,
}: {
  onPress: () => void;
  onPressIn?: () => void;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    onPressIn?.();
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 10,
      bounciness: 4,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={animateIn}
      onPressOut={animateOut}
      className="flex-1 items-center"
    >
      <Animated.View
        className="items-center gap-0.5 pt-3"
        style={{ transform: [{ scale }] }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

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
      className="flex-row bg-white border-t border-zinc-200 px-2"
      style={{ paddingBottom: insets.bottom }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.matchPaths);
        const Icon = tab.icon;
        return (
          <AnimatedTabButton
            key={tab.href}
            onPress={() => router.replace(tab.href)}
            onPressIn={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Icon
              size={26}
              color={active ? colors.green : colors.text.icon}
              strokeWidth={active ? 2.5 : 2}
            />
            <Text
              className="text-[10px]"
              style={{ color: active ? colors.green : colors.text.icon }}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </AnimatedTabButton>
        );
      })}
    </View>
  );
}
