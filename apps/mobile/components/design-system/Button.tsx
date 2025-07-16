import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";

export enum ButtonColor {
  Stone = "stone",
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
  title: string;
  onPress: () => void;
  color?: ButtonColor;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  color = ButtonColor.Stone,
  size = ButtonSize.Medium,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const containerStyle = [
    styles.base,
    styles[`${color}Container`],
    styles[`${size}Container`],
    disabled && styles.disabledContainer,
    style,
  ];

  const titleStyle = [
    styles.text,
    styles[`${color}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
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
      ) : (
        <Text style={titleStyle}>{title}</Text>
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
  stoneContainer: {
    backgroundColor: "#444",
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
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  // Size-specific text
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 13,
  },
  largeText: {
    fontSize: 16,
  },

  // Color-specific text
  stoneText: {
    color: "#fff",
  },
  greenText: {
    color: "#fff",
  },
  blueText: {
    color: "#fff",
  },
  redText: {
    color: "#fff",
  },
  lightText: {
    color: "#444",
  },
  outlineText: {
    color: "#444",
  },

  // Disabled states
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
