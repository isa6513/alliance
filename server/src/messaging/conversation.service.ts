import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Community } from 'src/user/entities/community.entity';
import { User } from 'src/user/entities/user.entity';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import {
  Participant,
  ParticipantRole,
  ParticipantState,
} from './entities/participant.entity';
import {
  ConversationDto,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
} from './dto/messaging.dto';
import { MessagingEvents } from './messaging.events';

@Injectable()
export class ConversationService {
  private readonly conversationRelations = [
    'participants',
    'participants.user',
    'participants.lastReadMessage',
    'participants.lastReadMessage.author',
    'community',
  ];

  private readonly participantRelations = [
    'conversation',
    'conversation.participants',
    'conversation.participants.user',
    'conversation.participants.lastReadMessage',
    'conversation.participants.lastReadMessage.author',
    'user',
    'lastReadMessage',
    'lastReadMessage.author',
  ];

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getUserConversations(userId: number): Promise<ConversationDto[]> {
    await this.ensureCommunityMembershipForUser(userId);

    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin(
        'conversation.participants',
        'membership',
        'membership.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'participantUser')
      .leftJoinAndSelect('participant.lastReadMessage', 'participantLastRead')
      .leftJoinAndSelect(
        'participantLastRead.author',
        'participantLastReadAuthor',
      )
      .leftJoinAndSelect('conversation.community', 'community')
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    if (!conversations.length) {
      return [];
    }

    const lastMessages = await this.loadLastMessages(
      conversations.map((conversation) => conversation.id),
    );

    return conversations.map(
      (conversation) =>
        new ConversationDto(conversation, {
          contextUserId: userId,
          lastMessage: lastMessages.get(conversation.id),
        }),
    );
  }

  async createDirectConversation(
    userId: number,
    dto: CreateDirectConversationDto,
  ): Promise<ConversationDto> {
    if (userId === dto.targetUserId) {
      throw new BadRequestException('You cannot message yourself.');
    }

    const [initiator, target] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.userRepository.findOne({ where: { id: dto.targetUserId } }),
    ]);

    if (!initiator) {
      throw new NotFoundException('User not found.');
    }

    if (!target) {
      throw new NotFoundException('Recipient not found.');
    }

    const existingConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin(
        'conversation.participants',
        'initiatorParticipant',
        'initiatorParticipant.userId = :userId',
        { userId },
      )
      .innerJoin(
        'conversation.participants',
        'targetParticipant',
        'targetParticipant.userId = :targetUserId',
        { targetUserId: dto.targetUserId },
      )
      .where('conversation.type = :type', {
        type: ConversationType.Direct,
      })
      .getOne();

    if (existingConversation) {
      const hydrated = await this.getConversationEntity(
        existingConversation.id,
      );
      const lastMessage = await this.findLastMessage(existingConversation.id);
      return new ConversationDto(hydrated, {
        contextUserId: userId,
        lastMessage,
      });
    }

    const conversation = await this.conversationRepository.save(
      this.conversationRepository.create({
        title: dto.title?.trim() || 'Direct message',
        type: ConversationType.Direct,
      }),
    );

    const now = new Date();
    await this.participantRepository.save([
      this.participantRepository.create({
        conversation,
        user: initiator,
        role: ParticipantRole.Member,
        state: ParticipantState.Joined,
        joinedAt: now,
      }),
      this.participantRepository.create({
        conversation,
        user: target,
        role: ParticipantRole.Member,
        state: ParticipantState.Invited,
        joinedAt: now,
      }),
    ]);

