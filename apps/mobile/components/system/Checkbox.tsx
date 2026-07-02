import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { Check } from "lucide-react-native";
import { cn } from "@alliance/shared/styles/util";

type CheckboxProps = {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: string | null;
  error?: boolean;
  className?: string;
};

const markdownStyles: StyleSheet.NamedStyles<any> = {
  body: {
    color: "#18181b",
    fontSize: 15,
    lineHeight: 20,
  },
  strong: {
    fontWeight: "600",
  },
  paragraph: {
    marginTop: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
};

export default function Checkbox({
  checked,
  onChange,
  disabled,
  label,
  error,
  className,
}: CheckboxProps) {
  const borderClass = error
    ? "border-red-500"
    : checked
      ? "border-green-600"
      : "border-zinc-400";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      className={cn("flex-row items-center", className)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        className={cn(
          "w-6 h-6 rounded border items-center justify-center mr-2",
          borderClass,
          disabled && "opacity-60",
          checked ? "bg-green" : "bg-white",
        )}
      >
        {checked && <Check size={16} color="#fff" strokeWidth={3} />}
      </View>
      {label ? (
        <View className="flex-row flex-wrap items-center">
          <Markdown style={markdownStyles}>{label}</Markdown>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
