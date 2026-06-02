import { AnalyticsEvent } from '@alliance/common/analytics';
import type { EventMessage, PostHog } from 'posthog-node';

/**
 * Typed wrapper around `posthog.capture` for the server (posthog-node).
 */
export function captureEvent(
  params: {
    client: PostHog;
    event: AnalyticsEvent;
  } & Omit<EventMessage, 'event'>,
): void {
  const { client, ...message } = params;
  client.capture(message);
}
