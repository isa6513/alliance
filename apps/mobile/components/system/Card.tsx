import React from "react";
import {
  View,
  TouchableOpacity,
  ImageBackground,
  ImageSourcePropType,
  ViewProps,
} from "react-native";
import { cardStyleClasses } from "@alliance/shared/styles/card";

export enum CardStyle {
  White = "white",
  Outline = "outline",
  Alert = "alert",
  Grey = "grey",
  Black = "black",
  Green = "green",
  Image = "image",
  LightGreen = "light-green",
  Red = "red",
}

interface CardProps extends ViewProps {
  children: React.ReactNode;
  cardStyle?: CardStyle;
  onPress?: () => void;
  backgroundImage?: ImageSourcePropType;
}

export default function Card({
  children,
  className,
  cardStyle = CardStyle.White,
  onPress,
  backgroundImage,
  ...props
}: CardProps) {
  const baseClasses = "flex flex-col p-4 rounded-lg";
  const variantClasses = cardStyleClasses[cardStyle];
  const combinedClasses = `${baseClasses} ${variantClasses} ${className || ""}`;

  if (backgroundImage && cardStyle === CardStyle.Image) {
    return (
      <ImageBackground
        source={backgroundImage}
        className={combinedClasses}
        imageStyle={{ borderRadius: 8 }}
      >
        {children}
      </ImageBackground>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        className={combinedClasses}
        onPress={onPress}
        activeOpacity={0.95}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={combinedClasses} {...props}>
      {children}
    </View>
  );
}
