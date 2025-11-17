import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from 'src/geo/city.entity';
import { ImagesService } from 'src/images/images.service';
import { MailService } from 'src/mail/mail.service';
import {
  Notification,
  NotificationCategory,
} from 'src/notifs/entities/notification.entity';
import { PaymentUserDataToken } from 'src/payments/entities/payment-token.entity';
import { ILike, In, Repository } from 'typeorm';
import { Action } from 'src/actions/entities/action.entity';
import {
  ActionActivity,
  ActionActivityType,
} from 'src/actions/entities/action-activity.entity';
import { ActionStatus } from 'src/actions/entities/action-event.entity';
import { Friend, FriendStatus } from './entities/friend.entity';
import { PrefillUser } from './entities/prefill-user.entity';
import {
  FriendStatusDto,
  OnboardingDto,
  ProfileDto,
  UpdateProfileDto,
} from './user.dto';
import { User } from './entities/user.entity';
import { profileUrl } from 'src/search/approutes';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './group.dto';
import { Community } from './entities/community.entity';
import { CreateCommunityDto, UpdateCommunityDto } from './community.dto';
import {
  CommunityMemberContactInfoDto,
  CommunityUserInfoDto,
  UserActionRelationDetailDto,
  UserActionRelationsForUserDto,
  UserActionRelationsResponseDto,
  UserActionRelationStatus,
  UserActionSummaryDto,
} from './dto/user-action-relations.dto';
import { OnetimeInvite } from './entities/onetime-invite.entity';
import {
  CommunityInviteDto,
  CreateCommunityInviteDto,
  CreateOnetimeInviteDto,
} from './dto/invite.dto';
import { UserAwayRange } from './entities/user-away-range.entity';
import { CreateAwayRangeDto } from './dto/away-range.dto';
import { Temporal } from '@js-temporal/polyfill';
import {
  CommunityInvite,
  CommunityInviteStatus,
} from './entities/community-invite.entity';

const defaultTimeZone = 'America/Los_Angeles';
const communityDefaultRelations = ['users', 'leaders'] as const;

