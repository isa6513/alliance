import request from 'supertest';
import type { Repository } from 'typeorm';
import {
  ActionEvent,
  ActionStatus,
} from '../src/actions/entities/action-event.entity';
import { Action, VisibilityMode } from '../src/actions/entities/action.entity';
import { ExternalShareTarget } from '../src/share-urls/entities/external-share-target.entity';
import { ShareUrl } from '../src/share-urls/entities/share-url.entity';
import { createTestApp, TestContext } from './e2e-test-utils';

describe('Share URLs (e2e)', () => {
  let ctx: TestContext;
  let actionRepo: Repository<Action>;
  let eventRepo: Repository<ActionEvent>;
  let targetRepo: Repository<ExternalShareTarget>;
  let shareUrlRepo: Repository<ShareUrl>;
  let action: Action;
  let target: ExternalShareTarget;

  beforeAll(async () => {
    ctx = await createTestApp([]);
    actionRepo = ctx.dataSource.getRepository(Action);
    eventRepo = ctx.dataSource.getRepository(ActionEvent);
    targetRepo = ctx.dataSource.getRepository(ExternalShareTarget);
    shareUrlRepo = ctx.dataSource.getRepository(ShareUrl);

    action = await actionRepo.save(
      actionRepo.create({
        name: 'Share URL Test Action',
        category: 'Test',
        body: 'body',
        taskContents: 'task',
        shortDescription: 'short',
        visibilityMode: VisibilityMode.Public,
        cohortExpression: { type: 'Tag', tagId: ctx.defaultTag.id },
      }),
    );
    await eventRepo.save(
      eventRepo.create({
        title: 'launch',
        description: 'live',
        newStatus: ActionStatus.MemberAction,
        date: new Date(Date.now() - 1000),
        action,
      }),
    );
  }, 50000);

  beforeEach(async () => {
    await shareUrlRepo.query('DELETE FROM share_url');
    await targetRepo.query('DELETE FROM external_share_target');
    target = await targetRepo.save(
      targetRepo.create({
        name: 'Test target',
        url: 'https://example.com/route',
        paramName: 'code',
      }),
    );
  });

  describe('POST /share-urls/get-share-link', () => {
    it('returns 401 without auth', async () => {
      await request(ctx.app.getHttpServer())
        .post('/share-urls/get-share-link')
        .send({ actionId: action.id })
        .expect(401);
    });

    it('returns a URL containing the action route + sid', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/share-urls/get-share-link')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({ actionId: action.id })
        .expect(201);

      expect(res.body.url).toMatch(
        new RegExp(`/actions/${action.id}\\?sid=share-[a-f0-9]{10}$`),
      );
    });

    it('returns the external target URL with paramName=sid appended', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/share-urls/get-share-link')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({ externalTargetId: target.id })
        .expect(201);

      expect(res.body.url).toMatch(
        /^https:\/\/example\.com\/route\?code=share-[a-f0-9]{10}$/,
      );
    });

    it('uses & when the target URL already has a query string', async () => {
      const t = await targetRepo.save(
        targetRepo.create({
          name: 'Pre-query target',
          url: 'https://example.com/route?existing=1',
          paramName: 'code',
        }),
      );
      const res = await request(ctx.app.getHttpServer())
        .post('/share-urls/get-share-link')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({ externalTargetId: t.id })
        .expect(201);

      expect(res.body.url).toMatch(
        /^https:\/\/example\.com\/route\?existing=1&code=share-[a-f0-9]{10}$/,
      );
    });

    it('URL-encodes special characters in paramName', async () => {
      const t = await targetRepo.save(
        targetRepo.create({
          name: 'Funky param',
          url: 'https://example.com/route',
          paramName: 'my code',
        }),
      );
      const res = await request(ctx.app.getHttpServer())
        .post('/share-urls/get-share-link')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({ externalTargetId: t.id })
        .expect(201);

      expect(res.body.url).toMatch(
        /^https:\/\/example\.com\/route\?my\+code=share-[a-f0-9]{10}$/,
      );
    });

    it('returns 400 when neither actionId nor externalTargetId is set', async () => {
      await request(ctx.app.getHttpServer())
        .post('/share-urls/get-share-link')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({})
        .expect(400);
    });

    it('returns 400 when both actionId and externalTargetId are set', async () => {
      await request(ctx.app.getHttpServer())
        .post('/share-urls/get-share-link')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({ actionId: action.id, externalTargetId: target.id })
        .expect(400);
    });

    it('returns 404 for a non-existent actionId', async () => {
      await request(ctx.app.getHttpServer())
        .post('/share-urls/get-share-link')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({ actionId: 999999 })
        .expect(404);
    });

    it('returns 404 for a non-existent externalTargetId', async () => {
      await request(ctx.app.getHttpServer())
        .post('/share-urls/get-share-link')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({ externalTargetId: 999999 })
        .expect(404);
    });
  });

  describe('dedupe / idempotence', () => {
    const fetchUrl = async (
      token: string,
      body: { actionId?: number; externalTargetId?: number },
    ) => {
      const res = await request(ctx.app.getHttpServer())
        .post('/share-urls/get-share-link')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .expect(201);
      return res.body.url as string;
    };

    const sidOf = (url: string): string => {
      const match = /share-[a-f0-9]{10}/.exec(url);
      if (!match) throw new Error(`No sid in url: ${url}`);
      return match[0];
    };

    it('same (user, action) returns same sid across calls', async () => {
      const a = await fetchUrl(ctx.accessToken, { actionId: action.id });
      const b = await fetchUrl(ctx.accessToken, { actionId: action.id });
      expect(sidOf(a)).toBe(sidOf(b));
      const rows = await shareUrlRepo.find({
        where: { user: { id: ctx.testUserId }, action: { id: action.id } },
      });
      expect(rows.length).toBe(1);
    });

    it('same (user, externalTarget) returns same sid across calls', async () => {
      const a = await fetchUrl(ctx.accessToken, {
        externalTargetId: target.id,
      });
      const b = await fetchUrl(ctx.accessToken, {
        externalTargetId: target.id,
      });
      expect(sidOf(a)).toBe(sidOf(b));
      const rows = await shareUrlRepo.find({
        where: {
          user: { id: ctx.testUserId },
          externalTarget: { id: target.id },
        },
      });
      expect(rows.length).toBe(1);
    });

    it('different external targets give the same user distinct sids', async () => {
      const other = await targetRepo.save(
        targetRepo.create({
          name: 'Other',
          url: 'https://example.com/other',
          paramName: 'ref',
        }),
      );
      const a = await fetchUrl(ctx.accessToken, {
        externalTargetId: target.id,
      });
      const b = await fetchUrl(ctx.accessToken, { externalTargetId: other.id });
      expect(sidOf(a)).not.toBe(sidOf(b));
    });

    it('different users get distinct sids for the same external target', async () => {
      const a = await fetchUrl(ctx.accessToken, {
        externalTargetId: target.id,
      });
      const b = await fetchUrl(ctx.adminAccessToken, {
        externalTargetId: target.id,
      });
      expect(sidOf(a)).not.toBe(sidOf(b));
    });

    it('action share and external-target share for one user do not collapse', async () => {
      const a = await fetchUrl(ctx.accessToken, { actionId: action.id });
      const b = await fetchUrl(ctx.accessToken, {
        externalTargetId: target.id,
      });
      expect(sidOf(a)).not.toBe(sidOf(b));
      const rows = await shareUrlRepo.find({
        where: { user: { id: ctx.testUserId } },
      });
      expect(rows.length).toBe(2);
    });
  });

  describe('admin CRUD: /external-share-targets', () => {
    it('GET (admin) returns the list', async () => {
      const res = await request(ctx.app.getHttpServer())
        .get('/external-share-targets')
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.find((t: { id: number }) => t.id === target.id),
      ).toBeDefined();
    });

    it('GET rejects non-admin', async () => {
      await request(ctx.app.getHttpServer())
        .get('/external-share-targets')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .expect(401);
    });

    it('GET requires auth (401 anon)', async () => {
      await request(ctx.app.getHttpServer())
        .get('/external-share-targets')
        .expect(401);
    });

    it('GET /:id returns one (admin)', async () => {
      const res = await request(ctx.app.getHttpServer())
        .get(`/external-share-targets/${target.id}`)
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
        .expect(200);
      expect(res.body.id).toBe(target.id);
      expect(res.body.name).toBe(target.name);
    });

    it('GET /:id rejects non-admin', async () => {
      await request(ctx.app.getHttpServer())
        .get(`/external-share-targets/${target.id}`)
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .expect(401);
    });

    it('POST creates as admin', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/external-share-targets')
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
        .send({
          name: 'Brand new',
          url: 'https://example.com/new',
          paramName: 'r',
        })
        .expect(201);
      expect(res.body.id).toBeGreaterThan(0);
      expect(res.body.name).toBe('Brand new');
      expect(res.body.paramName).toBe('r');
    });

    it('POST rejects non-admin', async () => {
      await request(ctx.app.getHttpServer())
        .post('/external-share-targets')
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({ name: 'x', url: 'https://example.com', paramName: 'r' })
        .expect(401);
    });

    it('PATCH updates as admin', async () => {
      const res = await request(ctx.app.getHttpServer())
        .patch(`/external-share-targets/${target.id}`)
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
        .send({ name: 'Renamed' })
        .expect(200);
      expect(res.body.name).toBe('Renamed');
      expect(res.body.url).toBe(target.url);
    });

    it('PATCH rejects non-admin', async () => {
      await request(ctx.app.getHttpServer())
        .patch(`/external-share-targets/${target.id}`)
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .send({ name: 'Should not apply' })
        .expect(401);
    });

    it('DELETE removes as admin', async () => {
      await request(ctx.app.getHttpServer())
        .delete(`/external-share-targets/${target.id}`)
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
        .expect(200);
      const remaining = await targetRepo.findOne({ where: { id: target.id } });
      expect(remaining).toBeNull();
    });

    it('DELETE rejects non-admin', async () => {
      await request(ctx.app.getHttpServer())
        .delete(`/external-share-targets/${target.id}`)
        .set('Authorization', `Bearer ${ctx.accessToken}`)
        .expect(401);
    });

    it('DELETE returns 404 for unknown id', async () => {
      await request(ctx.app.getHttpServer())
        .delete('/external-share-targets/999999')
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
        .expect(404);
    });
  });
});
