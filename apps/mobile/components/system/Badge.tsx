import React from "react";
import { View, Text, StyleSheet, TextStyle, ViewStyle } from "react-native";

export enum BadgeColor {
  Default = "default",
  Green = "green",
  Blue = "blue",
  Red = "red",
  Yellow = "yellow",
  Purple = "purple",
}

export enum BadgeSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

interface BadgeProps {
  text: string;
  color?: BadgeColor;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  text,
  color = BadgeColor.Default,
  size = BadgeSize.Medium,
  style,
  textStyle,
}: BadgeProps) {
  const containerStyle = [
    styles.base,
    styles[`${color}Container`],
    styles[`${size}Container`],
    style,
  ];

  const titleStyle = [
    styles.text,
    styles[`${color}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <View style={containerStyle}>
      <Text style={titleStyle}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Size variants
  smallContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    minHeight: 20,
  },
  mediumContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 24,
  },
  largeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 28,
  },
  
  // Color variants - containers
  defaultContainer: {
    backgroundColor: "#e0e0e0",
  },
  greenContainer: {
    backgroundColor: "#dcfce7",
  },
  blueContainer: {
    backgroundColor: "#dbeafe",
  },
  redContainer: {
    backgroundColor: "#fee2e2",
  },
  yellowContainer: {
    backgroundColor: "#fef3c7",
  },
  purpleContainer: {
    backgroundColor: "#e9d5ff",
  },
  
  // Text styles
  text: {
    fontWeight: "500",
    textAlign: "center",
  },
  
  // Size-specific text
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
  
  // Color-specific text
  defaultText: {
    color: "#333",
  },
  greenText: {
    color: "#166534",
  },
  blueText: {
    color: "#1e40af",
  },
  redText: {
    color: "#dc2626",
  },
  yellowText: {
    color: "#d97706",
  },
  purpleText: {
    color: "#7c3aed",
  },
});