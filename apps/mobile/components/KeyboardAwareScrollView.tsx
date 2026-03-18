import { forwardRef } from "react";
import {
  // eslint-disable-next-line no-restricted-imports
  KeyboardAwareScrollView as BaseKeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
  KeyboardAwareScrollViewRef,
} from "react-native-keyboard-controller";
import { cn } from "@alliance/shared/styles/util";
import { KEYBOARD_BOTTOM_OFFSET_COMPACT } from "../lib/constants";

const KeyboardAwareScrollView = forwardRef<
  KeyboardAwareScrollViewRef,
  KeyboardAwareScrollViewProps
>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <BaseKeyboardAwareScrollView
      ref={ref}
      className={cn("flex-1", className)}
      keyboardShouldPersistTaps="handled"
      bottomOffset={KEYBOARD_BOTTOM_OFFSET_COMPACT}
      {...rest}
    />
  );
});

KeyboardAwareScrollView.displayName = "KeyboardAwareScrollView";

export default KeyboardAwareScrollView;
