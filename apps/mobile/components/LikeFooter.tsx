import { ProfileDto } from "@alliance/shared/client";
import { LikeTargetType } from "@alliance/shared/lib/useLikers";
import { cn } from "@alliance/shared/styles/util";
import { Heart, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import LikeSummary from "./LikeSummary";
import Text, { FontWeight } from "./system/Text";

const HEART_RED = "#ff3e24";

/** Like toggle for full-width bars or compact rows. */
export function LikeActionButton({
  liked,
  onLike,
  compact = false,
}: {
  liked: boolean;
  onLike?: () => Promise<unknown> | void;
  compact?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const disabled = pending || !onLike;
  return (
    <Pressable
      disabled={disabled}
      hitSlop={compact ? 8 : undefined}
      onPress={async () => {
        if (!onLike || pending) return;
        setPending(true);
        try {
          await onLike();
        } catch {
          // Mutation onError handles failures.
        } finally {
          setPending(false);
        }
      }}
      className={
        compact
          ? "flex-row items-center gap-x-1.5"
          : "flex-1 flex-row items-center justify-center gap-x-2 rounded-md py-1.5"
      }
    >
      <Heart
        size={compact ? 16 : 18}
        fill={liked ? HEART_RED : "none"}
        color={liked ? HEART_RED : "#52525b"}
        strokeWidth={1.8}
      />
      <Text
        className={liked ? "text-[#ff3e24]" : "text-zinc-600"}
        weight={FontWeight.Medium}
      >
        Like
      </Text>
    </Pressable>
  );
}

export function LikeBarButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center gap-x-2 rounded-md py-1.5"
    >
      <Icon size={18} color="#52525b" strokeWidth={1.8} />
      <Text className="text-zinc-600" weight={FontWeight.Medium}>
        {label}
      </Text>
    </Pressable>
  );
}

export interface LikeFooterProps {
  likeTargetType: LikeTargetType;
  likeTargetId: number;
  liked: boolean;
  likesCount: number;
  likers?: ProfileDto[];
  onLike?: () => Promise<unknown> | void;
  children?: React.ReactNode;
  /** "fill": full-width bar. "right": summary plus compact Like on one row. */
  align?: "fill" | "right";
}

export default function LikeFooter({
  likeTargetType,
  likeTargetId,
  liked,
  likesCount,
  likers,
  onLike,
  children,
  align = "fill",
}: LikeFooterProps) {
  const hasLikes = likesCount > 0;
  const summary = (
    <LikeSummary
      likeTargetType={likeTargetType}
      likeTargetId={likeTargetId}
      liked={liked}
      likesCount={likesCount}
      likers={likers}
    />
  );

  if (align === "right") {
    return (
      <View
        // Avoid height jump when the first avatar appears.
        style={{ minHeight: 36 }}
        className={cn(
          "mt-3 flex-row items-center",
          hasLikes ? "justify-between" : "justify-end",
        )}
      >
        {hasLikes && summary}
        <LikeActionButton liked={liked} onLike={onLike} compact />
      </View>
    );
  }

  return (
    <View>
      {hasLikes && <View className="mt-3">{summary}</View>}
      <View className={cn("flex-row", hasLikes ? "mt-2" : "mt-3")}>
        <LikeActionButton liked={liked} onLike={onLike} />
        {children}
      </View>
    </View>
  );
}
