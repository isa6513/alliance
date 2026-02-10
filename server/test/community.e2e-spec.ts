import { BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { Repository } from 'typeorm';
import { EntityNotFoundError } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { Community } from '../src/community/entities/community.entity';
import {
  CommunityDto,
  CreateCommunityDto,
} from '../src/community/dto/community.dto';
import { CommunityService } from '../src/community/community.service';
import { createTestApp, TestContext } from './e2e-test-utils';

const defaultCreateDto: Pick<
  CreateCommunityDto,
  'public' | 'allowMemberInvites' | 'allowStaffAssignments' | 'maxCapacity'
> = {
  public: false,
  allowMemberInvites: true,
  allowStaffAssignments: true,
  maxCapacity: 10,
};

function createDto(
  overrides: Partial<CreateCommunityDto> & { name: string },
): CreateCommunityDto {
  return { ...defaultCreateDto, ...overrides } as CreateCommunityDto;
}

describe('Community (e2e)', () => {
  let ctx: TestContext;
  let userRepo: Repository<User>;
  let communityRepo: Repository<Community>;
  let communityService: CommunityService;
  let testUser: User;
  let testUserToken: string;

  beforeAll(async () => {
    ctx = await createTestApp([]);
    userRepo = ctx.dataSource.getRepository(User);
    communityRepo = ctx.dataSource.getRepository(Community);
    communityService = ctx.app.get(CommunityService);

    testUser = await userRepo.save(
      userRepo.create({
        name: 'Community Test User',
        email: 'community.test@example.com',
        password: 'Password123!',
      }),
    );
    testUserToken = ctx.jwtService.sign(
      { sub: testUser.id, email: testUser.email, name: testUser.name },
      { secret: process.env.JWT_SECRET },
    );
  }, 50000);

  describe('CommunityService', () => {
    describe('findOneOrFail', () => {
      it('returns community with default relations when it exists', async () => {
        const existing = await communityRepo.save(
          communityRepo.create({
            name: 'Find Me',
            description: 'For findOneOrFail test',
            leaders: [testUser],
            users: [testUser],
          }),
        );

        const found = await communityService.findOneOrFail(existing.id);

        expect(found.id).toBe(existing.id);
        expect(found.name).toBe('Find Me');
        expect(found.users).toBeDefined();
        expect(found.leaders).toBeDefined();
        expect(found.users?.length).toBeGreaterThanOrEqual(1);
        expect(found.leaders?.length).toBeGreaterThanOrEqual(1);
      });

      it('throws when community does not exist', async () => {
        const nonExistentId = 999999;

        await expect(
          communityService.findOneOrFail(nonExistentId),
        ).rejects.toThrow(EntityNotFoundError);
      });
    });

    describe('createCommunity', () => {
      it('creates community with user as leader and member', async () => {
        const body = createDto({
          name: 'User Created Community',
          description: 'Created via createCommunity',
        });

        const community = await communityService.createCommunity(
          testUser.id,
          body,
        );

        expect(community.id).toBeDefined();
        expect(community.name).toBe('User Created Community');
        expect(community.description).toBe('Created via createCommunity');
        expect(community.users?.length).toBe(1);
        expect(community.leaders?.length).toBe(1);
        expect(community.users?.[0].id).toBe(testUser.id);
        expect(community.leaders?.[0].id).toBe(testUser.id);
      });

      it('trims community name', async () => {
        const body = createDto({
          name: '  Trimmed Name  ',
          description: 'Name should be trimmed',
        });

        const community = await communityService.createCommunity(
          testUser.id,
          body,
        );

        expect(community.name).toBe('Trimmed Name');
      });

      it('throws BadRequestException when name is empty', async () => {
        await expect(
          communityService.createCommunity(
            testUser.id,
            createDto({ name: '', description: 'Empty name' }),
          ),
        ).rejects.toThrow(BadRequestException);

        await expect(
          communityService.createCommunity(
            testUser.id,
            createDto({ name: '   ', description: 'Whitespace only name' }),
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('throws when user does not exist', async () => {
        await expect(
          communityService.createCommunity(
            999999,
            createDto({ name: 'No User', description: 'User does not exist' }),
          ),
        ).rejects.toThrow();
      });
    });

    describe('findAllCommunities', () => {
      const SORTED_PREFIX = 'E2E Sorted ';
      it('returns all communities sorted by name', async () => {
        const names = [
          `${SORTED_PREFIX}Zulu`,
          `${SORTED_PREFIX}Alpha`,
          `${SORTED_PREFIX}Mike`,
        ];
        await communityRepo.save(
          names.map((name) =>
            communityRepo.create({
              name,
              leaders: [testUser],
              users: [testUser],
            }),
          ),
        );

        const result = await communityService.findAllCommunities();
        const ours = result.filter((c) => c.name.startsWith(SORTED_PREFIX));

        expect(ours.length).toBe(3);
        expect(ours.map((c) => c.name)).toEqual([
          `${SORTED_PREFIX}Alpha`,
          `${SORTED_PREFIX}Mike`,
          `${SORTED_PREFIX}Zulu`,
        ]);
        expect(ours[0].users).toBeDefined();
        expect(ours[0].leaders).toBeDefined();
      });
    });

    describe('findPublicCommunities', () => {
      const PUBLIC_PREFIX = 'E2E Public ';
      it('returns only public communities sorted by name', async () => {
        await communityRepo.save(
          communityRepo.create({
            name: `${PUBLIC_PREFIX}Zulu`,
            public: true,
            leaders: [testUser],
            users: [testUser],
          }),
        );
        await communityRepo.save(
          communityRepo.create({
            name: `${PUBLIC_PREFIX}Alpha`,
            public: true,
            leaders: [testUser],
            users: [testUser],
          }),
        );
        await communityRepo.save(
          communityRepo.create({
            name: `${PUBLIC_PREFIX}Private`,
            public: false,
            leaders: [testUser],
            users: [testUser],
          }),
        );

        const result = await communityService.findPublicCommunities();
        const ours = result.filter((c) => c.name.startsWith(PUBLIC_PREFIX));

        expect(ours.length).toBe(2);
        expect(ours.map((c) => c.name)).toEqual([
          `${PUBLIC_PREFIX}Alpha`,
          `${PUBLIC_PREFIX}Zulu`,
        ]);
        expect(ours[0].users).toBeDefined();
        expect(ours[0].leaders).toBeDefined();
      });
    });

    describe('createCommunityAdmin', () => {
      it('creates community without requiring a user', async () => {
        const body = createDto({
          name: 'Admin Created Community',
          description: 'Created via createCommunityAdmin',
        });

        const community = await communityService.createCommunityAdmin(body);

        expect(community.id).toBeDefined();
        expect(community.name).toBe('Admin Created Community');
        expect(community.description).toBe('Created via createCommunityAdmin');
      });

      it('accepts optional photo when short (no upload)', async () => {
        const body = createDto({
          name: 'Community With Short Photo',
          description: 'Short photo key',
          photo: 'short',
        });

        const community = await communityService.createCommunityAdmin(body);

        expect(community.id).toBeDefined();
        expect(community.name).toBe('Community With Short Photo');
        expect(community.photo).toBe('short');
      });
    });
  });

  describe('CommunityController', () => {
    it('POST /community/create creates community when authenticated', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/community/create')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          name: 'HTTP Created Community',
          description: 'Via controller',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('HTTP Created Community');
      expect(res.body.description).toBe('Via controller');
      expect(res.body.id).toBeDefined();
    });

    it('POST /community/create rejects empty name with 400', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/community/create')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          name: '',
          description: 'Empty name',
        });

      expect(res.status).toBe(400);
    });

    it('POST /community/create returns 401 when unauthenticated', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/community/create')
        .send({
          name: 'No Auth',
          description: 'Should fail',
        });

      expect(res.status).toBe(401);
    });

    it('POST /community/create/admin creates community when admin', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/community/create/admin')
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
        .send({
          name: 'Admin HTTP Community',
          description: 'Via admin endpoint',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Admin HTTP Community');
      expect(res.body.id).toBeDefined();
    });

    it('POST /community/create/admin returns 401 when not admin', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/community/create/admin')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          name: 'Non-Admin Tries Admin',
          description: 'Should fail',
        });

      expect(res.status).toBe(401);
    });

    it('GET /community/list returns communities when admin', async () => {
      // Ensure at least one community exists
      await communityService.createCommunityAdmin(
        createDto({ name: 'Listed Community', description: 'For list test' }),
      );

      const res = await request(ctx.app.getHttpServer())
        .get('/community/list')
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const names = res.body.map((c: CommunityDto) => c.name);
      expect(names).toContain('Listed Community');
    });

    it('GET /community/list returns communities sorted by name', async () => {
      const alphaName = 'E2E List Alpha Group';
      const zuluName = 'E2E List Zulu Group';
      await communityService.createCommunityAdmin(
        createDto({ name: zuluName, description: 'z' }),
      );
      await communityService.createCommunityAdmin(
        createDto({ name: alphaName, description: 'a' }),
      );

      const res = await request(ctx.app.getHttpServer())
        .get('/community/list')
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`);

      expect(res.status).toBe(200);
      const names = res.body.map((c: { name: string }) => c.name);
      const alphaIdx = names.indexOf(alphaName);
      const zuluIdx = names.indexOf(zuluName);
      expect(alphaIdx).toBeGreaterThanOrEqual(0);
      expect(zuluIdx).toBeGreaterThanOrEqual(0);
      expect(alphaIdx).toBeLessThan(zuluIdx);
    });

    it('GET /community/list returns 401 when not admin', async () => {
      const res = await request(ctx.app.getHttpServer())
        .get('/community/list')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(401);
    });

    it('GET /community/list returns 401 when unauthenticated', async () => {
      const res = await request(ctx.app.getHttpServer()).get('/community/list');

      expect(res.status).toBe(401);
    });

    it('GET /community/list/public returns only public communities when authenticated', async () => {
      const publicName = 'E2E HTTP Public Group';
      const privateName = 'E2E HTTP Private Group';
      await communityService.createCommunityAdmin(
        createDto({ name: publicName, description: 'public', public: true }),
      );
      await communityService.createCommunityAdmin(
        createDto({ name: privateName, description: 'private', public: false }),
      );

      const res = await request(ctx.app.getHttpServer())
        .get('/community/list/public')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const names = res.body.map((c: CommunityDto) => c.name);
      expect(names).toContain(publicName);
      expect(names).not.toContain(privateName);
    });

    it('GET /community/list/public returns communities sorted by name', async () => {
      const alphaName = 'E2E ListPub Alpha';
      const zuluName = 'E2E ListPub Zulu';
      await communityService.createCommunityAdmin(
        createDto({ name: zuluName, description: 'z', public: true }),
      );
      await communityService.createCommunityAdmin(
        createDto({ name: alphaName, description: 'a', public: true }),
      );

      const res = await request(ctx.app.getHttpServer())
        .get('/community/list/public')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      const names = res.body.map((c: { name: string }) => c.name);
      const alphaIdx = names.indexOf(alphaName);
      const zuluIdx = names.indexOf(zuluName);
      expect(alphaIdx).toBeGreaterThanOrEqual(0);
      expect(zuluIdx).toBeGreaterThanOrEqual(0);
      expect(alphaIdx).toBeLessThan(zuluIdx);
    });

    it('GET /community/list/public returns 401 when unauthenticated', async () => {
      const res = await request(ctx.app.getHttpServer()).get(
        '/community/list/public',
      );

      expect(res.status).toBe(401);
    });
  });

  afterAll(async () => {
    await ctx.app.close();
  });
});
