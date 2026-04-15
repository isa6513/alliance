import { cn } from "@alliance/shared/styles/util";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export interface BaseLikeButtonProps {
  liked: boolean;
  likes: number;
  handleLike: (() => Promise<unknown>) | null;
  className?: string;
  labelText?: boolean;
  size?: "small" | "medium" | "large";
  border?: boolean;
  backgroundColor?: string;
}

const BaseLikeButton = ({
  liked,
  likes,
  handleLike,
  className,
  labelText = false,
  size = "medium",
  border = false,
  backgroundColor = "transparent",
}: BaseLikeButtonProps) => {
  const [scaled, setScaled] = useState(false);
  const [isPending, setIsPending] = useState(false);
  useEffect(() => {
    if (liked) {
      setScaled(true);
      setTimeout(() => {
        setScaled(false);
      }, 200);
    }
  }, [liked]);

  const sizeClass = {
    small: 16,
    medium: 19,
    large: 20,
  };

  const isDisabled = isPending || !handleLike;

  return (
    <div
      className={cn(
        "flex flex-row gap-x-1 items-center",
        "transition-colors duration-100",
        isDisabled ? "cursor-default" : "cursor-pointer",
        `bg-${backgroundColor}`,
        border &&
          "border border-zinc-300 rounded hover:bg-zinc-100 px-2 py-1.5",
      )}
      onClick={async (e) => {
        if (handleLike && !isPending) {
          e.stopPropagation();
          setIsPending(true);
          try {
            await handleLike();
          } catch {
            // errors should already be handled by mutation's onError
          } finally {
            setIsPending(false);
          }
        }
      }}
    >
      <Heart
        size={sizeClass[size]}
        fill={liked ? "#ff3e24" : "none"}
        color={liked ? "#ff3e24" : "#222"}
        className={className}
        strokeWidth={1}
        style={{
          transform: scaled ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.1s ease-in-out",
        }}
      />
      {likes > 0 && <p className="text-sm text-zinc-800">{likes}</p>}
      {labelText && likes > 0 && (
        <p className="text-sm text-zinc-800">
          {likes === 1 ? "like" : "likes"}
        </p>
      )}
    </div>
  );
};

export default BaseLikeButton;
