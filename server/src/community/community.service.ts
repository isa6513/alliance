import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { Relations } from 'src/utils/Repository';
import { ImagesService } from 'src/images/images.service';
import { ConversationService } from 'src/messaging/conversation.service';
import { CreateCommunityDto, UpdateCommunityDto } from './dto/community.dto';
import { User } from 'src/user/entities/user.entity';
import { CreateNotifParams, NotifsService } from 'src/notifs/notifs.service';
import { run } from 'src/utils/promise';
import { NotificationCategory } from 'src/notifs/entities/notification.entity';
import { groupUrl } from 'src/search/approutes';

const COMMUNITY_DEFAULT_RELATIONS: Readonly<Relations<Community>> =
  Object.freeze({
    users: true,
    leaders: true,
  });

@Injectable()
export class CommunityService {
  constructor(
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
}
