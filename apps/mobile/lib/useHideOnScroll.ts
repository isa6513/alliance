import { useCallback, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

type UseHideOnScrollOptions = {
  threshold?: number;
  topOffset?: number;
  initialVisible?: boolean;
};

export function useHideOnScroll(options: UseHideOnScrollOptions = {}) {
  const { threshold = 8, topOffset = 0, initialVisible = true } = options;
  const [isVisible, setIsVisible] = useState(initialVisible);
  const previousScrollY = useRef(0);
  const isVisibleRef = useRef(initialVisible);

  const setVisible = useCallback((visible: boolean) => {
    if (isVisibleRef.current === visible) return;
    isVisibleRef.current = visible;
    setIsVisible(visible);
  }, []);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const lastY = previousScrollY.current;

      if (currentY <= topOffset) {
        setVisible(true);
      } else if (currentY > lastY + threshold) {
        setVisible(false);
      } else if (currentY < lastY - threshold) {
        setVisible(true);
      }

      previousScrollY.current = currentY;
    },
    [setVisible, threshold, topOffset],
  );

  const show = useCallback(() => setVisible(true), [setVisible]);
  const hide = useCallback(() => setVisible(false), [setVisible]);

  return {
    isVisible,
    onScroll,
    scrollEventThrottle: 16 as const,
    show,
    hide,
  };
}
