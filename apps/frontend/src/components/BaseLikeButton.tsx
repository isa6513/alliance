import { useEffect, useState } from "react";

export interface BaseLikeButtonProps {
  liked: boolean;
  likes: number;
  handleLike: (() => void) | null;
  className?: string;
  labelText?: boolean;
  size?: "small" | "medium" | "large";
  border?: boolean;
}

const BaseLikeButton = ({
  liked,
  likes,
  handleLike,
  className,
  labelText = false,
  size = "medium",
  border = false,
}: BaseLikeButtonProps) => {
  const [scaled, setScaled] = useState(false);
  useEffect(() => {
    if (liked) {
      setScaled(true);
      setTimeout(() => {
        setScaled(false);
      }, 200);
    }
  }, [liked]);

  const sizeClass = {
    small: "w-4 h-4",
    medium: "w-5 h-5",
    large: "w-6 h-6",
  };

  return (
    <div
      className={`flex flex-row gap-x-1 items-center ${
        border
          ? "border border-zinc-300 rounded hover:bg-zinc-100 px-2 py-1.5"
          : ""
      } cursor-pointer transition-colors duration-100`}
      onClick={(e) => {
        if (handleLike) {
          e.stopPropagation();
          handleLike();
        }
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="20.0 20.0 60.0 60.0"
        className={`${sizeClass[size]} cursor-pointer ${className} !mr-0`}
        style={{
          transform: scaled ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.1s ease-in-out",
        }}
        strokeWidth={liked ? 2 : 1}
      >
        <path
          d="m 50 71.52 c -0.7539 0 -1.5078 -0.2852 -2.0781 -0.8594 l -18.773 -18.773 c -2.5898 -2.5898 -4.0156 -6.0312 -4.0156 -9.6953 c 0 -3.6641 1.4258 -7.1055 4.0156 -9.6953 c 5.3477 -5.3477 14.047 -5.3477 19.395 0 l 1.4609 1.4609 l 1.4609 -1.4609 c 5.3477 -5.3477 14.047 -5.3477 19.395 0 c 2.5898 2.5898 4.0156 6.0352 4.0156 9.6953 s -1.4258 7.1055 -4.0156 9.6953 l -18.773 18.773 c -0.5742 0.5742 -1.3281 0.8594 -2.0781 0.8594 z z"
          fillRule="evenodd"
          fill={liked ? "#ff3e24" : "none"}
          stroke={liked ? "none" : "#222"}
          strokeWidth={2.5}
        ></path>
      </svg>
      {likes > 0 && <p className="text-sm text-zinc-800">{likes}</p>}
      {labelText && likes > 0 && (
        <p className="text-sm text-zinc-800">
          {likes === 1 ? "Like" : "Likes"}
        </p>
      )}
    </div>
  );
};

export default BaseLikeButton;
