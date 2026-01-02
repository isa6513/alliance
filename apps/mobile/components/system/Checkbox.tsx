import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { Check } from "lucide-react-native";

type CheckboxProps = {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: string | null;
  required?: boolean;
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
  },
};

export default function Checkbox({
  checked,
  onChange,
  disabled,
  label,
  required,
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
      className={`flex-row items-start ${className || ""}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        className={`w-5 h-5 rounded border items-center justify-center mr-2 ${borderClass} ${
          disabled ? "opacity-60" : ""
        } ${checked ? "bg-green" : "bg-white"}`}
      >
        {checked && <Check size={14} color="#fff" strokeWidth={3} />}
      </View>
      <View className="flex-1">
        {label ? (
          <View className="flex-row flex-wrap items-center">
            <Markdown style={markdownStyles}>{label}</Markdown>
            {required && (
              <Text className="text-red-500 ml-px self-start">*</Text>
            )}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
