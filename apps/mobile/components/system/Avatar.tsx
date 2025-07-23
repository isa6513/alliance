import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageSourcePropType,
} from "react-native";

export enum AvatarSize {
  ExtraSmall = "xs",
  Small = "sm",
  Medium = "md",
  Large = "lg",
  ExtraLarge = "xl",
}

interface AvatarProps {
  source?: ImageSourcePropType;
  initials?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  backgroundColor?: string;
}

export default function Avatar({
  source,
  initials,
  size = AvatarSize.Medium,
  style,
  textStyle,
  backgroundColor = "#e5e7eb",
}: AvatarProps) {
  const containerStyle = [
    styles.container,
    styles[`${size}Container`],
    { backgroundColor },
    style,
  ];

  const imageStyle = [
    styles.image,
    styles[`${size}Container`],
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${size}Text`],
    textStyle,
  ];

  if (source) {
    return (
      <View style={containerStyle}>
        <Image source={source} style={imageStyle} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={textStyleCombined}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  image: {
    borderRadius: 50,
  },
  text: {
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  
  // Size variants
  xsContainer: {
    width: 24,
    height: 24,
  },
  smContainer: {
    width: 32,
    height: 32,
  },
  mdContainer: {
    width: 40,
    height: 40,
  },
  lgContainer: {
    width: 48,
    height: 48,
  },
  xlContainer: {
    width: 56,
    height: 56,
  },
  
  // Text size variants
  xsText: {
    fontSize: 10,
  },
  smText: {
    fontSize: 12,
  },
  mdText: {
    fontSize: 14,
  },
  lgText: {
    fontSize: 16,
  },
  xlText: {
    fontSize: 18,
  },
});