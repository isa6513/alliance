import {
  AnalyticsEvent,
  ExceptionEvent,
  SEND_TO_SLACK,
  SLACK_PROPERTY,
} from "@alliance/common/analytics";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: JsonValue }
  | JsonValue[];

export type AnalyticsProperties = Record<string, JsonValue>;

export interface AnalyticsBackend {
  capture(event: string, properties?: AnalyticsProperties): void;
  captureException(error: unknown, properties?: AnalyticsProperties): void;
}

// Until a real backend is registered (on mobile this happens in an effect,
// after the first render), buffer calls instead of dropping them so early
// events aren't lost.
const MAX_BUFFERED_CALLS = 100;
let pending: Array<(b: AnalyticsBackend) => void> = [];
// Warn on first overflow.
let hasWarnedOverflow = false;

function enqueue(replay: (b: AnalyticsBackend) => void): void {
  if (pending.length >= MAX_BUFFERED_CALLS) {
    if (!hasWarnedOverflow && process.env.NODE_ENV !== "production") {
      hasWarnedOverflow = true;

      console.warn(
        `[analytics] Buffered ${MAX_BUFFERED_CALLS} events without a backend; ` +
          `dropping oldest. Did you forget to call registerAnalytics() at app startup?`,
      );
    }
    pending.shift();
  }
  pending.push(replay);
}

const bufferingBackend: AnalyticsBackend = {
  capture: (event, properties) => {
    enqueue((b) => b.capture(event, properties));
  },
  captureException: (error, properties) => {
    enqueue((b) => b.captureException(error, properties));
  },
};

let backend: AnalyticsBackend = bufferingBackend;

/** Wires {@link captureEvent}/{@link captureException} to a platform's posthog client. Call once at app startup, next to posthog init. */
export function registerAnalytics(b: AnalyticsBackend): void {
  backend = b;
  hasWarnedOverflow = false;
  const queued = pending;
  pending = [];
  for (const replay of queued) {
    replay(b);
  }
}

/** Sends a strongly-typed event to posthog (wired up per-platform via {@link registerAnalytics}). */
export function captureEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties,
): void {
  backend.capture(event, {
    ...properties,
    [SLACK_PROPERTY]: SEND_TO_SLACK[event],
  });
}

/** Reports an exception to posthog (wired up per-platform via {@link registerAnalytics}). */
export function captureException(
  event: ExceptionEvent,
  error: unknown,
  properties?: AnalyticsProperties,
): void {
  backend.captureException(error, {
    event,
    properties: {
      ...properties,
      [SLACK_PROPERTY]: SEND_TO_SLACK[event],
    },
  });
}
