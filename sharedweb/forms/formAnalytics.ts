import { useCallback, useEffect, useRef } from "react";
import posthog from "posthog-js";

const MAX_PAGE_DURATION_SECONDS = 900; // 15 minute cap

interface FormTrackingParams {
  formId: number;
  actionId: number;
  currentPageIndex: number;
  pageCount: number;
  enabled: boolean;
}

export function useFormPageDurationTracking({
  formId,
  actionId,
  currentPageIndex,
  pageCount,
  enabled,
}: FormTrackingParams) {
  const pageEnteredAtRef = useRef<number>(Date.now());
  const isTrackingRef = useRef<boolean>(true);

  const emitExit = (reason?: string) => {
    if (!isTrackingRef.current) return;
    isTrackingRef.current = false;
    const durationSeconds = Math.min(
      Math.round((Date.now() - pageEnteredAtRef.current) / 1000),
      MAX_PAGE_DURATION_SECONDS
    );
    posthog.capture("form_page_exited", {
      form_id: formId,
      action_id: actionId,
      page_index: currentPageIndex,
      page_count: pageCount,
      duration_seconds: durationSeconds,
      ...(reason && { reason }),
    });
  };

  // Track page entry/exit on page changes and unmount
  useEffect(() => {
    if (!enabled) return;

    pageEnteredAtRef.current = Date.now();
    isTrackingRef.current = true;
    posthog.capture("form_page_viewed", {
      form_id: formId,
      action_id: actionId,
      page_index: currentPageIndex,
      page_count: pageCount,
    });

    return () => emitExit();
  }, [currentPageIndex, formId, actionId, enabled, pageCount]);

  // Pause/resume tracking on tab visibility changes
  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.hidden) {
        emitExit("tab_hidden");
      } else {
        pageEnteredAtRef.current = Date.now();
        isTrackingRef.current = true;
        posthog.capture("form_page_viewed", {
          form_id: formId,
          action_id: actionId,
          page_index: currentPageIndex,
          page_count: pageCount,
          reason: "tab_visible",
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [currentPageIndex, formId, actionId, enabled, pageCount]);
}

export function useFormValidationErrorTracking({
  formId,
  actionId,
  currentPageIndex,
  pageCount,
  enabled,
}: FormTrackingParams) {
  return useCallback(
    (firstInvalidFieldId?: string) => {
      if (!enabled) return;
      posthog.capture("form_validation_error", {
        form_id: formId,
        action_id: actionId,
        page_index: currentPageIndex,
        page_count: pageCount,
        first_invalid_field_id: firstInvalidFieldId,
      });
    },
    [formId, actionId, currentPageIndex, pageCount, enabled]
  );
}
