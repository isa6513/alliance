import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  TouchableOpacity,
} from "react-native-gesture-handler";
import { Check } from "lucide-react-native";
import { formatTime } from "@alliance/shared/lib/utils";
import Text from "./system/Text";
import ProfileImage from "./ProfileImage";
import { NotificationDto } from "@alliance/shared/client";
import { Pressable, View } from "react-native";
import { cn } from "@alliance/shared/styles/util";
import { getNotificationTime } from "@alliance/shared/lib/notificationBucketing";

const SWIPE_THRESHOLD = -80;

interface SwipeableNotificationProps {
  notification: NotificationDto;
  onPress: () => void;
  onMarkRead: () => void;
}

function SwipeableNotification({
  notification,
  onPress,
  onMarkRead,
}: SwipeableNotificationProps) {
  const translateX = useSharedValue(0);
  const isUnread = !notification.readAt;

  const displayUsers = notification.associatedUsers.slice(0, 3);
  const remainingUsers =
    notification.associatedUsers.length - displayUsers.length;

  const panGesture = Gesture.Pan()
    .enabled(isUnread)
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Only allow swiping left (negative values)
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        runOnJS(onMarkRead)();
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const actionStyle = useAnimatedStyle(() => {
    const width = interpolate(
      translateX.value,
      [SWIPE_THRESHOLD, 0],
      [-SWIPE_THRESHOLD, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      translateX.value,
      [SWIPE_THRESHOLD, -20, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );
    return {
      width,
      opacity,
    };
  });

  return (
    <View className="overflow-hidden border-t mx-px border-zinc-200 p-4">
      {/* Background action area */}
      <Animated.View
        style={[actionStyle]}
        className="absolute right-0 top-0 bottom-0 bg-green items-center justify-center"
      >
        <View className="flex-row items-center gap-x-1 px-3">
          <Check size={16} color="white" />
          <Text className="text-white text-sm font-medium text-nowrap whitespace-nowrap">
            Read
          </Text>
        </View>
      </Animated.View>

      {/* Swipeable content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={contentStyle}>
          <Pressable
            onPress={onPress}
            className={cn(notification.readAt ? "bg-white" : "bg-red-50")}
          >
            <View className="flex-1">
              <View className="flex-row items-center flex-wrap gap-x-1">
                {displayUsers.map((user) => (
                  <ProfileImage
                    key={user.id}
                    pfp={user.profilePicture}
                    size="small"
                  />
                ))}
                {remainingUsers > 0 && (
                  <Text className="text-xs text-zinc-500 mr-1">
                    +{remainingUsers}
                  </Text>
                )}
                <Text
                  className="text-base text-zinc-900 flex-1"
                  numberOfLines={2}
                >
                  {notification.category === "action_update" && (
                    <Text className="font-semibold">Action update: </Text>
                  )}
                  {notification.message}
                </Text>
              </View>
              <Text className="text-xs text-zinc-500 mt-1">
                {formatTime(getNotificationTime(notification), {
                  addSuffix: true,
                })}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default SwipeableNotification;
