import * as Haptics from "expo-haptics";
import { View, Pressable, Animated } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { Bell, ListTodo, MessageSquare, Users } from "lucide-react-native";
import { colors } from "../lib/style/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useRef } from "react";
import { useActionsQuery } from "@alliance/shared/lib/actionsListPage";
import {
  getAwayStatus,
  showActionInSidebarList,
} from "@alliance/shared/lib/actionUtils";
import { useQuery } from "@tanstack/react-query";
import {
  notifsGetUnreadCount,
  userGetAwayRanges,
} from "@alliance/shared/client";
import { useMessagingUnread } from "../lib/messages";
import { isPathActive } from "../lib/isPathActive";
import Text, { FontWeight } from "./system/Text";

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
] as const;
type TabPaths = (typeof tabs)[number]["href"];

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
        className="relative items-center gap-0.5 pt-3"
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
  const { data: actions } = useActionsQuery();
  const {
    unread: unreadMessages,
    hasUpdates: messageHasUpdates,
    setUnread: setUnreadMessages,
    setHasUpdates: setMessageHasUpdates,
    refreshUnreadCount: refreshUnreadMessages,
  } = useMessagingUnread();
  const { data: awayRanges = [] } = useQuery({
    queryKey: ["awayRanges"],
    queryFn: () => userGetAwayRanges().then((response) => response.data ?? []),
  });
  const { data: unreadNotifications = 0 } = useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: () =>
      notifsGetUnreadCount().then((response) => response.data ?? 0),
  });

  const uncompletedTaskCount = useMemo(() => {
    if (!actions) {
      return 0;
    }

    const now = new Date();
    return actions.filter((action) =>
      showActionInSidebarList({
        ...action,
        awayStatus: getAwayStatus(action, awayRanges, now),
      }),
    ).length;
  }, [actions, awayRanges]);
  const isOnMessagesTab = pathname.startsWith("/messages");

  useEffect(() => {
    if (!isOnMessagesTab && messageHasUpdates) {
      refreshUnreadMessages();
    }
  }, [isOnMessagesTab, messageHasUpdates, refreshUnreadMessages]);

  useEffect(() => {
    if (!isOnMessagesTab) {
      return;
    }

    setUnreadMessages(0);
    setMessageHasUpdates(true);
  }, [isOnMessagesTab, setMessageHasUpdates, setUnreadMessages]);

  const tabBadgeCounts: Record<TabPaths, number> = {
    "/": uncompletedTaskCount,
    "/notifications": unreadNotifications,
    "/messages": isOnMessagesTab ? 0 : unreadMessages,
    "/groups": 0,
  };

  return (
    <View
      className="flex-row bg-white border-t px-2"
      style={{
        paddingBottom: insets.bottom,
        borderTopColor: colors.borderLight,
      }}
    >
      {tabs.map((tab) => {
        const active = isPathActive(pathname, tab.matchPaths);
        const Icon = tab.icon;
        const badgeCount = tabBadgeCounts[tab.href];
        const badgeBackgroundColor =
          tab.href === "/" ? colors.error : colors.text.icon;
        const badgeLabel =
          tab.href === "/notifications" && badgeCount > 99
            ? "99+"
            : badgeCount.toString();
        return (
          <AnimatedTabButton
            key={tab.href}
            onPress={() => router.dismissTo(tab.href)}
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
            {badgeCount > 0 && (
              <View
                className="absolute top-2 ml-5 rounded-full min-w-5 h-5 px-1 items-center justify-center"
                style={{ backgroundColor: badgeBackgroundColor }}
              >
                <Text
                  className="text-[10px] text-white"
                  weight={FontWeight.Semibold}
                >
                  {badgeLabel}
                </Text>
              </View>
            )}
          </AnimatedTabButton>
        );
      })}
    </View>
  );
}