export interface PWResetJwtPayload {
  sub: number;
  type: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PrefillUser)
    private prefillUserRepository: Repository<PrefillUser>,
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(Notification)
    private notifRepository: Repository<Notification>,
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
    @InjectRepository(ActionActivity)
    private readonly actionActivityRepository: Repository<ActionActivity>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(OnetimeInvite)
    private readonly onetimeInviteRepository: Repository<OnetimeInvite>,
    @InjectRepository(UserAwayRange)
    private readonly userAwayRangeRepository: Repository<UserAwayRange>,
    @InjectRepository(CommunityInvite)
    private readonly communityInviteRepository: Repository<CommunityInvite>,
    private readonly jwtService: JwtService,
    private readonly imagesService: ImagesService,
    private readonly mailService: MailService,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(id: number, data: UpdateProfileDto): Promise<User> {
    const user = await this.findOneOrFail(id);

    if (data.cityId !== undefined) {
      const city =
        (data.cityId
          ? await this.cityRepository.findOne({
              where: { id: data.cityId },
            })
          : undefined) ?? undefined;

      if (data.cityId && !city) {
        throw new BadRequestException('City not found');
      }

      user.city = city;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cityId, profilePicture, hasActiveContract, ...updateData } = data;

    if (!updateData.preferredReminderTime) {
      updateData.preferredReminderTime = undefined;
    }

    if (profilePicture && profilePicture.length > 100) {
      //TODO: differentiate between file and url
      const key = profilePicture
        ? await this.imagesService.processAndUploadProfileImage(profilePicture)
        : undefined;

      const updateDataWithPfp = {
        ...updateData,
        profilePicture: key,
      };

      Object.assign(user, updateDataWithPfp);
    } else {
      Object.assign(user, updateData);
    }

    return this.userRepository.save(user);
  }

  async setPassword(id: number, password: string): Promise<User> {
    const user = await this.findOneOrFail(id);
    user.password = password;
    await user.hashPassword();
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findAllWithFriendRequests(): Promise<User[]> {
    return this.userRepository.find({
      relations: [
        'sentFriendRequests',
        'sentFriendRequests.addressee',
        'receivedFriendRequests',
        'receivedFriendRequests.requester',
      ],
    });
  }

  findOne(id: number, relations?: string[]): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['city', ...(relations ?? [])],
    });
  }

  async findOneByEmail(
    email: string,
    relations?: string[],
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: ILike(email) },
      relations,
    });
  }

  async findOneByReferralCode(referralCode: string): Promise<User | null> {
    return this.userRepository.findOneBy({ referralCode });
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async setAdmin(id: number, admin: boolean): Promise<void> {
    await this.userRepository.update(id, { admin });
  }

  async count(): Promise<number> {
    return this.userRepository.count({
      where: { isNotSignedUpPartialProfile: false },
    });
  }

  async getUserActionRelations(): Promise<UserActionRelationsResponseDto> {
    const users = await this.userRepository.find({
      select: ['id'],
    });
    return this.getActionRelationsForUsers(users.map((user) => user.id));
  }

  async getActionRelationsForUsers(
    userIds: number[],
  ): Promise<UserActionRelationsResponseDto> {
    const actions = (
      await this.actionRepository.find({
        relations: ['events'],
      })
    ).filter(
      (action) =>
        action.status !== ActionStatus.Draft &&
        action.status !== ActionStatus.Completed,
    );

    const actionsSorted = actions.sort((a, b) => {
      const aFirstEvent = (a.events ?? []).reduce(
        (first, event) => {
          return !first || event.date < first.date ? event : first;
        },
        undefined as (typeof a.events)[0] | undefined,
      );
      const bFirstEvent = (b.events ?? []).reduce(
        (first, event) => {
          return !first || event.date < first.date ? event : first;
        },
        undefined as (typeof b.events)[0] | undefined,
      );
      return (
        (aFirstEvent?.date.getTime() ?? 0) -
          (bFirstEvent?.date.getTime() ?? 0) || a.priority - b.priority
      );
    });

    const now = new Date();
    const memberActionPhaseEnded = new Map<number, boolean>();

    for (const action of actionsSorted) {
      const pastEvents = (action.events ?? [])
        .filter((event) => event.date <= now)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      const memberActionIndex = pastEvents.findIndex(
        (event) => event.newStatus === ActionStatus.MemberAction,
      );
      memberActionPhaseEnded.set(
        action.id,
        memberActionIndex !== -1 && memberActionIndex < pastEvents.length - 1,
      );
    }

    const actionSummaries: UserActionSummaryDto[] = actionsSorted.map(
      (action) => ({
        id: action.id,
        name: action.name,
        status: action.status,
      }),
    );

    const actionIds = actionSummaries.map((summary) => summary.id);
    const actionOrder = new Map(actionIds.map((id, index) => [id, index]));

    const activities = await this.actionActivityRepository.find({
      where: { actionId: In(actionIds), userId: In(userIds) },
      select: ['actionId', 'userId', 'type', 'createdAt'],
      order: { createdAt: 'ASC' },
    });

    const statusPriority: Record<UserActionRelationStatus, number> = {
      [UserActionRelationStatus.Completed]: 5,
      [UserActionRelationStatus.WontComplete]: 4,
      [UserActionRelationStatus.Declined]: 3,
      [UserActionRelationStatus.MissedDeadline]: 2,
      [UserActionRelationStatus.Joined]: 1,
      [UserActionRelationStatus.None]: 0,
    };

    const typeToStatus = (
      type: ActionActivityType,
    ): UserActionRelationStatus => {
      switch (type) {
        case ActionActivityType.USER_COMPLETED:
          return UserActionRelationStatus.Completed;
        case ActionActivityType.USER_WONT_COMPLETE:
          return UserActionRelationStatus.WontComplete;
        case ActionActivityType.USER_DECLINED:
          return UserActionRelationStatus.Declined;
        case ActionActivityType.USER_JOINED:
          return UserActionRelationStatus.Joined;
        default:
          return UserActionRelationStatus.None;
      }
    };

    const perUser = new Map<
      number,
      Map<
        number,
        {
          status: UserActionRelationStatus;
          priority: number;
          latestActivityType?: ActionActivityType;
          latestActivityAt?: Date;
        }
      >
    >();

    for (const activity of activities) {
      const status = typeToStatus(activity.type);
      if (status === UserActionRelationStatus.None) {
        continue;
      }

      const userRelations = perUser.get(activity.userId) ?? new Map();
      const existing = userRelations.get(activity.actionId);
      const priority = statusPriority[status];

      if (!existing || priority >= existing.priority) {
        userRelations.set(activity.actionId, {
          status,
          priority,
          latestActivityType: activity.type,
          latestActivityAt: activity.createdAt,
        });
      }

      perUser.set(activity.userId, userRelations);
    }

    for (const [, actionMap] of perUser) {
      for (const [actionId, detail] of actionMap) {
        if (
          detail.status === UserActionRelationStatus.Joined &&
          memberActionPhaseEnded.get(actionId)
        ) {
          detail.status = UserActionRelationStatus.MissedDeadline;
          detail.priority =
            statusPriority[UserActionRelationStatus.MissedDeadline];
        }
      }
    }

    const users: UserActionRelationsForUserDto[] = Array.from(
      perUser.entries(),
    ).map(([userId, actionMap]) => {
      const relations: UserActionRelationDetailDto[] = Array.from(
        actionMap.entries(),
      )
        .map(([actionId, detail]) => ({
          actionId,
          status: detail.status,
          latestActivityType: detail.latestActivityType,
          latestActivityAt: detail.latestActivityAt?.toISOString(),
        }))
        .sort(
          (a, b) =>
            (actionOrder.get(a.actionId) ?? 0) -
            (actionOrder.get(b.actionId) ?? 0),
        );

      return {
        userId,
        relations,
      } satisfies UserActionRelationsForUserDto;
    });

    return {
      actions: actionSummaries,
      users,
    };
  }

  async sendWelcomeEmail(userId: number) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const user = await this.findOneOrFail(userId);
    const token = await this.getVerifyEmailToken(userId);
    const mail = await this.mailService.sendWelcomeEmail(
      user.email,
      user.name,
      token,
    );
    await this.userRepository.update(userId, { welcomeMail: mail });
  }

  async verifyEmail(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    const user = await this.findOneOrFail(payload.sub);
    user.emailVerified = true;
    await this.userRepository.save(user);
  }

  async getVerifyEmailToken(userId: number) {
    const payload = { sub: userId, type: 'verify-email' };
    return this.jwtService.sign(payload, {
      expiresIn: `7d`,
      secret: process.env.JWT_SECRET,
    });
  }

  async isAdmin(id: number): Promise<boolean> {
    const user = await this.findOneOrFail(id);
    return user.admin;
  }

  async isCommunityLeader(email: string): Promise<boolean> {
    const user = await this.findOneByEmail(email, ['leaderOf']);
    if (!user) {
      return false;
    }
    return user.leaderOf?.length > 0;
  }

  async onboarding(userId: number, body: OnboardingDto): Promise<User> {
    const user = await this.findOneOrFail(userId);

    const city = body.cityId
      ? await this.cityRepository.findOne({
          where: { id: body.cityId },
        })
      : null;

    if (city) {
      user.city = city;
    }
    if (body.over18 !== null) {
      user.over18 = body.over18;
    }
    if (body.anonymous !== null) {
      user.anonymous = body.anonymous;
    }

    user.onboardingComplete = true;
    return this.userRepository.save(user);
  }

  /* ───────────────────────────────
   *  Friend-request helpers
   * ─────────────────────────────── */

  async createFriendRequest(
    requesterId: number,
    addresseeId: number,
  ): Promise<Friend> {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Cannot friend yourself');
    }

    const requester = await this.findOneOrFail(requesterId);
    const addressee = await this.findOneOrFail(addresseeId);

    let rel = await this.friendRepository.findOne({
      where: { requester: { id: requesterId }, addressee: { id: addresseeId } },
    });

    if (rel) {
      rel.status = FriendStatus.Pending; // reset to pending / resend
    } else {
      const notif = this.notifRepository.create({
        user: addressee,
        category: NotificationCategory.FriendRequest,
        message: `${requester.name} wants to be friends`,
        webAppLocation: profileUrl(requesterId),
        associatedUsers: [requester],
      });

      rel = this.friendRepository.create({
        requester,
        addressee,
        status: FriendStatus.Pending,
        sentNotif: notif,
      });
    }
    return this.friendRepository.save(rel);
  }

  /** Accept / decline a pending request (requester → addressee). */
  async updateFriendRequestStatus(
    requesterId: number,
    addresseeId: number,
    status: FriendStatus.Accepted | FriendStatus.Declined,
  ): Promise<Friend> {
    const rel = await this.friendRepository.findOne({
      where: {
        requester: { id: requesterId },
        addressee: { id: addresseeId },
        status: FriendStatus.Pending,
      },
      relations: ['requester', 'addressee'],
    });

    if (!rel) {
      throw new NotFoundException('No pending request found');
    }

    rel.status = status;
    if (status === FriendStatus.Accepted) {
      rel.acceptedAt = new Date();
      rel.acceptedNotif = this.notifRepository.create({
        user: rel.requester,
        category: NotificationCategory.FriendRequestAccepted,
        message: `${rel.addressee.name} accepted your friend request`,
        webAppLocation: profileUrl(rel.addressee.id),
        associatedUsers: [rel.addressee],
      });
    }
    return this.friendRepository.save(rel);
  }

  /** Cancel a request OR un-friend an accepted friend in either direction. */
  async removeFriend(userId: number, targetUserId: number): Promise<void> {
    await this.friendRepository
      .createQueryBuilder()
      .delete()
      .where(
        `(requesterId = :u AND addresseeId = :t) OR (requesterId = :t AND addresseeId = :u)`,
        { u: userId, t: targetUserId },
      )
      .execute();
  }

  async findFriends(userId: number): Promise<ProfileDto[]> {
    const rels = await this.friendRepository.find({
      where: [
        { requester: { id: userId }, status: FriendStatus.Accepted },
        { addressee: { id: userId }, status: FriendStatus.Accepted },
      ],
      relations: ['requester', 'addressee'],
    });

    const others = rels.map((r) =>
      r.requester.id === userId ? r.addressee : r.requester,
    );

    return others.map((o) => new ProfileDto(o));
  }

  /**
   * Make two users friends without sending any notifications. Used sed when a user signs up with a referral code.
   */
  async makeFriendsAutomated(
    requesterId: number,
    addresseeId: number,
  ): Promise<void> {
    const requester = await this.findOneOrFail(requesterId);
    const addressee = await this.findOneOrFail(addresseeId);

    const rel = this.friendRepository.create({
      requester,
      addressee,
      status: FriendStatus.Accepted,
    });

    await this.friendRepository.save(rel);
  }

  async findPendingRequests(
    userId: number,
    direction: 'sent' | 'received',
  ): Promise<ProfileDto[]> {
    const rels =
      direction === 'sent'
        ? await this.friendRepository.find({
            where: { requester: { id: userId }, status: FriendStatus.Pending },
            relations: ['addressee'],
          })
        : await this.friendRepository.find({
            where: { addressee: { id: userId }, status: FriendStatus.Pending },
            relations: ['requester'],
          });
    const users =
      direction === 'sent'
        ? rels.map((r) => r.addressee)
        : rels.map((r) => r.requester);

    return users.map((u) => new ProfileDto(u));
  }

  async getRelationshipStatus(
    userId: number,
    targetUserId: number,
  ): Promise<FriendStatusDto> {
    const rel =
      (await this.friendRepository.findOne({
        where: { requester: { id: userId }, addressee: { id: targetUserId } },
        relations: ['requester', 'addressee'],
      })) ||
      (await this.friendRepository.findOne({
        where: { requester: { id: targetUserId }, addressee: { id: userId } },
        relations: ['requester', 'addressee'],
      }));

    const status = rel ? rel.status : FriendStatus.None;
    return {
      status,
      didReceiveRequest:
        status === FriendStatus.Pending && rel?.addressee.id === userId,
    };
  }

  async findOneOrFail(id: number, relations?: string[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations,
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByIds(ids: number[], relations?: string[]): Promise<User[]> {
    return this.userRepository.find({
      where: { id: In(ids) },
      relations,
    });
  }

  async countReferred(id: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['referredUsers'],
    });
    return user?.referredUsers.length ?? 0;
  }

  async getUserLocation(userId: number): Promise<City | undefined> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['city'],
    });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return user.city;
  }

  async findOnePrefill(id: number): Promise<PrefillUser> {
    const user = await this.prefillUserRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async findOneByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: { stripeCustomerId: stripeCustomerId },
    });
  }

  async generatePasswordResetToken(userId: number) {
    const payload: PWResetJwtPayload = { sub: userId, type: 'password-reset' };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: `1d`,
    });
  }

  async setStripeCustomerId(userId: number, stripeCustomerId: string) {
    await this.userRepository.update(userId, { stripeCustomerId });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        isNotSignedUpPartialProfile: false,
      },
    });
  }

  async findActiveUsersWithGroups(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        isNotSignedUpPartialProfile: false,
      },
      relations: ['groups', 'awayRanges'],
    });
  }

  async createPartialProfile(
    body: Pick<PaymentUserDataToken, 'email' | 'firstName' | 'lastName'>,
  ): Promise<User> {
    return this.create({
      email: body.email,
      name: body.firstName + ' ' + body.lastName,
      password: Math.random().toString(36).substring(2, 15), //TODO: they have to reset this but maybe do something better
      isNotSignedUpPartialProfile: true,
    });
  }

  async findByUsername(query: string): Promise<User[]> {
    const users = await this.userRepository.find({
      where: {
        name: ILike(`%${query}%`),
        anonymous: false,
        isNotSignedUpPartialProfile: false,
      },
    });
    return users;
  }

  async signContract(userId: number): Promise<User> {
    const user = await this.findOneOrFail(userId);
    user.contractDateSigned = new Date();
    user.contractDateSuspended = null;
    return this.userRepository.save(user);
  }

  async suspendContract(userId: number): Promise<User> {
    const user = await this.findOneOrFail(userId);
    user.contractDateSuspended = new Date();
    return this.userRepository.save(user);
  }

  async createAwayRange(
    userId: number,
    data: CreateAwayRangeDto,
  ): Promise<UserAwayRange> {
    const startDay = Temporal.PlainDate.from(data.startDay);
    const endDay = Temporal.PlainDate.from(data.endDay);
    const user = await this.findOneOrFail(userId);
    const tz = user.timeZone ?? defaultTimeZone;
    const now = new Date();

    const startDate = startDay
      .toZonedDateTime({
        timeZone: tz,
        plainTime: Temporal.PlainTime.from({ hour: 0 }),
      })
      .toInstant();
    const endDate = endDay
      .toZonedDateTime({
        timeZone: tz,
        plainTime: Temporal.PlainTime.from({ hour: 23, minute: 59 }),
      })
      .toInstant();

    if (startDate.epochMilliseconds >= endDate.epochMilliseconds) {
      throw new BadRequestException('End date must be after start date.');
    }

    if (startDate.epochMilliseconds < now.getTime()) {
      throw new BadRequestException('Start date must be in the future.');
    }

    const maxDuration = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
    if (endDate.epochMilliseconds - startDate.epochMilliseconds > maxDuration) {
      throw new BadRequestException(
        'Away period cannot exceed 14 days. Please email us if you need to be away for longer.',
      );
    }

    const awayRange = this.userAwayRangeRepository.create({
      userId,
      startDate: new Date(startDate.epochMilliseconds),
      endDate: new Date(endDate.epochMilliseconds),
      note: data.note,
    });

    return this.userAwayRangeRepository.save(awayRange);
  }

  async getAwayRanges(userId: number): Promise<UserAwayRange[]> {
    return this.userAwayRangeRepository.find({
      where: { userId },
      order: { startDate: 'DESC' },
    });
  }

  async deleteAwayRange(userId: number, awayRangeId: number): Promise<void> {
    const awayRange = await this.userAwayRangeRepository.findOne({
      where: { id: awayRangeId, userId },
    });

    if (!awayRange) {
      throw new NotFoundException('Away range not found.');
    }

    await this.userAwayRangeRepository.remove(awayRange);
  }

  isUserAway(user: User, checkDate: Date = new Date()): boolean {
    return user.awayRanges.some(
      (range) => checkDate >= range.startDate && checkDate <= range.endDate,
    );
  }

  async isUserIdAway(
    userId: number,
    checkDate: Date = new Date(),
  ): Promise<boolean> {
    const awayRanges = await this.userAwayRangeRepository.find({
      where: { userId },
    });

    return awayRanges.some(
      (range) => checkDate >= range.startDate && checkDate <= range.endDate,
    );
  }

  private get communityRelations(): string[] {
    return [...communityDefaultRelations];
  }

  async findCommunityOrFail(
    id: number,
    relations?: string[],
  ): Promise<Community> {
    return this.communityRepository.findOneOrFail({
      where: { id },
      relations: relations ?? this.communityRelations,
    });
  }

  async createCommunity(body: CreateCommunityDto): Promise<Community> {
    const community = this.communityRepository.create(body);
    return this.communityRepository.save(community);
  }

  async findAllCommunities(): Promise<Community[]> {
    return this.communityRepository.find({
      relations: this.communityRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async updateCommunity(
    communityId: number,
    body: UpdateCommunityDto,
    userId: number,
  ): Promise<Community> {
    const user = await this.findOneOrFail(userId, ['leaderOf']);
    if (
      !user.leaderOf.some((leader) => leader.id === communityId) &&
      !user.admin
    ) {
      throw new UnauthorizedException();
    }

    const community = await this.findCommunityOrFail(communityId);
    Object.assign(community, body);
    return this.communityRepository.save(community);
  }

  async deleteCommunity(communityId: number): Promise<void> {
    await this.communityRepository.delete(communityId);
  }

  async addUserToCommunity(
    communityId: number,
    userId: number,
  ): Promise<Community> {
    const community = await this.findCommunityOrFail(communityId);
    const user = await this.findOneOrFail(userId);

    community.users = community.users ?? [];
    if (!community.users.some((existing) => existing.id === userId)) {
      community.users.push(user);
    }

    return this.communityRepository.save(community);
  }

  async removeUserFromCommunity(
    communityId: number,
    userId: number,
  ): Promise<Community> {
    const community = await this.findCommunityOrFail(communityId);

    community.users = (community.users ?? []).filter(
      (user) => user.id !== userId,
    );
    community.leaders = (community.leaders ?? []).filter(
      (leader) => leader.id !== userId,
    );

    return this.communityRepository.save(community);
  }

  async addLeaderToCommunity(
    communityId: number,
    userId: number,
  ): Promise<Community> {
    const community = await this.findCommunityOrFail(communityId);
    const user = await this.findOneOrFail(userId);

    community.users = community.users ?? [];
    if (!community.users.some((existing) => existing.id === userId)) {
      community.users.push(user);
    }

    community.leaders = community.leaders ?? [];
    if (!community.leaders.some((existing) => existing.id === userId)) {
      community.leaders.push(user);
    }

    return this.communityRepository.save(community);
  }

  async removeLeaderFromCommunity(
    communityId: number,
    userId: number,
  ): Promise<Community> {
    const community = await this.findCommunityOrFail(communityId);

    community.leaders = (community.leaders ?? []).filter(
      (leader) => leader.id !== userId,
    );

    return this.communityRepository.save(community);
  }

  async findUserCommunity(userId: number): Promise<Community | null> {
    const user = await this.findOneOrFail(userId, ['communities']);
    const communityId =
      user.communities.length > 0 ? user.communities[0].id : null;

    if (!communityId) {
      return null;
    }

    return this.findCommunityOrFail(communityId, ['users', 'leaders']);
  }

  async getUserIdsForUserCommunity(userId: number): Promise<number[]> {
    const user = await this.findOneOrFail(userId, ['communities']);
    const communityId =
      user.communities.length > 0 ? user.communities[0].id : null;
    if (!communityId) {
      throw new NotFoundException('User is not a member of any community.');
    }
    const community = await this.findCommunityOrFail(communityId, ['users']);
    const userIds = community.users!.map((user) => user.id);
    return userIds;
  }

  async getMemberInfo(userId: number): Promise<CommunityUserInfoDto> {
    const userIds = await this.getUserIdsForUserCommunity(userId);
    const actionRelations = await this.getActionRelationsForUsers(userIds);

    return {
      actions: actionRelations.actions,
      users: actionRelations.users,
    };
  }

  async getMemberContactInfo(
    userId: number,
  ): Promise<CommunityMemberContactInfoDto[]> {
    const leader = await this.findOneOrFail(userId);
    const userIds = await this.getUserIdsForUserCommunity(userId);
    const contactInfos: CommunityMemberContactInfoDto[] = [];
    for (const userId of userIds) {
      const user = await this.findOneOrFail(userId);
      contactInfos.push(
        new CommunityMemberContactInfoDto(user, leader.timeZone),
      );
    }
    return contactInfos;
  }

  async createGroup(body: CreateGroupDto): Promise<Group> {
    const group = this.groupRepository.create(body);
    return this.groupRepository.save(group);
  }

  async findAllGroups(): Promise<Group[]> {
    return this.groupRepository.find({ relations: ['users'] });
  }

  async findGroupByName(name: string): Promise<Group | null> {
    return this.groupRepository.findOne({ where: { name } });
  }

  async findGroupOrFail(id: number): Promise<Group> {
    return this.groupRepository.findOneOrFail({
      where: { id },
      relations: ['users'],
    });
  }

  async addUserToGroup(groupId: number, userId: number): Promise<Group> {
    const group = await this.groupRepository.findOneOrFail({
      where: { id: groupId },
      relations: ['users'],
    });
    group.users.push(await this.findOneOrFail(userId));
    return this.groupRepository.save(group);
  }

  async removeUserFromGroup(groupId: number, userId: number): Promise<Group> {
    const group = await this.groupRepository.findOneOrFail({
      where: { id: groupId },
      relations: ['users'],
    });
    group.users = group.users.filter((user) => user.id !== userId);
    return this.groupRepository.save(group);
  }

  async updateGroup(groupId: number, body: CreateGroupDto): Promise<Group> {
    const group = await this.groupRepository.findOneOrFail({
      where: { id: groupId },
    });
    Object.assign(group, body);
    return this.groupRepository.save(group);
  }

  async deleteGroup(groupId: number): Promise<void> {
    await this.groupRepository.delete(groupId);
  }

  async createOnetimeInvite(
    body: CreateOnetimeInviteDto,
  ): Promise<OnetimeInvite> {
    const code = Math.random().toString(36).substring(2, 15);

    const { invitingUserId, communityId, ...rest } = body;
    const invitingUser = await this.findOneOrFail(invitingUserId);

    let community: Community | undefined;
    if (communityId !== undefined) {
      community = await this.communityRepository.findOneOrFail({
        where: { id: communityId },
      });
      if (!community) {
        throw new NotFoundException(`Community ${communityId} not found`);
      }
    }

    const invite = this.onetimeInviteRepository.create({
      ...rest,
      code,
      invitingUser,
      community,
    });
    return this.onetimeInviteRepository.save(invite);
  }

  async deleteOnetimeInvite(inviteId: number, userId: number): Promise<void> {
    const invite = await this.onetimeInviteRepository.findOneOrFail({
      where: { id: inviteId },
      relations: ['invitingUser', 'community'],
    });
    const user = await this.findOneOrFail(userId, ['leaderOf']);
    if (
      !(
        invite.invitingUser.id === userId ||
        user.leaderOf.some((leader) => leader.id === invite.community?.id) ||
        user.admin
      )
    ) {
      throw new UnauthorizedException();
    }

    await this.onetimeInviteRepository.delete(inviteId);
  }

  async deleteCommunityInvite(inviteId: number, userId: number): Promise<void> {
    const invite = await this.communityInviteRepository.findOneOrFail({
      where: { id: inviteId },
      relations: ['invitingUser', 'community'],
    });
    const user = await this.findOneOrFail(userId, ['leaderOf']);
    if (
      !(
        invite.invitingUser?.id === userId ||
        user.leaderOf.some((leader) => leader.id === invite.community?.id) ||
        user.admin
      )
    ) {
      throw new UnauthorizedException();
    }
    await this.communityInviteRepository.delete(inviteId);
  }

  async findValidInviteByCode(code: string): Promise<OnetimeInvite | null> {
    return this.onetimeInviteRepository.findOne({
      where: { code, isValid: true },
      relations: ['invitingUser', 'community'],
    });
  }

  async findAllOnetimeInvites(): Promise<OnetimeInvite[]> {
    return this.onetimeInviteRepository.find({
      relations: ['invitingUser', 'community'],
    });
  }

  async findOnetimeInvites(communityId: number): Promise<OnetimeInvite[]> {
    return this.onetimeInviteRepository.find({
      where: { community: { id: communityId } },
    });
  }

  async invalidateInvite(inviteId: number): Promise<void> {
    await this.onetimeInviteRepository.update(inviteId, { isValid: false });
  }

  async createCommunityInvite(
    body: CreateCommunityInviteDto,
    userId: number,
  ): Promise<CommunityInvite> {
    const { invitedUserId, communityId } = body;

    const invitedUser = await this.findOneOrFail(invitedUserId);
    const community = await this.findCommunityOrFail(communityId);
    const invitingUser = await this.findOneOrFail(userId);

    const existingInvites = await this.communityInviteRepository.find({
      where: {
        invitedUser: { id: invitedUserId },
        community: { id: communityId },
      },
    });
    if (
      existingInvites.some(
        (invite) => invite.status === CommunityInviteStatus.Pending,
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
    });

    return this.communityInviteRepository.save(invite);
  }

  async findCommunityInvites(
    communityId: number,
  ): Promise<CommunityInviteDto[]> {
    const invites = await this.communityInviteRepository.find({
      where: { community: { id: communityId } },
      relations: ['invitedUser', 'invitingUser'],
    });
    return invites.map((invite) => new CommunityInviteDto(invite));
  }

  async findCommunityInvitesForUser(
    userId: number,
  ): Promise<CommunityInviteDto[]> {
    const invites = await this.communityInviteRepository.find({
      where: {
        invitedUser: { id: userId },
        status: CommunityInviteStatus.Pending,
      },
      relations: ['invitingUser', 'community'],
    });
    return invites.map((invite) => new CommunityInviteDto(invite));
  }

  async acceptCommunityInvite(inviteId: number, userId: number): Promise<void> {
    const invite = await this.communityInviteRepository.findOneOrFail({
      where: { id: inviteId },
      relations: ['invitedUser', 'invitingUser', 'community'],
    });
    if (invite.invitedUser.id !== userId) {
      throw new BadRequestException();
    }
    if (invite.status !== CommunityInviteStatus.Pending) {
      throw new BadRequestException();
    }

    invite.status = CommunityInviteStatus.Accepted;
    await this.communityInviteRepository.save(invite);

    const community = await this.findCommunityOrFail(invite.community.id, [
      'users',
    ]);

    if (community.users!.some((user) => user.id === invite.invitedUser.id)) {
      throw new BadRequestException();
    }

    community.users!.push(invite.invitedUser);
    await this.communityRepository.save(community);

    const notif = this.notifRepository.create({
      user: invite.invitingUser,
      category: NotificationCategory.CommunityInviteAccepted,
      message: `${invite.invitedUser?.name} has joined your community`,
      webAppLocation: `/groups?tab=invites`,
      associatedUsers: [invite.invitedUser],
    });
    await this.notifRepository.save(notif);
  }

  async rejectCommunityInvite(inviteId: number, userId: number): Promise<void> {
    const invite = await this.communityInviteRepository.findOneOrFail({
      where: { id: inviteId },
      relations: ['invitedUser', 'invitingUser'],
    });
    if (invite.invitedUser.id !== userId) {
      throw new BadRequestException();
    }
    if (invite.status !== CommunityInviteStatus.Pending) {
      throw new BadRequestException();
    }
    invite.status = CommunityInviteStatus.Rejected;
    await this.communityInviteRepository.save(invite);

    const notif = this.notifRepository.create({
      user: invite.invitingUser,
      category: NotificationCategory.CommunityInviteRejected,
      message: `${invite.invitedUser?.name} declined your community invitation`,
      webAppLocation: `/community?tab=invites`,
      associatedUsers: [invite.invitedUser],
    });
    await this.notifRepository.save(notif);
  }

  async leaveCommunity(communityId: number, userId: number): Promise<void> {
    const user = await this.findOneOrFail(userId, ['communities']);
    if (!user.communities?.some((community) => community.id === communityId)) {
      throw new BadRequestException();
    }
    user.communities = user.communities.filter(
      (community) => community.id !== communityId,
    );
    await this.userRepository.save(user);
  }
}
