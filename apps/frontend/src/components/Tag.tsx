import React from "react";

export enum TagStyle {
  Green = "green",
  Blue = "blue",
  Grey = "grey",
  Yellow = "yellow",
  GreyOutline = "grey-outline",
}

interface TagProps {
  style: TagStyle;
  size?: "small" | "large";
  children: React.ReactNode;
  className?: string;
}

const Tag: React.FC<TagProps> = ({
  style,
  children,
  size = "small",
  className,
}: TagProps) => {
  const tagStyle = style ?? TagStyle.Grey;

  const sizeClasses = {
    small: "px-2 py-1 rounded-md text-sm",
    large: "px-4 py-2 rounded-lg text-base",
  };

  const styleClasses = {
    [TagStyle.Green]: "px-2 py-1 bg-green/30 self-start text-black",
    [TagStyle.Blue]: "px-2 py-1 bg-blue-400/20 self-start text-blue-600",
    [TagStyle.Grey]: "px-2 py-1 bg-zinc-400/20 self-start text-zinc-500",
    [TagStyle.Yellow]: "px-2 py-1 bg-yellow-400/20 self-start text-yellow-600",
    [TagStyle.GreyOutline]:
      "px-2 py-1 border border-zinc-300 self-start text-zinc-500",
  };

  return (
    <div
      className={`${className} ${sizeClasses[size]} ${styleClasses[tagStyle]}`}
    >
      {children}
    </div>
  );
};

export default Tag;
