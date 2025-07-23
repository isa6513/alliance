import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ImageBackground,
  ImageSourcePropType,
} from "react-native";

export enum CardStyle {
  White = "white",
  Outline = "outline",
  Alert = "alert",
  Grey = "grey",
  Black = "black",
  Green = "green",
  Image = "image",
}

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  cardStyle?: CardStyle;
  onPress?: () => void;
  backgroundImage?: ImageSourcePropType;
  shadow?: boolean;
  borderRadius?: number;
  padding?: number;
}

export default function Card({
  children,
  style,
  cardStyle = CardStyle.White,
  onPress,
  backgroundImage,
  shadow = true,
  borderRadius = 12,
  padding = 16,
}: CardProps) {
  const containerStyle = [
    styles.base,
    styles[`${cardStyle}Container`],
    shadow && styles.shadow,
    { borderRadius, padding },
    style,
  ];

  const CardComponent = onPress ? TouchableOpacity : View;

  const cardContent = <CardComponent style={containerStyle} onPress={onPress} activeOpacity={0.95}>
    {children}
  </CardComponent>;

  if (backgroundImage && cardStyle === CardStyle.Image) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={[containerStyle, { padding: 0 }]}
        imageStyle={{ borderRadius }}
      >
        <View style={{ padding }}>{children}</View>
      </ImageBackground>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    padding: 16,
  },
  
  // Card style variants
  whiteContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d6d3d1",
  },
  alertContainer: {
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  greyContainer: {
    backgroundColor: "#f5f5f4",
    borderWidth: 1,
    borderColor: "#e7e5e4",
  },
  blackContainer: {
    backgroundColor: "#1c1917",
    borderWidth: 1,
    borderColor: "#44403c",
  },
  greenContainer: {
    backgroundColor: "#c4d8bf",
    borderWidth: 1,
    borderColor: "#a3c197",
  },
  imageContainer: {
    backgroundColor: "transparent",
  },
  
  // Shadow
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});