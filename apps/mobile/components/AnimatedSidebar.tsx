import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { usePathname } from "expo-router";
import { useAppDrawer } from "../lib/AppDrawerContext";
import Sidebar from "./Sidebar";
import { useEffect } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.round(SCREEN_WIDTH * 0.8);
const EDGE_WIDTH = 30;

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

const SPRING_CONFIG = { duration: 300, dampingRatio: 0.8 };

export default function AnimatedSidebar() {
  const { isOpen, openDrawer, closeDrawer } = useAppDrawer();
  const pathname = usePathname();
  const translateX = useSharedValue(-SIDEBAR_WIDTH);

  const isBasePage = BASE_PATHS.includes(pathname);

  // Sync animation with context state
  useEffect(() => {
    translateX.value = withSpring(
      isOpen ? 0 : -SIDEBAR_WIDTH,
      SPRING_CONFIG,
    );
  }, [isOpen]);

  // Edge swipe gesture to open sidebar
  const openGesture = Gesture.Pan()
    .activeOffsetX(10)
    .failOffsetX(-5)
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      translateX.value = Math.min(0, -SIDEBAR_WIDTH + event.translationX);
    })
    .onEnd((event) => {
      if (event.translationX > SIDEBAR_WIDTH / 3) {
        translateX.value = withSpring(0, SPRING_CONFIG);
        runOnJS(openDrawer)();
      } else {
        translateX.value = withSpring(-SIDEBAR_WIDTH, SPRING_CONFIG);
      }
    });

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SIDEBAR_WIDTH, 0],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0, 0, 0, 0.3)" },
          backdropStyle,
        ]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
      </Animated.View>

      {/* Sidebar panel */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: SIDEBAR_WIDTH,
            backgroundColor: "#ffffff",
          },
          sidebarStyle,
        ]}
      >
        <Sidebar />
      </Animated.View>

      {/* Edge gesture catcher — only mounted when closed and on a base page */}
      {!isOpen && isBasePage && (
        <GestureDetector gesture={openGesture}>
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: EDGE_WIDTH,
            }}
            collapsable={false}
          />
        </GestureDetector>
      )}
    </View>
  );
}
