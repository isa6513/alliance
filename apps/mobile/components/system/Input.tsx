import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  required?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  required = false,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Single source of truth for border color
  const borderColor = error ? "#ef4444" : isFocused ? "#318dde" : "#d1d5db";

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={[styles.input, inputStyle]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9ca3af"
          underlineColorAndroid="transparent" // <-- removes Android underline
          {...(Platform.OS === "web" && {
            style: [{ outlineStyle: undefined }, styles.input, inputStyle],
          })}
          {...textInputProps}
        />
      </View>
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    minHeight: 44,
  },
  input: {
    fontSize: 15,
    color: "#374151",
    paddingVertical: 12,
    fontFamily: "System",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
});
