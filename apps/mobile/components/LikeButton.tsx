import { TouchableOpacity } from "react-native";
import { Heart } from "lucide-react-native";
import Text from "./system/Text";
import { cn } from "@alliance/shared/styles/util";

interface LikeButtonProps {
  liked: boolean;
  likes: number;
  onPress?: () => void;
  bordered?: boolean;
  size?: number;
  iconColor?: string;
}

export default function LikeButton({
  liked,
  likes,
  iconColor,
  onPress,
  bordered = false,
  size = 20,
}: LikeButtonProps) {
  const baseClasses = "flex-row items-center gap-x-1";
  const borderClasses = bordered
    ? "border border-zinc-200 rounded px-2 py-1"
    : "";
  const color = liked ? "#ef4444" :  iconColor ?? "#888";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(baseClasses, borderClasses)}
      disabled={!onPress}
    >
      <Heart size={size} color={color} fill={liked ? color : "none"} />
      {likes > 0 && <Text>{likes}</Text>}
    </TouchableOpacity>
  );
}
