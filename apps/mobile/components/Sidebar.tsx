import { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { usePathname, router, RelativePathString } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Bell,
  BookText,
  FileText,
  Globe,
  Layers,
  ListTodo,
  MessagesSquare,
  MessageSquare,
  Search,
  Settings,
  Users,
  X,
  User,
} from "lucide-react-native";
import { Text } from "./system";
import { colors } from "../lib/style/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.8;
const EDGE_WIDTH = 100;

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  matchPaths: string[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "",
    items: [
      { name: "Tasks", href: "/", icon: ListTodo, matchPaths: ["/", ""] },
      {
        name: "Notifications",
        href: "/notifications",
        icon: Bell,
        matchPaths: ["/notifications"],
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        name: "Actions",
        href: "/actions",
        icon: Layers,
        matchPaths: ["/actions", "/action"],
      },
      {
        name: "Information",
        href: "/information",
        icon: BookText,
        matchPaths: ["/information"],
      },
      {
        name: "Search",
        href: "/search",
        icon: Search,
        matchPaths: ["/search"],
      },
    ],
  },
  {
    title: "Social",
    items: [
      { name: "Activity", href: "/feed", icon: Globe, matchPaths: ["/feed"] },
      {
        name: "Forum",
        href: "/forum/forum",
        icon: MessagesSquare,
        matchPaths: ["/forum"],
      },
      { name: "Groups", href: "/groups", icon: Users, matchPaths: ["/groups"] },
      {
        name: "Messages",
        href: "/messages",
        icon: MessageSquare,
        matchPaths: ["/messages"],
      },
    ],
  },
  {
    title: "Profile",
    items: [
      {
        name: "Profile",
        href: "/profile",
        icon: User,
        matchPaths: ["/profile"],
      },
      {
        name: "Contract",
        href: "/contract",
        icon: FileText,
        matchPaths: ["/contract"],
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        matchPaths: ["/user", "/settings"],
      },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  children: React.ReactNode;
}

export default function Sidebar({
  isOpen,
  onClose,
  onOpen,
  children,
}: SidebarProps) {
  const pathname = usePathname();
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(isOpen ? 0 : -SIDEBAR_WIDTH, {
      duration: 250,
    });
    overlayOpacity.value = withTiming(isOpen ? 0.5 : 0, { duration: 250 });
  }, [isOpen, translateX, overlayOpacity]);

  const isActive = (matchPaths: string[]) => {
    return matchPaths.some((path) => {
      if (path === "/" || path === "") {
        return pathname === "/" || pathname === "";
      }
      return pathname.startsWith(path);
    });
  };

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href as RelativePathString);
  };

  // Edge swipe gesture to open
  const edgePanGesture = Gesture.Pan()
    .hitSlop({ left: EDGE_WIDTH })
    .activeOffsetX(5)
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = Math.min(0, -SIDEBAR_WIDTH + event.translationX);
        overlayOpacity.value = Math.min(
          0.5,
          (event.translationX / SIDEBAR_WIDTH) * 0.5
        );
      }
    })
    .onEnd((event) => {
      if (event.translationX > SIDEBAR_WIDTH * 0.3) {
        translateX.value = withTiming(0, { duration: 150 });
        overlayOpacity.value = withTiming(0.5, { duration: 150 });
        runOnJS(onOpen)();
      } else {
        translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 150 });
        overlayOpacity.value = withTiming(0, { duration: 150 });
      }
    });

  // Swipe gesture to close
  const closePanGesture = Gesture.Pan()
    .activeOffsetX(-10)
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(-SIDEBAR_WIDTH, event.translationX);
        overlayOpacity.value = Math.max(
          0,
          0.5 + (event.translationX / SIDEBAR_WIDTH) * 0.5
        );
      }
    })
    .onEnd((event) => {
      if (event.translationX < -SIDEBAR_WIDTH * 0.3) {
        translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 150 });
        overlayOpacity.value = withTiming(0, { duration: 150 });
        runOnJS(onClose)();
      } else {
        translateX.value = withTiming(0, { duration: 150 });
        overlayOpacity.value = withTiming(0.5, { duration: 150 });
      }
    });

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: overlayOpacity.value > 0 ? "auto" : "none",
  }));

  return (
    <>
      {/* Main content with edge swipe gesture */}
      <GestureDetector gesture={edgePanGesture}>
        <View className="flex-1">{children}</View>
      </GestureDetector>

      {/* Overlay */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "black",
            zIndex: 45,
          },
          overlayStyle,
        ]}
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* Sidebar */}
      <GestureDetector gesture={closePanGesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: SIDEBAR_WIDTH,
              backgroundColor: "#fafafa",
              zIndex: 50,
              elevation: 10,
            },
            sidebarStyle,
          ]}
        >
          <ScrollView className="flex-1 pt-12">
            {/* Close button */}
            <View className="flex-row justify-end px-4 mb-4">
              <TouchableOpacity onPress={onClose} className="p-2">
                <X size={24} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Logo */}
            <TouchableOpacity
              onPress={() => handleNavigate("/")}
              className="px-6 mb-8"
            >
              <Text className="font-serif text-xl uppercase font-bold">
                The Alliance
              </Text>
            </TouchableOpacity>

            {/* Navigation sections */}
            <View className="px-4">
              {navSections.map((section, sectionIndex) => (
                <View
                  key={section.title || `section-${sectionIndex}`}
                  className={`pb-4 mb-2 ${
                    sectionIndex < navSections.length - 1
                      ? "border-b border-zinc-200"
                      : ""
                  }`}
                >
                  {section.items.map((item) => {
                    const active = isActive(item.matchPaths);
                    const Icon = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.name}
                        onPress={() => handleNavigate(item.href)}
                        className={`flex-row items-center px-3 py-2.5 rounded-lg mb-0.5 ${
                          active ? "bg-zinc-200" : ""
                        }`}
                        activeOpacity={0.7}
                      >
                        <Icon
                          size={18}
                          color={active ? colors.green : "#52525b"}
                        />
                        <Text
                          className={`ml-3 ${
                            active ? "font-medium" : "text-zinc-900"
                          }`}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </>
  );
}
