import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useAppDrawer } from "../lib/AppDrawerContext";
import { useIsBasePage } from "../lib/useIsBasePage";
import Sidebar from "./Sidebar";
import { useEffect, useMemo } from "react";

const SIDEBAR_RATIO = 0.8;
const EDGE_WIDTH = 30;
const SPRING_CONFIG = { duration: 300, dampingRatio: 0.8 };

export default function AnimatedSidebar() {
  const { isOpen, openDrawer, closeDrawer } = useAppDrawer();
  const { width: screenWidth } = useWindowDimensions();
  const isBasePage = useIsBasePage();

  const sidebarWidth = useMemo(
    () => Math.round(screenWidth * SIDEBAR_RATIO),
    [screenWidth],
  );

  const translateX = useSharedValue(-sidebarWidth);

  // Keep shared value in sync when sidebarWidth changes (e.g. rotation)
  useEffect(() => {
    translateX.value = isOpen ? 0 : -sidebarWidth;
  }, [sidebarWidth]);

  // Sync animation with context state
  useEffect(() => {
    translateX.value = withSpring(isOpen ? 0 : -sidebarWidth, SPRING_CONFIG);
  }, [isOpen, sidebarWidth]);

  // Edge swipe gesture to open sidebar
  const openGesture = Gesture.Pan()
    .activeOffsetX(10)
    .failOffsetX(-5)
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      translateX.value = Math.min(0, -sidebarWidth + event.translationX);
    })
    .onEnd((event) => {
      if (event.translationX > sidebarWidth / 3) {
        translateX.value = withSpring(0, SPRING_CONFIG);
        runOnJS(openDrawer)();
      } else {
        translateX.value = withSpring(-sidebarWidth, SPRING_CONFIG);
      }
    });

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-sidebarWidth, 0],
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
            width: sidebarWidth,
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
