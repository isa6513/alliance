import { ProfileDto } from "@alliance/shared/client";
import { LikeTargetType } from "@alliance/shared/lib/useLikers";
import { cn } from "@alliance/shared/styles/util";
import { Toggle } from "@base-ui/react/toggle";
import { Heart, type LucideIcon } from "lucide-react";
import { useState } from "react";
import LikeSummary from "./LikeSummary";

const HEART_RED = "#ff3e24";

const barButtonClass =
  "flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-default";

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
    <Toggle
      pressed={liked}
      disabled={disabled}
      onClick={(e) => e.stopPropagation()}
      onPressedChange={async () => {
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
      className={cn(
        compact
          ? "flex items-center gap-1.5 text-sm font-medium disabled:cursor-default"
          : barButtonClass,
        liked ? "text-[#ff3e24]" : "text-zinc-600",
      )}
    >
      <Heart
        size={compact ? 16 : 18}
        fill={liked ? HEART_RED : "none"}
        color={liked ? HEART_RED : "#52525b"}
        strokeWidth={1.8}
      />
      Like
    </Toggle>
  );
}

export function LikeBarButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPress?.(e);
      }}
      className={cn(barButtonClass, "text-zinc-600")}
    >
      <Icon size={18} color="#52525b" strokeWidth={1.8} />
      {label}
    </button>
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
  className?: string;
}

const LikeFooter = ({
  likeTargetType,
  likeTargetId,
  liked,
  likesCount,
  likers,
  onLike,
  children,
  align = "fill",
  className,
}: LikeFooterProps) => {
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
      <div
        className={cn(
          // Avoid height jump when the first avatar appears.
          "mt-3 flex min-h-9 items-center",
          hasLikes ? "justify-between" : "justify-end",
          className,
        )}
      >
        {hasLikes && summary}
        <LikeActionButton liked={liked} onLike={onLike} compact />
      </div>
    );
  }

  return (
    <div className={className}>
      {hasLikes && <div className="mt-3">{summary}</div>}
      <div className={cn("flex", hasLikes ? "mt-2" : "mt-3")}>
        <LikeActionButton liked={liked} onLike={onLike} />
        {children}
      </div>
    </div>
  );
};

export default LikeFooter;
