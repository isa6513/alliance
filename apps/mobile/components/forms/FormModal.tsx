import React, { type PropsWithChildren } from "react";
import { Modal, View, Pressable, ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
}

function FormModal({
  visible,
  onClose,
  children,
}: PropsWithChildren<FormModalProps>) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Backdrop */}
      <Pressable onPress={onClose} className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={-50}>
          {/* Prevent backdrop press from closing when tapping content */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-2xl px-5 pt-5 pb-15">
              <ScrollView
                keyboardShouldPersistTaps="handled"
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export default FormModal;
