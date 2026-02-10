import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { Relations } from 'src/utils/Repository';
import { ImagesService } from 'src/images/images.service';
import { ConversationService } from 'src/messaging/conversation.service';
import { CreateCommunityDto } from './dto/community.dto';
import { User } from 'src/user/entities/user.entity';
import { CreateNotifParams, NotifsService } from 'src/notifs/notifs.service';
import { run } from 'src/utils/promise';

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

    const updatedP = this.communityRepository.save({
      id: community.id,
      users: [...community.users, user],
    });
    await Promise.all([
      this.notifsService.sendNotifs(notifs),
      this.userRepository.save({
        id: user.id,
        undergoingGroupAssignment: false,
        pendingCommunity: null,
      }),
      updatedP.then((updated) =>
        this.conversationService.syncCommunityConversationMembers(updated.id),
      ),
    ]);

    return updatedP;
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
      const updatedCommunity = await this.communityRepository.save({
        id: community.id,
        users: newMembers,
        leaders: newLeaders,
      });
      await this.conversationService.syncCommunityConversationMembers(
        community.id,
      );

      return updatedCommunity;
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
}
