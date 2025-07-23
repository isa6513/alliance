import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
} from "react-native";
import { colors } from "../../lib/style/colors";

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

export default function Text({ children, ...props }: TextProps) {
  return (
    <RNText
      {...props}
      style={[styles.shared, styles[props.type || "default"], props.style]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  shared: {
    fontFamily: "IBMPlexSans-Regular",
  },
  default: {
    fontSize: 14,
    fontFamily: "IBMPlexSans-Regular",
    color: colors.text.primary,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  primary: {
    fontSize: 14,
    color: colors.text.primary,
  },
  bold: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "IBMPlexSans-Bold",
    color: colors.text.primary,
  },
  secondary: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  label: {
    fontSize: 14,
    color: colors.white,
  },
});
