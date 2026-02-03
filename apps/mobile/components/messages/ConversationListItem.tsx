import { ConversationDto } from "@alliance/shared/client";
import { formatTime } from "@alliance/shared/lib/utils";
import { View, TouchableOpacity } from "react-native";
import ProfileImage from "../ProfileImage";
import Text from "../system/Text";
import { getConversationTimestamp } from "../../lib/messages";

interface ConversationListItemProps {
  conversation: ConversationDto;
  preview: string;
  onPress: () => void;
  unreadCount?: number;
  showDivider?: boolean;
}

export default function ConversationListItem({
  conversation,
  preview,
  onPress,
  unreadCount = 0,
  showDivider = true,
}: ConversationListItemProps) {
  const timestamp = getConversationTimestamp(conversation);
  const timeLabel = formatTime(timestamp, { addSuffix: true }).replace(
    "less than a minute ago",
    "now"
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`px-4 py-3 bg-white ${
        showDivider ? "border-b border-zinc-200" : ""
      }`}
    >
      <View className="flex-row items-center gap-3">
        <ProfileImage pfp={conversation.photo ?? null} size="large" />
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className="font-medium text-zinc-900 flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {conversation.title}
            </Text>
            <Text className="text-xs text-zinc-500 ml-2 flex-shrink-0">
              {timeLabel}
            </Text>
          </View>
          <Text className="text-sm text-zinc-500 mt-1" numberOfLines={1}>
            {preview}
          </Text>
        </View>
        {unreadCount > 0 && (
          <View className="bg-red-500 rounded-full min-w-6 h-6 px-2 items-center justify-center">
            <Text className="text-xs text-white font-semibold">
              {unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
