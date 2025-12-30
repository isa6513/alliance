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
  [TextStyle.Primary]: "text-sm text-zinc-900",
  [TextStyle.Bold]: "text-sm font-bold text-zinc-900",
  [TextStyle.Secondary]: "text-sm text-zinc-500",
  [TextStyle.Label]: "text-sm text-white font-medium",
};

export default function Text({
  children,
  type,
  className,
  ...props
}: TextProps) {
  const baseClasses = "font-sans";
  const typeClass = type ? typeClasses[type] : "";
  console.log(type);
  console.log(typeClass);
  const combinedClasses = `${baseClasses} ${typeClass} ${className || ""}`;

  return (
    <RNText className={combinedClasses} {...props}>
      {children}
    </RNText>
  );
}
