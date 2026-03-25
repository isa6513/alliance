import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { cn } from "@alliance/shared/styles/util";

export enum TextStyle {
  Header = "header",
  Primary = "primary",
  Bold = "bold",
  Secondary = "secondary",
  Label = "label",
}

interface TextProps extends RNTextProps {
  type?: TextStyle;
}

const typeClasses: Record<TextStyle, string> = {
  [TextStyle.Header]: "text-2xl font-medium text-zinc-900",
  [TextStyle.Primary]: "text-zinc-900",
  [TextStyle.Bold]: "font-bold text-zinc-900",
  [TextStyle.Secondary]: "text-zinc-500",
  [TextStyle.Label]: "text-white font-medium",
};

export default function Text({
  children,
  type,
  className,
  ...props
}: TextProps) {
  return (
    <RNText
      className={cn(
        "font-sans",
        type ? typeClasses[type] : "text-base",
        className,
      )}
      {...props}
    >
      {children}
    </RNText>
  );
}
