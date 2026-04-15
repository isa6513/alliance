import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Heart } from "lucide-react-native";
import Text from "./system/Text";
import { cn } from "@alliance/shared/styles/util";

interface LikeButtonProps {
  liked: boolean;
  likes: number;
  onPress?: () => Promise<unknown>;
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
  const [isPending, setIsPending] = useState(false);
  const baseClasses = "flex-row items-center gap-x-1";
  const borderClasses = bordered
    ? "border border-zinc-200 rounded px-2 py-1"
    : "";
  const isDisabled = isPending || !onPress;
  const color = liked ? "#ef4444" : (iconColor ?? "#888");

  return (
    <TouchableOpacity
      onPress={async () => {
        if (onPress && !isPending) {
          setIsPending(true);
          try {
            await onPress();
          } catch {
            // errors should already be handled by mutation's onError
          } finally {
            setIsPending(false);
          }
        }
      }}
      activeOpacity={0.7}
      className={cn(baseClasses, borderClasses)}
      disabled={isDisabled}
    >
      <Heart size={size} color={color} fill={liked ? color : "none"} />
      {likes > 0 && <Text>{likes}</Text>}
    </TouchableOpacity>
  );
}
