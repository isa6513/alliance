import React from "react";
import { Modal, TouchableOpacity, View, ViewProps } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  maxHeight?: number;
  children: React.ReactNode;
} & ViewProps;

export default function FormModal({
  visible,
  onClose,
  maxHeight = 520,
  children,
  style,
  ...rest
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity
        activeOpacity={1}
        className="flex-1 bg-black/40 justify-end"
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-white rounded-t-2xl p-4 w-full"
          style={[{ maxHeight }, style]}
          onPress={(e) => e.stopPropagation()}
          {...rest}
        >
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
