import { TouchableOpacity } from "react-native";
import { Heart } from "lucide-react-native";
import Text from "./system/Text";
import { cn } from "@alliance/shared/styles/util";

interface LikeButtonProps {
  liked: boolean;
  likes: number;
  onPress?: () => void;
  bordered?: boolean;
}

export default function LikeButton({
  liked,
  likes,
  onPress,
  bordered = false,
}: LikeButtonProps) {
  const baseClasses = "flex-row items-center gap-x-1";
  const borderClasses = bordered
    ? "border border-zinc-200 rounded px-2 py-1"
    : "";
  const iconColor = liked ? "#ef4444" : "#888";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(baseClasses, borderClasses)}
      disabled={!onPress}
    >
      <Heart size={19} color={iconColor} fill={liked ? iconColor : "none"} />
      {likes > 0 && <Text className="text-sm text-zinc-800">{likes}</Text>}
    </TouchableOpacity>
  );
}
