import React from "react";
import { View, Text, ViewProps } from "react-native";

export enum ProgressBarColor {
  Blue = "blue",
  Green = "green",
  Red = "red",
  Yellow = "yellow",
  Purple = "purple",
}

interface ProgressBarProps extends ViewProps {
  progress: number; // 0 to 100
  color?: ProgressBarColor;
  showPercentage?: boolean;
}

const fillColorClasses: Record<ProgressBarColor, string> = {
  [ProgressBarColor.Blue]: "bg-blue-500",
  [ProgressBarColor.Green]: "bg-green-500",
  [ProgressBarColor.Red]: "bg-red-500",
  [ProgressBarColor.Yellow]: "bg-yellow-500",
  [ProgressBarColor.Purple]: "bg-purple-500",
};

export default function ProgressBar({
  progress,
  color = ProgressBarColor.Green,
  showPercentage = false,
  className,
  ...props
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View className={`flex-row items-center gap-3 ${className || ""}`} {...props}>
      <View className="flex-1 h-3 bg-zinc-100 rounded overflow-hidden">
        <View
          className={`h-full rounded ${fillColorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </View>
      {showPercentage && (
        <Text className="text-xs font-medium text-zinc-500 min-w-8 text-right">
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
}
