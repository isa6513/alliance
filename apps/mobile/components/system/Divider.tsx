import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

export enum DividerOrientation {
  Horizontal = "horizontal",
  Vertical = "vertical",
}

interface DividerProps {
  orientation?: DividerOrientation;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
}

export default function Divider({
  orientation = DividerOrientation.Horizontal,
  color = "#e5e7eb",
  thickness = 1,
  style,
}: DividerProps) {
  const dividerStyle = [
    styles.base,
    orientation === DividerOrientation.Horizontal
      ? { height: thickness, backgroundColor: color }
      : { width: thickness, backgroundColor: color },
    style,
  ];

  return <View style={dividerStyle} />;
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});