import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
  let secondUser: User;
  let secondUserToken: string;

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

    secondUser = await userRepo.save(
      userRepo.create({
        name: 'Community Second User',
        email: 'community.second@example.com',
        password: 'Password123!',
      }),
    );
    secondUserToken = ctx.jwtService.sign(
      { sub: secondUser.id, email: secondUser.email, name: secondUser.name },
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

    describe('joinPublicCommunity', () => {
      it('joins a public community successfully', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Join Public',
            public: true,
            allowMemberInvites: true,
            allowStaffAssignments: true,
            maxCapacity: 10,
            leaders: [testUser],
            users: [testUser],
          }),
        );

        const result = await communityService.joinPublicCommunity(
          secondUser.id,
          community.id,
        );

        expect(result.id).toBe(community.id);
        const refreshed = await communityRepo.findOneOrFail({
          where: { id: community.id },
          relations: { users: true },
        });
        const memberIds = refreshed.users.map((u) => u.id);
        expect(memberIds).toContain(secondUser.id);
      });

      it('throws EntityNotFoundError when community is not public', async () => {
        const privateCommunity = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Join Private',
            public: false,
            allowMemberInvites: true,
            allowStaffAssignments: true,
            maxCapacity: 10,
            leaders: [testUser],
            users: [testUser],
          }),
        );

        await expect(
          communityService.joinPublicCommunity(
            secondUser.id,
            privateCommunity.id,
          ),
        ).rejects.toThrow(EntityNotFoundError);
      });

      it('throws EntityNotFoundError when community does not exist', async () => {
        await expect(
          communityService.joinPublicCommunity(secondUser.id, 999999),
        ).rejects.toThrow(EntityNotFoundError);
      });

      it('throws BadRequestException when user is already a member', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Join Already Member',
            public: true,
            allowMemberInvites: true,
            allowStaffAssignments: true,
            maxCapacity: 10,
            leaders: [testUser],
            users: [testUser, secondUser],
          }),
        );

        await expect(
          communityService.joinPublicCommunity(secondUser.id, community.id),
        ).rejects.toThrow(BadRequestException);
      });

      it('throws BadRequestException when community is at capacity', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Join Full',
            public: true,
            allowMemberInvites: true,
            allowStaffAssignments: true,
            maxCapacity: 0,
            leaders: [testUser],
            users: [testUser],
          }),
        );

        await expect(
          communityService.joinPublicCommunity(secondUser.id, community.id),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('removeUserFromCommunity', () => {
      it('removes a member when called by a leader', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Remove Member',
            leaders: [testUser],
            users: [testUser, secondUser],
          }),
        );

        const result = await communityService.removeUserFromCommunity({
          userId: testUser.id,
          removeeId: secondUser.id,
          communityId: community.id,
        });

        expect(result.id).toBe(community.id);
        const refreshed = await communityRepo.findOneOrFail({
          where: { id: community.id },
          relations: { users: true },
        });
        const memberIds = refreshed.users.map((u) => u.id);
        expect(memberIds).not.toContain(secondUser.id);
        expect(memberIds).toContain(testUser.id);
      });

      it('throws BadRequestException when caller is not a leader', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Remove Member NotLeader',
            leaders: [testUser],
            users: [testUser, secondUser],
          }),
        );

        await expect(
          communityService.removeUserFromCommunity({
            userId: secondUser.id,
            removeeId: testUser.id,
            communityId: community.id,
          }),
        ).rejects.toThrow(BadRequestException);
      });

      it('throws BadRequestException when leader tries to remove themselves', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Remove Self',
            leaders: [testUser],
            users: [testUser, secondUser],
          }),
        );

        await expect(
          communityService.removeUserFromCommunity({
            userId: testUser.id,
            removeeId: testUser.id,
            communityId: community.id,
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('removeUserFromCommunityAdmin', () => {
      it('removes a user from community as admin', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Admin Remove Member',
            leaders: [testUser],
            users: [testUser, secondUser],
          }),
        );

        const result = await communityService.removeUserFromCommunityAdmin(
          community.id,
          secondUser.id,
        );

        expect(result.id).toBe(community.id);
        const refreshed = await communityRepo.findOneOrFail({
          where: { id: community.id },
          relations: { users: true },
        });
        const memberIds = refreshed.users.map((u) => u.id);
        expect(memberIds).not.toContain(secondUser.id);
        expect(memberIds).toContain(testUser.id);
      });

      it('throws when community does not exist', async () => {
        await expect(
          communityService.removeUserFromCommunityAdmin(999999, secondUser.id),
        ).rejects.toThrow(EntityNotFoundError);
      });

      it('throws when user does not exist', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Admin Remove NonexistentUser',
            leaders: [testUser],
            users: [testUser],
          }),
        );

        await expect(
          communityService.removeUserFromCommunityAdmin(community.id, 999999),
        ).rejects.toThrow(EntityNotFoundError);
      });
    });

    describe('updateCommunity', () => {
      it('updates community name and description', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Update Original',
            description: 'Original description',
            leaders: [testUser],
            users: [testUser],
          }),
        );

        const updated = await communityService.updateCommunity(
          community.id,
          { name: 'E2E Update Changed', description: 'New description' },
          testUser.id,
        );

        expect(updated.name).toBe('E2E Update Changed');
        expect(updated.description).toBe('New description');
      });

      it('trims community name', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Update Trim',
            leaders: [testUser],
            users: [testUser],
          }),
        );

        const updated = await communityService.updateCommunity(
          community.id,
          { name: '  Trimmed Update Name  ' },
          testUser.id,
        );

        expect(updated.name).toBe('Trimmed Update Name');
      });

      it('throws BadRequestException when name is empty', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Update EmptyName',
            leaders: [testUser],
            users: [testUser],
          }),
        );

        await expect(
          communityService.updateCommunity(
            community.id,
            { name: '' },
            testUser.id,
          ),
        ).rejects.toThrow(BadRequestException);

        await expect(
          communityService.updateCommunity(
            community.id,
            { name: '   ' },
            testUser.id,
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('throws BadRequestException when user is not a leader of the community', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Update NotLeader',
            leaders: [testUser],
            users: [testUser, secondUser],
          }),
        );

        await expect(
          communityService.updateCommunity(
            community.id,
            { name: 'Should Fail' },
            secondUser.id,
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('updates photo when provided as short string', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Update Photo',
            leaders: [testUser],
            users: [testUser],
          }),
        );

        const updated = await communityService.updateCommunity(
          community.id,
          { photo: 'short-photo-key' },
          testUser.id,
        );

        expect(updated.photo).toBe('short-photo-key');
      });
    });

    describe('deleteCommunity', () => {
      it('deletes community when user is leader and sole member', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Delete Solo Leader',
            leaders: [testUser],
            users: [testUser],
          }),
        );

        await communityService.deleteCommunity(testUser.id, community.id);

        const found = await communityRepo.findOne({
          where: { id: community.id },
        });
        expect(found).toBeNull();
      });

      it('throws BadRequestException when user is not a leader', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Delete NotLeader',
            leaders: [testUser],
            users: [testUser, secondUser],
          }),
        );

        await expect(
          communityService.deleteCommunity(secondUser.id, community.id),
        ).rejects.toThrow(BadRequestException);
      });

      it('throws when user is not a member of the community', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Delete NotMember',
            leaders: [testUser],
            users: [testUser],
          }),
        );

        await expect(
          communityService.deleteCommunity(secondUser.id, community.id),
        ).rejects.toThrow(EntityNotFoundError);
      });

      it('throws BadRequestException when community has other members', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Delete HasMembers',
            leaders: [testUser],
            users: [testUser, secondUser],
          }),
        );

        await expect(
          communityService.deleteCommunity(testUser.id, community.id),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('deleteCommunityAdmin', () => {
      it('deletes community as admin', async () => {
        const community = await communityRepo.save(
          communityRepo.create({
            name: 'E2E Admin Delete',
            leaders: [testUser],
            users: [testUser],
          }),
        );

        await communityService.deleteCommunityAdmin(community.id);

        const found = await communityRepo.findOne({
          where: { id: community.id },
        });
        expect(found).toBeNull();
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

    it('POST /community/:communityId/join joins public community when authenticated', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Join Public',
          public: true,
          allowMemberInvites: true,
          allowStaffAssignments: true,
          maxCapacity: 10,
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/join`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(community.id);
      expect(res.body.name).toBe('E2E HTTP Join Public');
    });

    it('POST /community/:communityId/join returns 401 when unauthenticated', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Join NoAuth',
          public: true,
          allowMemberInvites: true,
          allowStaffAssignments: true,
          maxCapacity: 10,
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer()).post(
        `/community/${community.id}/join`,
      );

      expect(res.status).toBe(401);
    });

    it('POST /community/:communityId/join returns 400 when already a member', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Join AlreadyMember',
          public: true,
          allowMemberInvites: true,
          allowStaffAssignments: true,
          maxCapacity: 10,
          leaders: [testUser],
          users: [testUser],
        }),
      );

      // Join first time
      await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/join`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      // Try joining again
      const res = await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/join`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.status).toBe(400);
    });

    it('PATCH /community/:communityId updates community when authenticated as leader', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Update',
          description: 'Before update',
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .patch(`/community/${community.id}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          name: 'E2E HTTP Updated',
          description: 'After update',
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('E2E HTTP Updated');
      expect(res.body.description).toBe('After update');
    });

    it('PATCH /community/:communityId returns 401 when unauthenticated', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Update NoAuth',
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .patch(`/community/${community.id}`)
        .send({ name: 'Should Fail' });

      expect(res.status).toBe(401);
    });

    it('PATCH /community/:communityId returns 401 when user is not a leader', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Update NonLeader',
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .patch(`/community/${community.id}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ name: 'Should Fail' });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('PATCH /community/:communityId returns 400 when name is empty', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Update EmptyName',
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .patch(`/community/${community.id}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });

    it('POST /community/:communityId/removeMember removes member when authenticated as leader', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Remove Member',
          leaders: [testUser],
          users: [testUser, secondUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/removeMember`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ userId: secondUser.id });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(community.id);
      const refreshed = await communityRepo.findOneOrFail({
        where: { id: community.id },
        relations: { users: true },
      });
      const memberIds = refreshed.users.map((u: User) => u.id);
      expect(memberIds).not.toContain(secondUser.id);
    });

    it('POST /community/:communityId/removeMember returns 400 when not a leader', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Remove Member NotLeader',
          leaders: [testUser],
          users: [testUser, secondUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/removeMember`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ userId: testUser.id });

      expect(res.status).toBe(400);
    });

    it('POST /community/:communityId/removeMember returns 400 when leader tries to remove themselves', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Remove Self',
          leaders: [testUser],
          users: [testUser, secondUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/removeMember`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ userId: testUser.id });

      expect(res.status).toBe(400);
    });

    it('POST /community/:communityId/removeMember returns 401 when unauthenticated', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Remove Member NoAuth',
          leaders: [testUser],
          users: [testUser, secondUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/removeMember`)
        .send({ userId: secondUser.id });

      expect(res.status).toBe(401);
    });

    it('POST /community/:communityId/removeMember/admin removes member when admin', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Admin Remove Member',
          leaders: [testUser],
          users: [testUser, secondUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/removeMember/admin`)
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`)
        .send({ userId: secondUser.id });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(community.id);
      const refreshed = await communityRepo.findOneOrFail({
        where: { id: community.id },
        relations: { users: true },
      });
      const memberIds = refreshed.users.map((u: User) => u.id);
      expect(memberIds).not.toContain(secondUser.id);
    });

    it('POST /community/:communityId/removeMember/admin returns 401 when not admin', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Admin Remove NotAdmin',
          leaders: [testUser],
          users: [testUser, secondUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/removeMember/admin`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ userId: secondUser.id });

      expect(res.status).toBe(401);
    });

    it('POST /community/:communityId/removeMember/admin returns 401 when unauthenticated', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Admin Remove NoAuth',
          leaders: [testUser],
          users: [testUser, secondUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/removeMember/admin`)
        .send({ userId: secondUser.id });

      expect(res.status).toBe(401);
    });

    it('POST /community/:communityId/join returns error for non-public community', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Join Private',
          public: false,
          allowMemberInvites: true,
          allowStaffAssignments: true,
          maxCapacity: 10,
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .post(`/community/${community.id}/join`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('DELETE /community/:communityId deletes community when authenticated as leader and sole member', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Delete Solo',
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .delete(`/community/${community.id}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      const found = await communityRepo.findOne({
        where: { id: community.id },
      });
      expect(found).toBeNull();
    });

    it('DELETE /community/:communityId returns 400 when community has other members', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Delete HasMembers',
          leaders: [testUser],
          users: [testUser, secondUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .delete(`/community/${community.id}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(400);
    });

    it('DELETE /community/:communityId returns 400 when user is not a leader', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Delete NotLeader',
          leaders: [testUser],
          users: [testUser, secondUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .delete(`/community/${community.id}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.status).toBe(400);
    });

    it('DELETE /community/:communityId returns 401 when unauthenticated', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Delete NoAuth',
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer()).delete(
        `/community/${community.id}`,
      );

      expect(res.status).toBe(401);
    });

    it('DELETE /community/:communityId/admin deletes community when admin', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Admin Delete',
          leaders: [testUser],
          users: [testUser, secondUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .delete(`/community/${community.id}/admin`)
        .set('Authorization', `Bearer ${ctx.adminAccessToken}`);

      expect(res.status).toBe(200);
      const found = await communityRepo.findOne({
        where: { id: community.id },
      });
      expect(found).toBeNull();
    });

    it('DELETE /community/:communityId/admin returns 401 when not admin', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Admin Delete NotAdmin',
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer())
        .delete(`/community/${community.id}/admin`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(401);
    });

    it('DELETE /community/:communityId/admin returns 401 when unauthenticated', async () => {
      const community = await communityRepo.save(
        communityRepo.create({
          name: 'E2E HTTP Admin Delete NoAuth',
          leaders: [testUser],
          users: [testUser],
        }),
      );

      const res = await request(ctx.app.getHttpServer()).delete(
        `/community/${community.id}/admin`,
      );

      expect(res.status).toBe(401);
    });
  });

  afterAll(async () => {
    await ctx.app.close();
  });
});
