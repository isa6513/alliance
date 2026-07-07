import type { ThrottlerOptions } from '@nestjs/throttler';

/**
 * Rate limits for the public `/auth/register` endpoint.
 *
 * Two independent named throttlers are enforced together: a short burst limit
 * and a longer sustained limit. They must be distinct names — stacking two
 * limits under the same throttler name silently overwrites one with the other.
 *
 * This is the single source of truth: spread into `ThrottlerModule.forRoot`
 * (via {@link SIGNUP_THROTTLERS}) so the named throttlers exist, and passed to
 * `@Throttle` on the route so the limits live next to the handler they guard.
 */
export const SIGNUP_THROTTLE: Record<string, ThrottlerOptions> = {
  signupBurst: { limit: 5, ttl: 60 * 1000 }, // 5 per minute
  signupSustained: { limit: 20, ttl: 60 * 60 * 1000 }, // 20 per hour
};

export const ACTION_PARTNERSHIP_RESPONSE_THROTTLE: Record<
  string,
  ThrottlerOptions
> = {
  actionPartnershipResponseBurst: { limit: 3, ttl: 60 * 1000 }, // 3 per minute
  actionPartnershipResponseSustained: { limit: 10, ttl: 60 * 60 * 1000 }, // 10 per hour
};

/** Array form expected by `ThrottlerModule.forRoot()`. */
export const SIGNUP_THROTTLERS = Object.entries(SIGNUP_THROTTLE).map(
  ([name, options]) => ({ name, ...options }),
);

export const ACTION_PARTNERSHIP_RESPONSE_THROTTLERS = Object.entries(
  ACTION_PARTNERSHIP_RESPONSE_THROTTLE,
).map(([name, options]) => ({ name, ...options }));
