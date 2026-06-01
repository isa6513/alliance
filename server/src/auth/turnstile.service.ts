import { BadRequestException, Injectable, Logger } from '@nestjs/common';

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// siteverify is on the synchronous signup path, so cap how long a slow or hung
// Cloudflare response can stall the request before we fail closed.
const SITEVERIFY_TIMEOUT_MS = 5000;

interface SiteverifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

/**
 * Verifies Cloudflare Turnstile tokens for the public signup endpoint.
 *
 * Enforcement is opt-in: when `TURNSTILE_SECRET_KEY` is unset (local dev, tests,
 * e2e), {@link verify} is a no-op so those flows keep working. Once the secret
 * is configured, every guarded request must carry a token that passes
 * Cloudflare's siteverify check — including the web and mobile signup forms,
 * which each render a Turnstile widget and send its token as `turnstileToken`.
 */
@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);

  async verify(token: string | undefined, remoteIp?: string): Promise<void> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return;
    }

    if (!token) {
      throw new BadRequestException('Captcha required');
    }

    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) {
      body.set('remoteip', remoteIp);
    }

    let result: SiteverifyResponse;
    try {
      const response = await fetch(SITEVERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
      });
      result = (await response.json()) as SiteverifyResponse;
    } catch (err) {
      this.logger.error('Turnstile siteverify request failed', err);
      throw new BadRequestException('Captcha verification failed');
    }

    if (!result.success) {
      this.logger.warn(
        `Turnstile verification rejected: ${result['error-codes']?.join(', ') ?? 'unknown'}`,
      );
      throw new BadRequestException('Captcha verification failed');
    }
  }
}
