import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

export enum StatusType {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending",
  Success = "success",
  Warning = "warning",
  Error = "error",
  Info = "info",
}

interface StatusIndicatorProps {
  status: StatusType;
  text?: string;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  showText?: boolean;
}

export default function StatusIndicator({
  status,
  text,
  size = "medium",
  style,
  showText = true,
}: StatusIndicatorProps) {
  const containerStyle = [
    styles.container,
    styles[`${size}Container`],
    style,
  ];

  const dotStyle = [
    styles.dot,
    styles[`${status}Dot`],
    styles[`${size}Dot`],
  ];

  const textStyle = [
    styles.text,
    styles[`${status}Text`],
    styles[`${size}Text`],
  ];

  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <View style={containerStyle}>
      <View style={dotStyle} />
      {showText && <Text style={textStyle}>{displayText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  
  // Size variants for container
  smallContainer: {
    gap: 4,
  },
  mediumContainer: {
    gap: 6,
  },
  largeContainer: {
    gap: 8,
  },
  
  // Dot base styles
  dot: {
    borderRadius: 50,
  },
  
  // Dot size variants
  smallDot: {
    width: 6,
    height: 6,
  },
  mediumDot: {
    width: 8,
    height: 8,
  },
  largeDot: {
    width: 10,
    height: 10,
  },
  
  // Status colors for dots
  activeDot: {
    backgroundColor: "#22c55e",
  },
  inactiveDot: {
    backgroundColor: "#6b7280",
  },
  pendingDot: {
    backgroundColor: "#eab308",
  },
  successDot: {
    backgroundColor: "#22c55e",
  },
  warningDot: {
    backgroundColor: "#f59e0b",
  },
  errorDot: {
    backgroundColor: "#ef4444",
  },
  infoDot: {
    backgroundColor: "#3b82f6",
  },
  
  // Text styles
  text: {
    fontWeight: "500",
  },
  
  // Text size variants
  smallText: {
    fontSize: 11,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
  
  // Status colors for text
  activeText: {
    color: "#15803d",
  },
  inactiveText: {
    color: "#6b7280",
  },
  pendingText: {
    color: "#ca8a04",
  },
  successText: {
    color: "#15803d",
  },
  warningText: {
    color: "#d97706",
  },
  errorText: {
    color: "#dc2626",
  },
  infoText: {
    color: "#2563eb",
  },
});