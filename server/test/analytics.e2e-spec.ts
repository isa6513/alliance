import * as request from 'supertest';
import { createTestApp, TestContext } from './e2e-test-utils';
import { AnalyticsModule } from 'src/analytics/analytics.module';

describe('Analytics (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp([AnalyticsModule]);
  }, 50000);

  afterAll(async () => {
    await ctx.app.close();
  });

  it('returns cached time spent metrics', async () => {
    const recent = await request(ctx.app.getHttpServer())
      .get('/analytics/time-spent-per-user')
      .expect(200);

    const total = await request(ctx.app.getHttpServer())
      .get('/analytics/time-spent-per-user-total')
      .expect(200);

    expect(Array.isArray(recent.body)).toBe(true);
    expect(recent.body.length).toBe(0);
    expect(total.body.length).toBe(0);
  });
});
