import {
  Platform,
  Text as RNText,
  TextProps as RNTextProps,
} from "react-native";
import { cn } from "@alliance/shared/styles/util";

export enum TextStyle {
  Header = "header",
  Primary = "primary",
  Bold = "bold",
  Secondary = "secondary",
  Label = "label",
}

export enum FontFamily {
  Sans = "sans",
  Serif = "serif",
  Berlingske = "berlingske",
  Mono = "mono",
}

export enum FontWeight {
  Regular = "regular",
  Medium = "medium",
  Semibold = "semibold",
  Bold = "bold",
}

interface TextProps extends RNTextProps {
  type?: TextStyle;
  family?: FontFamily;
  weight?: FontWeight;
  className?: string;
}

const typeClasses: Record<TextStyle, string> = {
  [TextStyle.Header]: "text-2xl text-zinc-900",
  [TextStyle.Primary]: "text-zinc-900",
  [TextStyle.Bold]: "text-zinc-900",
  [TextStyle.Secondary]: "text-zinc-500",
  [TextStyle.Label]: "text-white",
};

const typeWeights: Partial<Record<TextStyle, FontWeight>> = {
  [TextStyle.Header]: FontWeight.Medium,
  [TextStyle.Bold]: FontWeight.Bold,
  [TextStyle.Label]: FontWeight.Medium,
};

const monoFamily = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const fontFamilies: Record<FontFamily, Partial<Record<FontWeight, string>>> = {
  [FontFamily.Sans]: {
    [FontWeight.Regular]: "Source Sans 3",
    [FontWeight.Medium]: "Source Sans 3 Medium",
    [FontWeight.Semibold]: "Source Sans 3 Semibold",
    [FontWeight.Bold]: "Source Sans 3 Bold",
  },
  [FontFamily.Serif]: {
    [FontWeight.Regular]: "Libre Baskerville",
    [FontWeight.Semibold]: "Libre Baskerville SemiBold",
    [FontWeight.Bold]: "Libre Baskerville Bold",
  },
  [FontFamily.Berlingske]: {
    [FontWeight.Regular]: "Berlingske",
    [FontWeight.Medium]: "Berlingske",
    [FontWeight.Semibold]: "Berlingske",
    [FontWeight.Bold]: "Berlingske",
  },
  [FontFamily.Mono]: {
    [FontWeight.Regular]: monoFamily,
    [FontWeight.Medium]: monoFamily,
    [FontWeight.Semibold]: monoFamily,
    [FontWeight.Bold]: monoFamily,
  },
};

export function resolveFontFamily(family: FontFamily, weight: FontWeight) {
  const familyMap = fontFamilies[family];
  return {
    fontFamily:
      familyMap[weight] ??
      familyMap[FontWeight.Regular] ??
      fontFamilies[FontFamily.Sans][FontWeight.Regular],
  };
}

export default function Text({
  children,
  type,
  family,
  weight,
  className,
  style,
  ...props
}: TextProps) {
  const resolvedFamily = family ?? FontFamily.Sans;
  const resolvedWeight =
    weight ?? typeWeights[type ?? TextStyle.Primary] ?? FontWeight.Regular;

  return (
    <RNText
      className={cn(type ? typeClasses[type] : "text-base", className)}
      style={[resolveFontFamily(resolvedFamily, resolvedWeight), style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