    const hydratedConversation = await this.getConversationEntity(
      conversation.id,
    );
    await this.emitConversationUpdate(hydratedConversation);
    return new ConversationDto(hydratedConversation, {
      contextUserId: userId,
    });
  }

  async createGroupConversation(
    userId: number,
    dto: CreateGroupConversationDto,
  ): Promise<ConversationDto> {
    const uniqueParticipantIds = Array.from(
      new Set(dto.participantIds.filter((id) => id !== userId)),
    );

    if (!uniqueParticipantIds.length) {
      throw new BadRequestException(
        'A group conversation requires at least one additional participant.',
      );
    }

    const [owner, participants] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.userRepository.find({
        where: { id: In(uniqueParticipantIds) },
      }),
    ]);

    if (!owner) {
      throw new NotFoundException('User not found.');
    }

    if (participants.length !== uniqueParticipantIds.length) {
      throw new NotFoundException('One or more participants were not found.');
    }

    const conversation = await this.conversationRepository.save(
      this.conversationRepository.create({
        title: dto.title.trim(),
        photo: dto.photo,
        type: ConversationType.Multiple,
      }),
    );

    const now = new Date();
    await this.participantRepository.save([
      this.participantRepository.create({
        conversation,
        user: owner,
        role: ParticipantRole.Owner,
        state: ParticipantState.Joined,
        joinedAt: now,
      }),
      ...participants.map((user) =>
        this.participantRepository.create({
          conversation,
          user,
          role: ParticipantRole.Member,
          state: ParticipantState.Invited,
          joinedAt: now,
        }),
      ),
    ]);

    const hydratedConversation = await this.getConversationEntity(
      conversation.id,
    );
    await this.emitConversationUpdate(hydratedConversation);
    return new ConversationDto(hydratedConversation, {
      contextUserId: userId,
    });
  }

  async acceptInvite(
    conversationId: number,
    userId: number,
  ): Promise<ConversationDto> {
    const participant = await this.getParticipantOrFail(conversationId, userId);

    if (participant.state === ParticipantState.Joined) {
      return this.buildConversationDto(conversationId, userId);
    }

    participant.state = ParticipantState.Joined;
    participant.joinedAt = new Date();
    await this.participantRepository.save(participant);
    await this.touchConversation(conversationId);

    const conversation = await this.getConversationEntity(conversationId);
    await this.emitConversationUpdate(conversation);
    return this.buildConversationDto(conversationId, userId);
  }

  async declineInvite(
    conversationId: number,
    userId: number,
  ): Promise<ConversationDto> {
    const participant = await this.getParticipantOrFail(conversationId, userId);
    await this.participantRepository.remove(participant);
    await this.touchConversation(conversationId);
    const conversation = await this.getConversationEntity(conversationId);
    await this.emitConversationUpdate(conversation);
    return new ConversationDto(conversation, { contextUserId: userId });
  }

  async syncCommunityConversationMembers(
    communityId: number,
  ): Promise<Conversation> {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ['users', 'leaders'],
    });

    if (!community) {
      throw new NotFoundException('Community not found.');
    }

    let conversation = await this.conversationRepository.findOne({
      where: { community: { id: community.id } },
      relations: this.conversationRelations,
    });

    if (!conversation) {
      conversation = await this.conversationRepository.save(
        this.conversationRepository.create({
          title: community.name,
          photo: community.photo,
          type: ConversationType.Community,
          community,
        }),
      );
    } else {
      const needsUpdate =
        conversation.title !== community.name ||
        conversation.photo !== community.photo;
      if (needsUpdate) {
        conversation.title = community.name;
        conversation.photo = community.photo;
        await this.conversationRepository.save(conversation);
      }
    }

    conversation = await this.getConversationEntity(conversation.id);

    const desiredUsers = new Map<number, User>();
    (community.users ?? []).forEach((user) => desiredUsers.set(user.id, user));
    (community.leaders ?? []).forEach((user) =>
      desiredUsers.set(user.id, user),
    );

    const leaderIds = new Set(
      (community.leaders ?? []).map((leader) => leader.id),
    );

    const participantMap = new Map<number, Participant>(
      (conversation.participants ?? []).map((participant) => [
        participant.user.id,
        participant,
      ]),
    );
    const now = new Date();

    for (const [userId, user] of desiredUsers) {
      const existing = participantMap.get(userId);
      const role = leaderIds.has(userId)
        ? ParticipantRole.Admin
        : ParticipantRole.Member;
      if (existing) {
        let shouldUpdate = false;
        if (existing.role !== role) {
          existing.role = role;
          shouldUpdate = true;
        }
        if (existing.state !== ParticipantState.Joined) {
          existing.state = ParticipantState.Joined;
          shouldUpdate = true;
        }
        if (shouldUpdate) {
          existing.joinedAt = existing.joinedAt ?? now;
          await this.participantRepository.save(existing);
        }
      } else {
        await this.participantRepository.save(
          this.participantRepository.create({
            conversation,
            user,
            role,
            state: ParticipantState.Joined,
            joinedAt: now,
          }),
        );
      }
    }

    const removable = (conversation.participants ?? []).filter(
      (participant) => !desiredUsers.has(participant.user.id),
    );
    if (removable.length) {
      await this.participantRepository.remove(removable);
    }

    const updatedConversation = await this.getConversationEntity(
      conversation.id,
    );
    await this.emitConversationUpdate(updatedConversation);
    return updatedConversation;
  }

  async isParticipant(
    conversationId: number,
    userId: number,
  ): Promise<boolean> {
    const count = await this.participantRepository.count({
      where: {
        conversation: { id: conversationId },
        user: { id: userId },
      },
    });
    return count > 0;
  }

  private async ensureCommunityMembershipForUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['communities'],
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await Promise.all(
      (user.communities ?? []).map((community) =>
        this.syncCommunityConversationMembers(community.id),
      ),
    );
  }

  private async getConversationEntity(id: number): Promise<Conversation> {
    return this.conversationRepository.findOneOrFail({
      where: { id },
      relations: this.conversationRelations,
    });
  }

  private async getParticipantOrFail(
    conversationId: number,
    userId: number,
  ): Promise<Participant> {
    const participant = await this.participantRepository.findOne({
      where: {
        conversation: { id: conversationId },
        user: { id: userId },
      },
      relations: this.participantRelations,
    });

    if (!participant) {
      throw new ForbiddenException('You are not part of this conversation.');
    }

    return participant;
  }

  private async buildConversationDto(
    conversationId: number,
    contextUserId?: number,
  ): Promise<ConversationDto> {
    const conversation = await this.getConversationEntity(conversationId);
    const lastMessage = await this.findLastMessage(conversationId);
    return new ConversationDto(conversation, {
      contextUserId,
      lastMessage,
    });
  }

  private async findLastMessage(
    conversationId: number,
  ): Promise<Message | null> {
    return this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.author', 'author')
      .leftJoinAndSelect('message.replyTo', 'replyTo')
      .leftJoinAndSelect('replyTo.author', 'replyToAuthor')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'DESC')
      .limit(1)
      .getOne();
  }

  private async loadLastMessages(
    conversationIds: number[],
  ): Promise<Map<number, Message>> {
    const map = new Map<number, Message>();
    if (!conversationIds.length) {
      return map;
    }

    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.author', 'author')
      .leftJoinAndSelect('message.replyTo', 'replyTo')
      .leftJoinAndSelect('replyTo.author', 'replyToAuthor')
      .leftJoinAndSelect('message.conversation', 'conversation')
      .where('conversation.id IN (:...conversationIds)', { conversationIds })
      .distinctOn(['conversation.id'])
      .orderBy('conversation.id', 'ASC')
      .addOrderBy('message.createdAt', 'DESC')
      .getMany();

    messages.forEach((message) => {
      const conversationId = message.conversation?.id;
      if (conversationId) {
        map.set(conversationId, message);
      }
    });

    return map;
  }

  private async emitConversationUpdate(conversation: Conversation) {
    const dto = new ConversationDto(conversation);
    this.eventEmitter.emit(MessagingEvents.ConversationUpdated, {
      conversationId: conversation.id,
      conversation: dto,
    });
  }

  private async touchConversation(conversationId: number) {
    await this.conversationRepository.update(conversationId, {
      updatedAt: new Date(),
    });
  }
}
