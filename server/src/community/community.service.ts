import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { Relations } from 'src/utils/Repository';
import { ImagesService } from 'src/images/images.service';
import { ConversationService } from 'src/messaging/conversation.service';
import { CreateCommunityDto } from './dto/community.dto';
import { User } from 'src/user/entities/user.entity';

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
}
