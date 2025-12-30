import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TextInputProps,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
}

export default function Input({
  label,
  error,
  helperText,
  required = false,
  containerClassName,
  className,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColorClass = error
    ? "border-red-500"
    : isFocused
    ? "border-blue-500"
    : "border-zinc-300";

  const inputContainerClasses = `border rounded-lg bg-white px-3 min-h-11 ${borderColorClass}`;
  const inputClasses = `text-base text-zinc-700 py-3 ${className || ""}`;

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-sm font-medium text-zinc-700 mb-2">
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}
      <View className={inputContainerClasses}>
        <TextInput
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9ca3af"
          underlineColorAndroid="transparent"
          {...textInputProps}
        />
      </View>
      {error && (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      )}
      {helperText && !error && (
        <Text className="text-xs text-zinc-500 mt-1">{helperText}</Text>
      )}
    </View>
  );
}
