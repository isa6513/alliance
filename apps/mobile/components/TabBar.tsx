import * as Haptics from "expo-haptics";
import { View, Pressable, Animated, useWindowDimensions } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { Bell, ListTodo, MessageSquare, Users } from "lucide-react-native";
import { colors } from "../lib/style/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo, useRef } from "react";
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
import {
  getJoinedConversations,
  getPendingInvites,
  useConversations,
} from "../lib/messages";
import { isPathActive } from "../lib/isPathActive";
import Text, { FontWeight } from "./system/Text";
import { cn } from "@alliance/shared/styles/util";
import { useAuth } from "../lib/AuthContext";

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
        className="relative items-center gap-0.5 pt-3 pb-1"
        style={{ transform: [{ scale }] }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function TabBar() {
  const { width: windowWidth } = useWindowDimensions();
  const compactTabBar = windowWidth <= 375;
  const iconSize = compactTabBar ? 22 : 26;
  const labelClass = compactTabBar ? "text-[9px]" : "text-[10px]";

  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { data: actions } = useActionsQuery();
  const { conversations } = useConversations(null);
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
  const unreadMessages = useMemo(() => {
    const joinedConversations = getJoinedConversations(conversations, user?.id) ?? [];
    const pendingInvites = getPendingInvites(conversations, user?.id) ?? [];

    const joinedUnreadCount = joinedConversations.reduce(
      (total, conversation) => total + (conversation.unreadCount ?? 0),
      0,
    );
    const pendingInviteCount = pendingInvites.reduce(
      (total, conversation) => total + Math.max(conversation.unreadCount ?? 0, 1),
      0,
    );

    return joinedUnreadCount + pendingInviteCount;
  }, [conversations, user?.id]);

  const tabBadgeCounts: Record<TabPaths, number> = {
    "/": uncompletedTaskCount,
    "/notifications": unreadNotifications,
    "/messages": unreadMessages,
    "/groups": 0,
  };

  return (
    <View
      className="flex-row bg-white border-t border-zinc-100 px-2"
      style={{
        paddingBottom: insets.bottom + (compactTabBar ? 10 : 0),
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
              size={iconSize}
              color={active ? colors.green : "#000"}
              strokeWidth={active ? 2.5 : 2}
            />
            <Text
              className={labelClass}
              style={{ color: active ? colors.green : colors.text.icon }}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
            {badgeCount > 0 && (
              <View
                className={cn(
                  "absolute rounded-full px-1 items-center justify-center",
                  compactTabBar
                    ? "top-1.5 ml-4 min-w-[18px] h-[18px]"
                    : "top-2 ml-5 min-w-5 h-5",
                )}
                style={{ backgroundColor: badgeBackgroundColor }}
              >
                <Text
                  className={cn(
                    "text-white",
                    compactTabBar ? "text-[9px]" : "text-[10px]",
                  )}
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
