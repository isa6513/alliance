import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

export enum ProgressBarColor {
  Blue = "blue",
  Green = "green",
  Red = "red",
  Yellow = "yellow",
  Purple = "purple",
}

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: ProgressBarColor;
  height?: number;
  showPercentage?: boolean;
  style?: ViewStyle;
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  color = ProgressBarColor.Blue,
  height = 8,
  showPercentage = false,
  style,
  animated = true,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  const containerStyle = [
    styles.container,
    { height },
    style,
  ];

  const fillStyle = [
    styles.fill,
    styles[`${color}Fill`],
    { width: `${clampedProgress}%` },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={containerStyle}>
        <View style={fillStyle} />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  container: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  
  // Color variants
  blueFill: {
    backgroundColor: "#3b82f6",
  },
  greenFill: {
    backgroundColor: "#22c55e",
  },
  redFill: {
    backgroundColor: "#ef4444",
  },
  yellowFill: {
    backgroundColor: "#eab308",
  },
  purpleFill: {
    backgroundColor: "#a855f7",
  },
  
  percentage: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    minWidth: 32,
    textAlign: "right",
  },
});