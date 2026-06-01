import request from 'supertest';
import { createTestApp, TestContext } from './e2e-test-utils';

describe('Auth register with Turnstile enabled (e2e)', () => {
  let ctx: TestContext;
  const prevSecret = process.env.TURNSTILE_SECRET_KEY;

  beforeAll(async () => {
    // Enforce captcha: real TurnstileService reads this at verify() time.
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
    ctx = await createTestApp([], { enableTurnstile: true });
  });

  afterAll(async () => {
    if (prevSecret === undefined) {
      delete process.env.TURNSTILE_SECRET_KEY;
    } else {
      process.env.TURNSTILE_SECRET_KEY = prevSecret;
    }
    await ctx.app.close();
  });

  it('rejects registration when called directly without a turnstile token', () => {
    // No siteverify call is made: the service rejects a missing token before
    // ever reaching Cloudflare, so this stays hermetic (no network).
    return request(ctx.app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'no-captcha@test.com',
        password: 'password',
        name: 'No Captcha User',
        mode: 'header',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Captcha required');
      });
  });
});
