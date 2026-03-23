import { useCallback, useEffect, useState } from "react";

/**
 * Manages an index into a list of length N, clamped to [0, N-1].
 * When the list length shrinks (e.g. after removing an item), the index
 * is adjusted to stay in bounds.
 */
export function useBoundedIndex(length: number) {
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, Math.max(0, length - 1));

  useEffect(() => {
    if (length > 0 && index >= length) {
      setIndex(Math.max(0, length - 1));
    }
  }, [length, index]);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(length - 1, i + 1));
  }, [length]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  return {
    index: safeIndex,
    setIndex,
    goNext,
    goPrev,
    canGoNext: length > 1 && safeIndex < length - 1,
    canGoPrev: length > 1 && safeIndex > 0,
    hasMultiple: length > 1,
  };
}
