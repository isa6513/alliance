import { Text as RNText, TextProps as RNTextProps } from "react-native";

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
  const baseClasses = "font-sans";
  const typeClass = type ? typeClasses[type] : "";
  const combinedClasses = `${baseClasses} ${typeClass} ${className || ""}`;

  return (
    <RNText className={combinedClasses} {...props}>
      {children}
    </RNText>
  );
}
