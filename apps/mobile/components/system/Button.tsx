import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import Text, { TextStyle } from "./Text";

export enum ButtonColor {
  Black = "black",
  Green = "green",
  Blue = "blue",
  Red = "red",
  Light = "light",
  Outline = "outline",
}

export enum ButtonSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

interface ButtonProps {
  onPress: () => void;
  color?: ButtonColor;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
  title?: string;
}

export default function Button({
  onPress,
  color = ButtonColor.Black,
  size = ButtonSize.Medium,
  disabled = false,
  loading = false,
  style,
  children,
  title,
}: ButtonProps) {
  const containerStyle = [
    styles.base,
    styles[`${color}Container`],
    styles[`${size}Container`],
    disabled && styles.disabledContainer,
    style,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={color === ButtonColor.Outline ? "#444" : "#fff"}
        />
      ) : children ? (
        children
      ) : (
        <Text type={TextStyle.Label}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    fontWeight: "500",
    fontFamily: "IBMPlexSans-Regular",
    textAlign: "center",
  },

  // Size variants
  smallContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  mediumContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  largeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },

  // Color variants - containers
  blackContainer: {
    backgroundColor: "#333",
    color: "white",
  },
  greenContainer: {
    backgroundColor: "#5d9c2d",
  },
  blueContainer: {
    backgroundColor: "#318dde",
  },
  redContainer: {
    backgroundColor: "#ef4444",
  },
  lightContainer: {
    backgroundColor: "#e7e5e4",
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d6d3d1",
  },

  // Text styles
  text: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },

  // Size-specific text
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },

  // Disabled states
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
