import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { Relations } from 'src/utils/Repository';
import { ImagesService } from 'src/images/images.service';
import { ConversationService } from 'src/messaging/conversation.service';
import { CreateCommunityDto, UpdateCommunityDto } from './dto/community.dto';
import { DEFAULT_TIME_ZONE, User } from 'src/user/entities/user.entity';
import { CreateNotifParams, NotifsService } from 'src/notifs/notifs.service';
import { run } from 'src/utils/promise';
import { NotificationCategory } from 'src/notifs/entities/notification.entity';
import { groupUrl } from 'src/search/approutes';
import { CommunityMemberContactInfoDto } from 'src/user/dto/user-action-relations.dto';
import { getContactInfo } from 'src/utils/user';
import {
  CommunityInvite,
  CommunityInviteStatus,
} from './entities/community-invite.entity';
import {
  CreateCommunityInviteDto,
  RequestCommunityInviteDto,
} from 'src/user/dto/invite.dto';

const COMMUNITY_DEFAULT_RELATIONS: Readonly<Relations<Community>> =
  Object.freeze({
    users: true,
    leaders: true,
  });

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityInvite)
    private readonly communityInviteRepository: Repository<CommunityInvite>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly conversationService: ConversationService,
    private readonly imagesService: ImagesService,
    private readonly notifsService: NotifsService,
  ) {}

  async findOneOrFail(
    id: number,
    relations?: Relations<Community>,
  ): Promise<Community> {
    return this.communityRepository.findOneOrFail({
      where: { id },
      relations: relations ?? COMMUNITY_DEFAULT_RELATIONS,
    });
  }

  async createCommunityAdmin(body: CreateCommunityDto): Promise<Community> {
    if (body.photo?.startsWith('data:')) {
      body.photo = await this.imagesService.processAndUploadProfileImage(
        body.photo,
      );
    }
    const community = this.communityRepository.create(body);
    const savedCommunity = await this.communityRepository.save(community);
    await this.conversationService.syncCommunityConversationMembers(
      savedCommunity.id,
    );
    return savedCommunity;
  }

  async createCommunity(
    userId: number,
    body: CreateCommunityDto,
  ): Promise<Community> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    if (body.name.trim().length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }

    if (body.photo?.startsWith('data:')) {
      body.photo = await this.imagesService.processAndUploadProfileImage(
        body.photo,
      );
    }

    const community = this.communityRepository.create({
      ...body,
      name: body.name.trim(),
      leaders: [user],
      users: [user],
    });
    const savedCommunity = await this.communityRepository.save(community);
    await this.conversationService.syncCommunityConversationMembers(
      savedCommunity.id,
    );
    return savedCommunity;
  }

  async findAllCommunities(): Promise<Community[]> {
    const communities = await this.communityRepository.find({
      relations: COMMUNITY_DEFAULT_RELATIONS,
    });
    return communities.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findPublicCommunities(): Promise<Community[]> {
    const communities = await this.communityRepository.find({
      where: {
        public: true,
      },
      relations: COMMUNITY_DEFAULT_RELATIONS,
    });
    return communities.sort((a, b) => a.name.localeCompare(b.name));
  }

  async addUserToCommunityAndRefreshConversation(params: {
    user: Pick<User, 'id' | 'name'> & DeepPartial<User>;
    community: Community;
    notifForLeader: (params: { leader: User }) => CreateNotifParams | null;
  }): Promise<Community> {
    const { user, community, notifForLeader } = params;

    if (community.users.some((existing) => existing.id === user.id)) {
      return community;
    }

    const notifs: CreateNotifParams[] = community
      .leaders!.map((leader) => notifForLeader({ leader }))
      .filter((notif) => !!notif);

    const updatedCommunityP = run(async () => {
      const updates = await this.communityRepository.save({
        id: community.id,
        users: [...community.users, user],
      });

      await this.conversationService.syncCommunityConversationMembers(
        community.id,
      );

      return { ...community, ...updates };
    });
    const [updated] = await Promise.all([
      updatedCommunityP,
      this.notifsService.sendNotifs(notifs),
      this.userRepository.save({
        id: user.id,
        undergoingGroupAssignment: false,
        pendingCommunity: null,
      }),
    ]);

    return updated;
  }

  async removeUserFromCommunityAndRefreshConversation(params: {
    user: User;
    community: Community;
    removeAsLeader: boolean;
    notifForLeader: (params: { leader: User }) => CreateNotifParams | null;
    saveAsPendingCommunity: boolean;
  }): Promise<Community> {
    const {
      user,
      community,
      removeAsLeader,
      notifForLeader,
      saveAsPendingCommunity,
    } = params;
    const newLeaders = removeAsLeader
      ? community.leaders!.filter((l) => l.id !== user.id)
      : community.leaders!;
    const newLeaderIds = new Set(newLeaders.map((l) => l.id));

    if (newLeaderIds.has(user.id)) {
      // user is not removed, no further action needed
      return community;
    }
    const newMembers = community.users.filter((u) => u.id !== user.id);

    const notifs = newLeaders!
      .map((leader) => notifForLeader({ leader }))
      .filter((notif) => !!notif);

    const updatedCommunityP = run(async () => {
      const updates = await this.communityRepository.save({
        id: community.id,
        users: newMembers,
        leaders: newLeaders,
      });
      await this.conversationService.syncCommunityConversationMembers(
        community.id,
      );

      return { ...community, ...updates };
    });

    const [updatedCommunity] = await Promise.all([
      updatedCommunityP,
      this.notifsService.sendNotifs(notifs),
      saveAsPendingCommunity
        ? this.userRepository.save({
            id: user.id,
            pendingCommunity: {
              id: community.id,
            },
          })
        : null,
    ]);

    return updatedCommunity;
  }

  async joinPublicCommunity(
    userId: number,
    communityId: number,
  ): Promise<Community> {
    const community = await this.communityRepository.findOneOrFail({
      where: {
        id: communityId,
        public: true,
      },
      relations: {
        users: true,
        leaders: true,
      },
    });

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: {
        communities: { leaders: true, users: true },
      },
    });

    if (community.users.some((existing) => existing.id === userId)) {
      throw new BadRequestException(
        'User is already a member of this community',
      );
    }

    if (
      community.users.length - community.leaders!.length >=
      community.maxCapacity!
    ) {
      throw new BadRequestException('Community is full');
    }

    const [addedCommunity] = await Promise.all([
      this.addUserToCommunityAndRefreshConversation({
        user,
        community,
        notifForLeader: ({ leader }) => ({
          user: leader,
          category: NotificationCategory.MemberJoinedCommunity,
          message: `${user.name} joined your public group (${community.name})`,
          webAppLocation: groupUrl({
            tab: 'members',
            communityId: community.id,
          }),
          associatedUsers: [user],
        }),
      }),
      ...user.communities.map((community) =>
        this.removeUserFromCommunityAndRefreshConversation({
          user,
          community,
          removeAsLeader: false,
          notifForLeader: ({ leader }) => ({
            user: leader,
            category: NotificationCategory.MemberLeftCommunity,
            message: `${user.name} left your group (${community.name})`,
            webAppLocation: groupUrl({
              tab: 'members',
              communityId: community.id,
            }),
            associatedUsers: [user],
          }),
          saveAsPendingCommunity: false,
        }),
      ),
    ]);

    return addedCommunity;
  }

  async updateCommunity(
    communityId: number,
    body: UpdateCommunityDto,
    userId: number,
  ): Promise<Community> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    if (!user.leaderOfIds.some((cid) => cid === communityId) && !user.admin) {
      throw new BadRequestException();
    }

    const community = await this.findOneOrFail(communityId);

    const { name, photo, ...updateData } = body;

    community.name = name?.trim() ?? community.name;
    if (community.name.length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }

    if (photo?.startsWith('data:')) {
      const key = await this.imagesService.processAndUploadProfileImage(photo);

      const updateDataWithPhoto = {
        ...updateData,
        photo: key,
      };

      Object.assign(community, updateDataWithPhoto);
    } else {
      Object.assign(community, updateData);
      if (photo !== undefined) {
        community.photo = photo;
      }
    }

    const updated = await this.communityRepository.save(community);
    await this.conversationService.syncCommunityConversationMembers(updated.id);
    return updated;
  }

  async removeUserFromCommunity(params: {
    userId: number;
    removeeId: number;
    communityId: number;
  }) {
    const { userId, removeeId, communityId } = params;

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    if (!user.leaderOfIdSet.has(communityId)) {
      throw new BadRequestException();
    }
    if (userId === removeeId) {
      throw new BadRequestException(
        'You cannot remove yourself from your own community',
      );
    }

    const [community, removee] = await Promise.all([
      this.findOneOrFail(communityId),
      this.userRepository.findOneOrFail({
        where: { id: removeeId },
      }),
    ]);

    const updatedCommunityP =
      this.removeUserFromCommunityAndRefreshConversation({
        user: removee,
        community,
        removeAsLeader: true,
        notifForLeader: ({ leader }) => {
          if (leader.id === user.id) {
            // do not notify self
            return null;
          }

          return {
            user: leader,
            category: NotificationCategory.RemovedFromCommunityForLeader,
            message: `${user.name} removed ${removee.name} from your group (${community.name})`,
            webAppLocation: groupUrl({
              tab: 'members',
              communityId: community.id,
            }),
            associatedUsers: [removee, user],
          };
        },
        saveAsPendingCommunity: false,
      });

    const notif: CreateNotifParams = {
      user: removee,
      category: NotificationCategory.RemovedFromCommunity,
      message: `${user.name} removed you from their group (${community.name})`,
      webAppLocation: groupUrl({
        tab: 'groups',
      }),
      associatedUsers: [user],
    };
    const [updatedCommunity] = await Promise.all([
      updatedCommunityP,
      this.notifsService.sendNotif(notif),
    ]);

    return updatedCommunity;
  }

  async removeUserFromCommunityAdmin(
    communityId: number,
    userId: number,
  ): Promise<Community> {
    const community = await this.findOneOrFail(communityId);
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });

    const updatedCommunityP =
      this.removeUserFromCommunityAndRefreshConversation({
        user,
        community,
        removeAsLeader: true,
        notifForLeader: ({ leader }) => {
          return {
            user: leader,
            category: NotificationCategory.RemovedFromCommunityForLeader,
            message: `Alliance staff removed ${user.name} from your group (${community.name})`,
            webAppLocation: groupUrl({
              tab: 'members',
              communityId: community.id,
            }),
            associatedUsers: [user],
          };
        },
        saveAsPendingCommunity: false,
      });

    const notifP = this.notifsService.sendNotif({
      user,
      category: NotificationCategory.RemovedFromCommunity,
      message: `Alliance staff removed you from your group (${community.name})`,
      webAppLocation: groupUrl({
        tab: 'groups',
      }),
      associatedUsers: [],
    });

    const [updatedCommunity] = await Promise.all([updatedCommunityP, notifP]);
    return updatedCommunity;
  }

  async leaveCommunity(communityId: number, userId: number): Promise<void> {
    const community = await this.communityRepository.findOneOrFail({
      where: {
        id: communityId,
      },
      relations: {
        users: true,
        leaders: true,
      },
    });
    const user = community.users.find((user) => user.id === userId);
    if (!user) {
      throw new BadRequestException('User not found in community');
    }
    if (
      community.leaders!.length === 1 &&
      community.leaders![0].id === userId
    ) {
      throw new BadRequestException(
        'You cannot leave as the last leader of the community',
      );
    }

    await this.removeUserFromCommunityAndRefreshConversation({
      user,
      community,
      removeAsLeader: true,
      notifForLeader: ({ leader }) => ({
        user: leader,
        category: NotificationCategory.MemberLeftCommunity,
        message: `${user.name} left your group (${community.name})`,
        webAppLocation: groupUrl({
          tab: 'members',
          communityId: community.id,
        }),
        associatedUsers: [user],
      }),
      saveAsPendingCommunity: false,
    });
  }

  async deleteCommunity(userId: number, communityId: number): Promise<void> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId, communities: { id: communityId } },
      relations: { communities: { users: true } },
    });
    if (!user.leaderOfIds.some((cid) => cid === communityId)) {
      throw new BadRequestException();
    }
    if (!user.communities.length) {
      throw new NotFoundException();
    }
    if (user.communities.length !== 1) {
      throw new InternalServerErrorException('Multiple communities found');
    }
    const community = user.communities[0];
    if (community.users.some((user) => user.id !== userId)) {
      throw new BadRequestException(
        'User cannot delete community with other members',
      );
    }
    await this.communityRepository.delete(communityId);
  }

  async deleteCommunityAdmin(communityId: number): Promise<void> {
    await this.communityRepository.delete(communityId);
  }

  async addUserToCommunityAdmin(params: {
    communityId: number;
    userId: number;
  }): Promise<Community> {
    const { communityId, userId } = params;

    const [community, user] = await Promise.all([
      this.findOneOrFail(communityId),
      this.userRepository.findOneOrFail({ where: { id: userId } }),
    ]);

    return this.addUserToCommunityAndRefreshConversation({
      user,
      community,
      notifForLeader: ({ leader }) => ({
        user: leader,
        category: NotificationCategory.MemberJoinedCommunity,
        message: `Staff added ${user.name} to your group (${community.name})`,
        webAppLocation: groupUrl({
          tab: 'members',
          communityId: community.id,
        }),
        associatedUsers: [user],
      }),
    });
  }

  async addLeaderAdmin(
    communityId: number,
    userId: number,
  ): Promise<Community> {
    const [community, user] = await Promise.all([
      this.findOneOrFail(communityId),
      this.userRepository.findOneOrFail({ where: { id: userId } }),
    ]);

    if (!community.users.some((existing) => existing.id === userId)) {
      community.users.push(user);
    }

    if (!community.leaders!.some((existing) => existing.id === userId)) {
      community.leaders!.push(user);
    }

    const updated = await this.communityRepository.save(community);
    await this.conversationService.syncCommunityConversationMembers(updated.id);
    return updated;
  }

  async removeLeaderAdmin(
    communityId: number,
    userId: number,
  ): Promise<Community> {
    const community = await this.findOneOrFail(communityId);

    community.leaders = (community.leaders ?? []).filter(
      (leader) => leader.id !== userId,
    );

    const updated = await this.communityRepository.save(community);
    await this.conversationService.syncCommunityConversationMembers(updated.id);
    return updated;
  }

  async findUserCommunities(userId: number): Promise<Community[]> {
    const user = await this.userRepository.findOneOrFail({
      where: {
        id: userId,
      },
      relations: {
        communities: {
          users: {
            contractEvents: true,
          },
          leaders: true,
        },
      },
    });
    function leaderKey(community: Community) {
      return (community.leaders?.some((leader) => leader.id === userId) ??
        false)
        ? 0
        : 1;
    }
    return user.communities.sort((a, b) => leaderKey(a) - leaderKey(b));
  }

  async getAllMemberContactInfoAdmin(): Promise<
    CommunityMemberContactInfoDto[]
  > {
    const users = await this.userRepository.find({
      relations: { awayRanges: true },
    });

    return getContactInfo({
      users,
      timeZone: DEFAULT_TIME_ZONE,
    });
  }

  async getMemberContactInfo(params: {
    leaderId?: number;
    communityId: number;
  }): Promise<CommunityMemberContactInfoDto[]> {
    const { leaderId, communityId } = params;

    const leaderP =
      leaderId !== undefined
        ? this.userRepository.findOneOrFail({
            where: { id: leaderId },
          })
        : null;
    const community = await this.findOneOrFail(communityId, {
      users: {
        awayRanges: true,
      },
      leaders: true,
    });

    if (
      leaderId !== undefined &&
      !community.leaders!.some((leader) => leader.id === leaderId)
    ) {
      throw new BadRequestException('User is not a leader of this community');
    }

    const leader = await leaderP;
    return getContactInfo({
      users: community.users,
      timeZone: leader?.timeZone ?? DEFAULT_TIME_ZONE,
    });
  }

  async createCommunityInvite(
    body: CreateCommunityInviteDto,
    userId: number,
  ): Promise<CommunityInvite> {
    const { invitedUserId, communityId } = body;

    const invitedUser = await this.userRepository.findOneOrFail({
      where: { id: invitedUserId },
    });
    const community = await this.findOneOrFail(communityId);
    const invitingUser = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    if (!invitingUser.admin && !invitingUser.leaderOfIdSet.has(communityId)) {
      throw new BadRequestException('User is not a leader of this community');
    }

    const existingInvites = await this.communityInviteRepository.find({
      where: {
        invitedUser: { id: invitedUserId },
        community: { id: communityId },
        deletedAt: IsNull(),
      },
    });
    if (
      existingInvites.some(
        (invite) => invite.status === CommunityInviteStatus.InviteePending,
      )
    ) {
      throw new BadRequestException(
        'User has already been invited to this community',
      );
    }

    const invite = this.communityInviteRepository.create({
      invitedUser,
      community,
      invitingUser,
      status: CommunityInviteStatus.InviteePending,
    });
    const notif: CreateNotifParams = {
      user: invitedUser,
      category: NotificationCategory.CommunityInviteCreated,
      message: `${invitingUser.name} invited you to join their group (${community.name})`,
      webAppLocation: groupUrl({
        tab: 'groups',
      }),
      associatedUsers: [invitingUser],
    };

    const [savedInvite] = await Promise.all([
      this.communityInviteRepository.save(invite),
      this.notifsService.sendNotif(notif),
    ]);
    return savedInvite;
  }

  async deleteCommunityInvite(inviteId: number, userId: number): Promise<void> {
    const invite = await this.communityInviteRepository.findOneOrFail({
      where: { id: inviteId, deletedAt: IsNull() },
      relations: { invitingUser: true, community: true },
    });
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: { leaderOf: true },
    });

    if (
      !(
        invite.invitingUser?.id === userId ||
        user.leaderOf.some((leader) => leader.id === invite.community?.id) ||
        user.admin
      )
    ) {
      throw new BadRequestException();
    }
    await this.communityInviteRepository.update(inviteId, {
      deletedAt: new Date(),
    });
  }

  async requestCommunityInvite(
    body: RequestCommunityInviteDto,
    userId: number,
  ): Promise<CommunityInvite> {
    const { communityId, invitedUserId } = body;

    const invitingUserP = this.userRepository.findOne({
      where: { id: userId, communities: { id: communityId } },
    });
    const invitedUserP = this.userRepository
      .findOne({
        where: { id: invitedUserId },
        relations: {
          communities: true,
        },
      })
      .then((user) => {
        return user;
      });
    const communityP = this.communityRepository.findOne({
      where: { id: communityId },
    });

    const existingInvites = await this.communityInviteRepository.find({
      where: {
        invitedUser: { id: invitedUserId },
        community: { id: communityId },
        deletedAt: IsNull(),
      },
    });
    if (
      existingInvites.some(
        (invite) =>
          invite.status === CommunityInviteStatus.RequestPending ||
          invite.status === CommunityInviteStatus.InviteePending,
      )
    ) {
      throw new BadRequestException(
        'This user already has a pending invite to this community.',
      );
    }

    const invitedUser = await invitedUserP;
    if (
      !invitedUser ||
      invitedUser.communities.some((c) => c.id === communityId)
    ) {
      throw new BadRequestException(
        'Invited user is already a member of the community',
      );
    }

    const invitingUser = await invitingUserP;
    if (!invitingUser) {
      throw new BadRequestException('Inviting user not found');
    }

    const community = await communityP;
    if (!community) {
      throw new BadRequestException('Community not found');
    }
    const invite = this.communityInviteRepository.create({
      invitedUser,
      community,
      invitingUser,
      status: CommunityInviteStatus.RequestPending,
    });
    const savedInvite = await this.communityInviteRepository.save(invite);

    sendNotificationToLeaders: {
      const communityWithLeaders = await this.communityRepository.findOne({
        where: { id: communityId },
        relations: { leaders: true },
      });
      if (!communityWithLeaders?.leaders?.length) {
        break sendNotificationToLeaders;
      }
      await this.notifsService.sendNotifs(
        communityWithLeaders.leaders.map(
          (leader) =>
            ({
              user: leader,
              category: NotificationCategory.CommunityInviteRequestCreated,
              message: `${invitingUser.name} requested an invite for ${invitedUser.name} (${community.name})`,
              webAppLocation: groupUrl({
                tab: 'invites',
                communityId: community.id,
              }),
              associatedUsers: [invitingUser, invitedUser],
            }) satisfies CreateNotifParams,
        ),
      );
    }

    return savedInvite;
  }
}
