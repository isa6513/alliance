import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { from, Observable } from 'rxjs';
import { CommentDto, CreateCommentDto } from 'src/forum/dto/comment.dto';
import {
  Comment,
  CommentParentObject,
} from 'src/forum/entities/comment.entity';
import { EditableContent } from 'src/forum/entities/editablecontent.entity';
import { ActionEventRecipientService } from 'src/notifs/action-event-recipient.service';
import {
  ActionEventReminderService,
  NOTIFICATION_LOOKBACK_WINDOW_MS,
  PreviewNotificationPlan,
} from 'src/notifs/action-event-reminder.service';
import { ILike, In, LessThan, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import {
  ActionActivityDto,
  ActionDto,
  ActionEventDto,
  ActionSuiteDto,
  CreateActionActivityDto,
  CreateActionDto,
  CreateActionEventDto,
  CreateActionSuiteDto,
  CreateActionUpdateDto,
  CreateReminderGroupDto,
  ExportActionDto,
  FormResponseOutputDto,
  LatLonDto,
  UpdateActionActivityDto,
  UpdateActionDto,
  UpdateActionEventDto,
} from './dto/action.dto';
import {
  ActionActivity,
  ActionActivityType,
} from './entities/action-activity.entity';
import { ActionEvent, ActionStatus } from './entities/action-event.entity';
import { Action, ActionTaskType } from './entities/action.entity';
import { Group } from 'src/user/entities/group.entity';
import { FormResponse } from 'src/tasks/entities/formresponse.entity';
import { User } from 'src/user/entities/user.entity';
import {
  ActionUpdate,
  ActionUpdateNotifyType,
} from './entities/action-update.entity';
import {
  ReminderGroup,
  ReminderGroupTimingMode,
} from './entities/reminder-group.entity';
import { ActionSuite } from './entities/action-suite.entity';
import { NotifsService, shouldTextUser } from 'src/notifs/notifs.service';
import { LikeNotificationService } from 'src/notifs/like-notification.service';
import { actionActivityUrl } from 'src/search/approutes';
import { ForumService } from 'src/forum/forum.service';
import { Form } from 'src/tasks/entities/form.entity';
import { FormSchema } from 'src/tasks/schema';

export enum UserActionRelation {
  Joined = 'joined',
  Completed = 'completed',
  None = 'none',
  Declined = 'declined',
}

export class UserActionRelationDto {
  @ApiProperty({ enum: UserActionRelation, enumName: 'UserActionRelation' })
  relation: UserActionRelation;
}

@Injectable()
export class ActionsService {
  constructor(
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    @InjectRepository(ActionEvent)
    private readonly actionEventRepository: Repository<ActionEvent>,
    @InjectRepository(ActionActivity)
    private readonly actionActivityRepository: Repository<ActionActivity>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(EditableContent)
    private readonly editableContentRepository: Repository<EditableContent>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(ActionUpdate)
    private readonly actionUpdateRepository: Repository<ActionUpdate>,
    @InjectRepository(ActionSuite)
    private readonly actionSuiteRepository: Repository<ActionSuite>,
    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,
    private userService: UserService,
    public eventEmitter: EventEmitter2,
    private readonly notifsService: NotifsService,
    private readonly actionEventRecipientService: ActionEventRecipientService,
    private readonly actionEventReminderService: ActionEventReminderService,
    private readonly likeNotificationService: LikeNotificationService,
    private readonly forumService: ForumService,
  ) {}

  async create(createActionDto: CreateActionDto): Promise<Action> {
    const { participatingGroups, suiteId, ...rest } = createActionDto;
    const action = this.actionRepository.create(rest);

    if (suiteId) {
      const suite = await this.actionSuiteRepository.findOneOrFail({
        where: { id: suiteId },
      });
      action.suite = suite;
    }

    if (participatingGroups && participatingGroups.length > 0) {
      action.participatingGroups =
        await this.resolveParticipatingGroups(participatingGroups);
    }

    return this.actionRepository.save(action);
  }

  findAll(): Promise<ActionDto[]> {
    return this.actionRepository
      .find({
        relations: ['events', 'activities', 'participatingGroups', 'suite'],
      })
      .then((actions) => {
        return actions.map((action) => new ActionDto(action));
      });
  }

  async reloadAllActionUsersJoined(): Promise<void> {
    const actions = await this.actionRepository.find();
    for (const action of actions) {
      console.log('reloading for: ' + action.id);
      await this.reloadUsersJoinedForAction(action.id);
    }
  }

  async reloadUsersJoinedForAction(actionId: number): Promise<void> {
    const action = await this.actionRepository.findOneOrFail({
      where: { id: actionId },
      relations: ['events', 'participatingGroups', 'activities'],
    });

    let joined = action.usersJoined;
    if (action.commitmentless) {
      joined = await this.getUsersJoinedForCommitmentlessAction(action);
    } else {
      const activities = await this.actionActivityRepository.find({
        where: {
          actionId: action.id,
          type: In([
            ActionActivityType.USER_JOINED,
            ActionActivityType.USER_WONT_COMPLETE,
          ]),
        },
      });
      joined = Math.max(
        activities.filter(
          (activity) => activity.type === ActionActivityType.USER_JOINED,
        ).length -
          activities.filter(
            (activity) =>
              activity.type === ActionActivityType.USER_WONT_COMPLETE,
          ).length,
        0,
      );
    }
    await this.actionRepository.update(action.id, { usersJoined: joined });
  }

  async getUsersJoinedForCommitmentlessAction(action: Action): Promise<number> {
    const event = action.events.find(
      (event) => event.newStatus === ActionStatus.MemberAction,
    );
    if (!event) return 1;

    const baseUsers =
      await this.actionEventRecipientService.getBaseUsersForEvent(
        ActionStatus.MemberAction,
        action,
        event.date,
      );
    const completionActivities = await this.actionActivityRepository.find({
      where: {
        actionId: action.id,
        type: ActionActivityType.USER_COMPLETED,
      },
    });
    const withdrawalActivities = await this.actionActivityRepository.find({
      where: {
        actionId: action.id,
        type: ActionActivityType.USER_WONT_COMPLETE,
      },
    });
    const baseUsersMinusWithdrawals = baseUsers.filter(
      (user) =>
        !withdrawalActivities.some((activity) => activity.userId === user.id),
    );
    const set = new Set([
      ...baseUsersMinusWithdrawals.map((user) => user.id),
      ...completionActivities.map((activity) => activity.userId),
    ]);

    return set.size;
  }

  async findPublic(userId?: number): Promise<ActionDto[]> {
    const actions = await this.actionRepository.find({
      relations: ['events', 'participatingGroups', 'activities'],
    });

    const user = userId
      ? await this.userService.findOne(userId, ['groups', 'awayRanges'])
      : null;

    const filtered: Action[] = [];
    for (const action of actions) {
      if (await this.userCanSeeAction(action, user)) {
        filtered.push(action);
      }
    }

    return await Promise.all(
      filtered.map(async (action) => {
        let shouldParticipate = false;
        if (
          user &&
          action.events.some(
            (event) => event.newStatus === ActionStatus.MemberAction,
          )
        ) {
          const targetGroupIds = new Set(
            (action.participatingGroups || []).map((group) => group.id),
          );
          shouldParticipate =
            this.actionEventRecipientService.userShouldCompleteEvent(
              user,
              action.events.find(
                (event) => event.newStatus === ActionStatus.MemberAction,
              )!.date,
              targetGroupIds,
              action.everyoneShouldComplete,
            );
        }
        return new ActionDto(action, {
          canParticipate: user
            ? await this.isEligibleForAction(action, user)
            : false,
          shouldParticipate: shouldParticipate,
          userRelation: user
            ? await this.getActionRelationFromActivities(
                action.activities.filter(
                  (activity) => activity.userId === user.id,
                ),
              )
            : undefined,
          reqAuthenticated: !!user,
        });
      }),
    );
  }

  async userCanSeeAction(action: Action, user: User | null): Promise<boolean> {
    if (user?.admin) {
      return true;
    }
    if (action.status === ActionStatus.Draft || action.archived) {
      return false;
    }
    if (
      !action.participatingGroups?.length ||
      action.showToNonparticipating === true
    ) {
      return true;
    }
    if (!user) {
      return false;
    }

    if (!action.participatingGroups?.length) {
      return false;
    }

    return user.groups.some((group) =>
      action.participatingGroups.some(
        (participatingGroup) => participatingGroup.id === group.id,
      ),
    );
  }

  async findOne(
    id: number,
    userId?: number,
    serverSide = false,
  ): Promise<Action> {
    const user = userId
      ? await this.userService.findOne(userId, ['groups'])
      : null;
    const action = await this.actionRepository.findOne({
      where: { id },
      relations: [
        'events',
        'activities',
        'participatingGroups',
        'updates',
        'suite',
      ],
    });

    if (
      !action ||
      !((await this.userCanSeeAction(action, user)) || serverSide)
    ) {
      throw new NotFoundException('Action not found');
    }
    return instanceToPlain(action) as Action;
  }

  async findOneDto(
    id: number,
    userId?: number,
    serverSide = false,
  ): Promise<ActionDto> {
    const action = await this.findOne(id, userId, serverSide);
    const user = userId
      ? await this.userService.findOne(userId, ['groups'])
      : null;
    return new ActionDto(action, {
      canParticipate: user
        ? await this.isEligibleForAction(action, user)
        : false,
      userRelation: user
        ? await this.getActionRelation(action.id, user.id)
        : undefined,
      reqAuthenticated: !!user,
    });
  }

  // assumes pre-filtered for one users activities!
  async getActionRelationFromActivities(
    activities: ActionActivity[],
  ): Promise<UserActionRelation> {
    if (
      activities.some(
        (activity) => activity.type === ActionActivityType.USER_DECLINED,
      )
    ) {
      return UserActionRelation.Declined;
    }
    if (
      activities.some(
        (activity) => activity.type === ActionActivityType.USER_WONT_COMPLETE,
      )
    ) {
      return UserActionRelation.Declined;
    }
    if (
      activities.some(
        (activity) => activity.type === ActionActivityType.USER_COMPLETED,
      )
    ) {
      return UserActionRelation.Completed;
    }
    if (
      activities.some(
        (activity) => activity.type === ActionActivityType.USER_JOINED,
      )
    ) {
      return UserActionRelation.Joined;
    }
    return UserActionRelation.None;
  }

  async getActionRelation(
    actionId: number,
    userId: number,
  ): Promise<UserActionRelation> {
    const activities = await this.actionActivityRepository.find({
      where: { action: { id: actionId }, user: { id: userId } },
    });
    return this.getActionRelationFromActivities(activities);
  }

  async createActionActivity(
    actionId: number,
    userId: number,
    type: ActionActivityType,
    taskFormResponse?: FormResponse,
    declineReason?: string,
    isMoral?: boolean,
    adminCreated?: boolean,
  ): Promise<ActionActivityDto> {
    const action = await this.findOne(actionId, userId);

    if (
      (type === ActionActivityType.USER_JOINED ||
        type === ActionActivityType.USER_COMPLETED) &&
      !adminCreated
    ) {
      await this.ensureUserEligibleForAction(action, userId);
    }

    if (type === ActionActivityType.USER_JOINED) {
      this.eventEmitter.emit('action.delta', { actionId, delta: +1 });
    }

    const user = await this.userService.findOneOrFail(userId);

    const activity = this.actionActivityRepository.create({
      type: type,
      actionId: actionId,
      userId: userId,
      action: action,
      user: user,
      taskFormResponse,
      declineReason,
      isMoral,
    });
    const savedActivity = await this.actionActivityRepository.save(activity);

    const activityDto = new ActionActivityDto(savedActivity);
    this.eventEmitter.emit('action.activity', {
      actionId,
      activity: activityDto,
    });

    await this.reloadUsersJoinedForAction(actionId);

    await this.checkAndProcessAutomaticTransitions(actionId);

    return activityDto;
  }

  async joinAction(
    actionId: number,
    userId: number,
  ): Promise<ActionActivityDto> {
    const action = await this.findOne(actionId, userId);

    if (action.status !== ActionStatus.GatheringCommitments) {
      throw new BadRequestException(
        'You can only join an action during the gathering commitments phase',
      );
    }

    return this.createActionActivity(
      actionId,
      userId,
      ActionActivityType.USER_JOINED,
    );
  }

  async declineAction(
    actionId: number,
    userId: number,
    reason: string,
    isMoral: boolean,
  ): Promise<ActionActivityDto> {
    const action = await this.findOne(actionId, userId);
    await this.ensureUserEligibleForAction(action, userId);
    const user = await this.userService.findOneOrFail(userId);

    const activity = this.actionActivityRepository.create({
      type: ActionActivityType.USER_DECLINED,
      actionId: actionId,
      userId: userId,
      action: action,
      user: user,
      declineReason: reason,
      isMoral,
    });
    const savedActivity = await this.actionActivityRepository.save(activity);
    return new ActionActivityDto(savedActivity);
  }

  async optoutAction(
    actionId: number,
    userId: number,
    reason: string,
    outOfTime: boolean,
  ): Promise<ActionActivityDto> {
    return this.createActionActivity(
      actionId,
      userId,
      ActionActivityType.USER_WONT_COMPLETE,
      undefined,
      reason,
      outOfTime,
    );
  }

  async completeAction(
    actionId: number,
    userId: number,
    taskFormResponse?: FormResponse,
  ): Promise<ActionActivityDto> {
    return this.createActionActivity(
      actionId,
      userId,
      ActionActivityType.USER_COMPLETED,
      taskFormResponse,
    );
  }

  async update(
    id: number,
    updateActionDto: UpdateActionDto,
    userId: number,
  ): Promise<Action | null> {
    const action = await this.actionRepository.findOne({
      where: { id },
      relations: ['participatingGroups'],
    });

    if (!action) {
      throw new NotFoundException('Action not found');
    }

    const { participatingGroups, suiteId, ...rest } = updateActionDto;

    if (suiteId) {
      const suite = await this.actionSuiteRepository.findOneOrFail({
        where: { id: suiteId },
      });
      action.suite = suite;
    }

    Object.assign(action, rest);

    if (participatingGroups !== undefined) {
      action.participatingGroups =
        await this.resolveParticipatingGroups(participatingGroups);
    }

    await this.actionRepository.save(action);
    return this.findOne(id, userId);
  }

  async addEvent(
    actionId: number,
    actionEventDto: CreateActionEventDto,
    userId?: number,
  ): Promise<ActionEvent> {
    const action = await this.findOne(actionId, userId);

    const newEvent = this.actionEventRepository.create({
      ...actionEventDto,
      action,
    });

    const savedEvent = await this.actionEventRepository.save(newEvent);

    await this.reloadUsersJoinedForAction(action.id);

    return savedEvent;
  }

  async remove(id: number) {
    await this.actionRepository.delete(id);
  }

  countCommitted(actionId: number): Observable<number> {
    return from(
      this.actionActivityRepository.count({
        where: {
          action: { id: actionId },
          type: ActionActivityType.USER_JOINED,
        },
      }),
    );
  }

  async countCommittedBulk(ids: number[]): Promise<Record<number, number>> {
    if (!ids.length) return {};

    const rows = await this.actionActivityRepository
      .createQueryBuilder('ua')
      .select('ua.actionId', 'id')
      .addSelect('COUNT(*)', 'count')
      .where('ua.actionId IN (:...ids)', { ids })
      .andWhere('ua.type IN (:...types)', {
        types: [ActionActivityType.USER_JOINED],
      })
      .groupBy('ua.actionId')
      .getRawMany<{ id: string; count: string }>();

    const map: Record<number, number> = {};
    rows.forEach((r) => (map[+r.id] = +r.count));
    ids.forEach((id) => (map[id] ??= 0));
    return map;
  }

  async findCompletedForUser(
    userId: number,
    comments?: boolean,
  ): Promise<ActionActivityDto[]> {
    const activities = await this.actionActivityRepository.find({
      where: { userId, type: ActionActivityType.USER_COMPLETED },
      relations: ['action', 'user', 'likes', 'taskFormResponse'],
    });
    if (comments) {
      return this.attachComments(activities);
    }
    return activities.map((activity) => new ActionActivityDto(activity));
  }

  async userCoordinatesForAction(actionId: number): Promise<LatLonDto[]> {
    const joinActivities = await this.actionActivityRepository.find({
      where: {
        action: { id: actionId },
        type: ActionActivityType.USER_JOINED,
      },
      relations: ['user', 'user.city'],
    });
    return joinActivities
      .filter(
        (activity) =>
          activity.user.city !== null && activity.user.city !== undefined,
      )
      .map((activity) => ({
        latitude: activity.user.city!.latitude,
        longitude: activity.user.city!.longitude,
      }));
  }

  buildOutputFormResponse(
    activity: ActionActivity,
  ): FormResponseOutputDto | undefined {
    if (!activity.taskFormResponse) {
      return undefined;
    }

    const schema = activity.taskFormResponse
      .schemaSnapshot as unknown as FormSchema;

    const answerToIsPublic = (
      answer: string,
      selections: Record<string, boolean>,
    ) => {
      if (selections?.[answer] === false) {
        return false;
      }
      return schema.pages.some((page) =>
        page.fields.some(
          (field) =>
            field.id === answer &&
            'label' in field &&
            field.output?.output === true,
        ),
      );
    };

    const answers = activity.taskFormResponse.answers;
    const publicAnswers = activity.taskFormResponse.publicAnswers ?? {};

    const answersPrunedObj = Object.fromEntries(
      Object.entries(answers).filter(([key]) =>
        answerToIsPublic(key, publicAnswers),
      ),
    );

    if (!Object.keys(answersPrunedObj).length) {
      return undefined;
    }

    const responseWithPruned = {
      ...activity.taskFormResponse,
      answers: answersPrunedObj,
    } as FormResponse;

    return new FormResponseOutputDto(responseWithPruned);
  }

  async getActionActivities(actionId: number): Promise<ActionActivityDto[]> {
    const activities = await this.actionActivityRepository.find({
      where: { actionId },
      relations: ['user', 'likes', 'taskFormResponse'],
      order: { createdAt: 'DESC' },
    });
    return activities.map((activity) => new ActionActivityDto(activity));
  }

  async attachComments(
    activities: ActionActivity[],
  ): Promise<ActionActivityDto[]> {
    return Promise.all(
      activities.map(async (activity) => {
        return new ActionActivityDto(activity, {
          comments: (
            await this.forumService.findCommentsForActivity(activity.id)
          ).map((comment) => new CommentDto(comment)),
          formResponseOutput: activity.taskFormResponse
            ? this.buildOutputFormResponse(activity)
            : undefined,
        });
      }),
    );
  }

  async getActivityFeed(
    limit: number = 20,
    before?: Date,
    comments?: boolean,
  ): Promise<ActionActivityDto[]> {
    const activities = await this.actionActivityRepository.find({
      where: {
        ...(before ? { createdAt: LessThan(before) } : {}),
        type: In([
          ActionActivityType.USER_JOINED,
          ActionActivityType.USER_COMPLETED,
        ]),
      },
      relations: ['user', 'action', 'likes', 'taskFormResponse'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
    if (activities.length === 0) {
      return [];
    }

    if (comments) {
      return this.attachComments(activities);
    }

    return Promise.all(
      activities.map(async (activity) => {
        return new ActionActivityDto(activity);
      }),
    );
  }

  private async resolveParticipatingGroups(
    groups?: Array<Partial<Group>>,
  ): Promise<Group[]> {
    if (!groups || groups.length === 0) {
      return [];
    }

    const ids = groups
      .map((group) => group?.id)
      .filter((id): id is number => typeof id === 'number');

    if (ids.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(ids));
    const found = await this.groupRepository.findBy({ id: In(uniqueIds) });

    if (found.length !== uniqueIds.length) {
      const foundIds = new Set(found.map((group) => group.id));
      const missing = uniqueIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Group(s) not found: ${missing.join(', ')}`);
    }

    return found;
  }

  async isIdEligibleForAction(
    actionId: number,
    userId: number,
  ): Promise<boolean> {
    const action = await this.findOne(actionId, userId);
    const user = await this.userService.findOne(userId, ['groups']);
    if (!user) {
      return false;
    }
    return this.isEligibleForAction(action, user);
  }

  async isEligibleForAction(action: Action, user: User): Promise<boolean> {
    if (action.preventCompletion) {
      return false;
    }
    const groups = action.participatingGroups;
    const userGroupIds = new Set((user.groups || []).map((group) => group.id));
    const isMember = groups.some((group) => userGroupIds.has(group.id));
    return isMember;
  }

  async ensureUserEligibleForAction(action: Action, userId: number) {
    const groups = action.participatingGroups;

    const user = await this.userService.findOne(userId, ['groups']);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userGroupIds = new Set((user.groups || []).map((group) => group.id));
    const isMember = groups.some((group) => userGroupIds.has(group.id));

    if (!isMember) {
      throw new ForbiddenException(
        'This action is not available to your groups.',
      );
    }

    if (action.preventCompletion) {
      throw new ForbiddenException('This action is no longer available');
    }
  }

  async checkAndProcessAutomaticTransitions(actionId: number) {
    const action = await this.findOne(actionId, undefined, true);

    // Check if we should transition from GatheringCommitments to CommitmentsReached
    if (action.status === ActionStatus.GatheringCommitments) {
      if (
        action.commitmentThreshold &&
        action.usersJoined >= action.commitmentThreshold
      ) {
        await this.createAutomaticTransitionEvent(
          actionId,
          ActionStatus.OfficeAction,
          'Commitment threshold reached',
          `${action.usersJoined} people have committed to this action, meeting the threshold of ${action.commitmentThreshold}.`,
        );
      }
    }

    // Check if we should transition from MemberAction to Resolution
    if (
      action.status === ActionStatus.MemberAction &&
      action.usersJoined > 0 &&
      action.usersCompleted >= action.usersJoined &&
      !action.commitmentless
    ) {
      await this.createAutomaticTransitionEvent(
        actionId,
        ActionStatus.Resolution,
        'All members completed action',
        `All ${action.usersJoined} committed members have completed the action.`,
      );
    }
  }

  private async createAutomaticTransitionEvent(
    actionId: number,
    newStatus: ActionStatus,
    title: string,
    description: string,
  ): Promise<void> {
    const action = await this.findOne(actionId, undefined, true);

    const eventData: CreateActionEventDto = {
      title,
      description,
      newStatus,
      date: new Date(), // Set to current time for immediate transition
      showInTimeline: true,
    };

    const newEvent = this.actionEventRepository.create({
      ...eventData,
      action,
    });

    await this.actionEventRepository.save(newEvent);
  }

  async clearDb() {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    await this.actionActivityRepository.delete({});
    await this.actionEventRepository.delete({});
    await this.actionRepository.delete({});
  }

  async setTestRelations(id: number) {
    const actions = await this.actionRepository.find({
      relations: ['events'],
    });
    for (const action of actions) {
      if (action.status === ActionStatus.MemberAction) {
        await this.createActionActivity(
          action.id,
          id,
          ActionActivityType.USER_JOINED,
        );
      }
    }
  }

  async getActivityForUser(userId: number): Promise<ActionActivityDto[]> {
    const activities = await this.actionActivityRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['action', 'user', 'likes'],
    });
    return activities.map((activity) => new ActionActivityDto(activity));
  }

  async friendActivity(
    userId: number,
    comments?: boolean,
  ): Promise<ActionActivityDto[]> {
    const user = await this.userService.findOne(userId, [
      'sentFriendRequests',
      'receivedFriendRequests',
    ]);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const friends = await this.userService.findFriends(userId);
    const friendActivities = await this.actionActivityRepository.find({
      where: {
        user: { id: In(friends.map((f) => f.id)) },
        type: In([
          ActionActivityType.USER_JOINED,
          ActionActivityType.USER_COMPLETED,
        ]),
      },
      relations: ['user', 'action', 'likes', 'taskFormResponse'],
      order: { createdAt: 'DESC' },
    });

    if (comments) {
      return this.attachComments(friendActivities);
    }

    return friendActivities.map((activity) => new ActionActivityDto(activity));
  }

  async communityActivity(
    limitNum: number = 20,
    beforeDate: Date | undefined,
    communityId: number,
    comments?: boolean,
  ) {
    const community = await this.userService.findCommunityOrFail(communityId);

    const members = community.users ?? [];

    const memberActivities = await this.actionActivityRepository.find({
      where: {
        ...(beforeDate ? { createdAt: LessThan(beforeDate) } : {}),
        user: { id: In(members.map((m) => m.id)) },
        type: In([
          ActionActivityType.USER_JOINED,
          ActionActivityType.USER_COMPLETED,
        ]),
      },
      relations: ['user', 'action', 'likes', 'taskFormResponse'],
      order: { createdAt: 'DESC' },
      take: limitNum,
    });

    if (comments) {
      return this.attachComments(memberActivities);
    }

    return memberActivities.map((activity) => new ActionActivityDto(activity));
  }

  async findByName(name: string): Promise<Action[]> {
    const actions = await this.actionRepository.find({
      where: { name: ILike(`%${name}%`) },
      relations: ['events'],
    });
    return actions.filter((action) => action.status !== ActionStatus.Draft);
  }

  async getActivity(id: number): Promise<ActionActivityDto> {
    const activity = await this.actionActivityRepository.findOne({
      where: { id },
      relations: ['user', 'action', 'likes', 'taskFormResponse'],
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return new ActionActivityDto(activity, {
      formResponseOutput: this.buildOutputFormResponse(activity),
    });
  }

  async getEvent(id: number): Promise<ActionEventDto> {
    const event = await this.actionEventRepository.findOne({
      where: { id },
      relations: ['action'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return new ActionEventDto(event);
  }

  async likeActivity(id: number, userId: number, unlike = false) {
    const activity = await this.actionActivityRepository.findOne({
      where: { id },
      relations: ['user', 'action', 'likes'],
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    const user = await this.userService.findOneOrFail(userId);

    const qb = this.actionActivityRepository
      .createQueryBuilder()
      .relation(ActionActivity, 'likes')
      .of(activity);

    let createdLike = false;
    if (unlike) {
      await qb.remove(user);
    } else if (!activity.likes.some((like) => like.id === user.id)) {
      await qb.add(user);
      createdLike = true;
    }

    const updatedActivity = await this.actionActivityRepository.findOne({
      where: { id },
      relations: ['user', 'action', 'likes'],
    });
    if (!updatedActivity) {
      throw new NotFoundException('Activity not found');
    }

    if (createdLike && updatedActivity.user) {
      await this.likeNotificationService.createOrUpdate({
        owner: updatedActivity.user,
        liker: user,
        targetType: 'activity',
        targetId: updatedActivity.id,
        webAppLocation: actionActivityUrl(
          updatedActivity.action?.id ?? updatedActivity.actionId,
          updatedActivity.id,
        ),
        groupingKey: `activity_like:${updatedActivity.id}`,
      });
    }

    return new ActionActivityDto(updatedActivity);
  }

  async addActivityComment(
    id: number,
    commentDto: CreateCommentDto,
    userId: number,
  ): Promise<CommentDto> {
    const user = await this.userService.findOneOrFail(userId);
    const content = this.editableContentRepository.create({
      body: commentDto.editableContent.body,
      attachments: commentDto.editableContent.attachments ?? [],
    });
    await this.editableContentRepository.save(content);
    const comment = this.commentRepository.create({
      parentObjectType: CommentParentObject.Activity,
      parentObjectId: id,
      parentId: commentDto.parentId,
      author: user,
      authorId: user.id,
      editableContent: content,
    });
    const savedComment = await this.commentRepository.save(comment);
    return new CommentDto(savedComment);
  }

  async updateActivity(
    id: number,
    updateActivityDto: UpdateActionActivityDto,
    userId: number,
  ): Promise<ActionActivityDto> {
    const activity = await this.actionActivityRepository.findOne({
      where: { id },
      relations: ['editableContent', 'taskFormResponse'],
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this activity');
    }
    let editableContent = await this.editableContentRepository.findOne({
      where: { id: activity.editableContent?.id },
    });
    if (!editableContent) {
      editableContent = this.editableContentRepository.create(
        updateActivityDto.editableContent,
      );
    }
    editableContent.attachments = updateActivityDto.editableContent.attachments;
    editableContent.body = updateActivityDto.editableContent.body;
    await this.editableContentRepository.save(editableContent);

    activity.editableContent = editableContent;
    await this.actionActivityRepository.save(activity);

    return this.getActivity(id);
  }

  async getPaymentAmountForAction(id: number): Promise<number> {
    const action = await this.findOne(id, undefined, true);
    if (action.type !== ActionTaskType.Funding) {
      throw new BadRequestException('Action is not a funding action');
    }
    if (!action.donationAmount) {
      throw new BadRequestException('Action has no funding amount');
    }
    return action.donationAmount;
  }

  async adminCreateActivity(
    activityDto: CreateActionActivityDto,
  ): Promise<ActionActivityDto> {
    return this.createActionActivity(
      activityDto.actionId,
      activityDto.userId,
      activityDto.type,
      undefined,
      undefined,
      undefined,
      true,
    );
  }

  async archive(id: number): Promise<ActionDto> {
    const action = await this.actionRepository.findOneOrFail({ where: { id } });
    action.archived = true;
    return new ActionDto(await this.actionRepository.save(action));
  }

  async unarchive(id: number): Promise<ActionDto> {
    const action = await this.actionRepository.findOneOrFail({ where: { id } });
    action.archived = false;
    return new ActionDto(await this.actionRepository.save(action));
  }

  async createActionUpdate(
    id: number,
    createActionUpdateDto: CreateActionUpdateDto,
  ): Promise<ActionUpdate> {
    const content = this.editableContentRepository.create({
      body: createActionUpdateDto.content.body,
      attachments: createActionUpdateDto.content.attachments ?? [],
    });
    await this.editableContentRepository.save(content);
    const action = await this.actionRepository.findOneOrFail({
      where: { id },
      relations: ['participatingGroups'],
    });

    let group: Group | undefined = undefined;
    if (createActionUpdateDto.groupId) {
      group = await this.groupRepository.findOneOrFail({
        where: { id: createActionUpdateDto.groupId },
      });
    }

    const actionUpdate = await this.actionUpdateRepository.save(
      this.actionUpdateRepository.create({
        ...createActionUpdateDto,
        content,
        action,
        group,
      }),
    );

    if (createActionUpdateDto.notifyType !== ActionUpdateNotifyType.None) {
      await this.generateNotifsForActionUpdate(actionUpdate);
    }

    return actionUpdate;
  }

  async deleteActionUpdate(id: number) {
    const actionUpdate = await this.actionUpdateRepository.findOneOrFail({
      where: { id },
    });
    await this.actionUpdateRepository.delete(id);
    return actionUpdate;
  }

  async generateNotifsForActionUpdate(actionUpdate: ActionUpdate) {
    const action = actionUpdate.action;

    let users: User[] = [];
    if (actionUpdate.notifyType === ActionUpdateNotifyType.ActionCohort) {
      users = await this.userService.findAll();
    } else if (actionUpdate.notifyType === ActionUpdateNotifyType.Group) {
      if (!actionUpdate.group) {
        throw new BadRequestException('Group is required');
      }
      users = (await this.userService.findGroupOrFail(actionUpdate.group.id))
        .users;
    } else if (actionUpdate.notifyType === ActionUpdateNotifyType.AllMembers) {
      users = await this.actionEventRecipientService.getBaseUsersForEvent(
        ActionStatus.MemberAction,
        action,
        actionUpdate.associatedEvent?.date ?? actionUpdate.date,
      );
    }

    for (const user of users) {
      await this.notifsService.createActionUpdateNotif(actionUpdate, user);
    }
  }

  async getSuites(): Promise<ActionSuite[]> {
    return this.actionSuiteRepository.find();
  }

  async getSuite(id: number): Promise<ActionSuiteDto> {
    const suite = await this.actionSuiteRepository.findOneOrFail({
      where: { id },
      relations: [
        'actions',
        'actions.events',
        'reminderGroups',
        'reminderGroups.memberActionEvent',
        'reminderGroups.memberActionEvent',
        'reminderGroups.deadlineEvent',
        'actions.participatingGroups',
        'actions.activities',
      ],
    });

    return new ActionSuiteDto(
      instanceToPlain(suite) as ActionSuite,
      suite.actions.map((action) => new ActionDto(action)),
    );
  }

  async createSuite(
    createActionSuiteDto: CreateActionSuiteDto,
  ): Promise<ActionSuiteDto> {
    const suite = this.actionSuiteRepository.create(createActionSuiteDto);
    return this.actionSuiteRepository.save(suite);
  }

  async batchUpdateSuiteEvents(
    suiteId: number,
    eventId: number,
    body: UpdateActionEventDto,
  ) {
    const event = await this.actionEventRepository.findOneOrFail({
      where: { id: eventId },
      relations: ['action', 'action.events'],
    });
    const suite = await this.actionSuiteRepository.findOneOrFail({
      where: { id: suiteId },
      relations: ['actions', 'actions.events'],
    });
    const eventIdx = event.action.events.findIndex(
      (event) => event.id === eventId,
    );
    const eventsToUpdate = new Set<number>([eventId]);

    for (const action of suite.actions) {
      if (action.events.length <= eventIdx) {
        throw new BadRequestException(
          'Events do not have equivalent events to edit',
        );
      }
      const possibleEvent = action.events[eventIdx];
      if (
        possibleEvent.newStatus === event.newStatus &&
        possibleEvent.suiteManaged
      ) {
        eventsToUpdate.add(possibleEvent.id);
      }
    }

    for (const id of eventsToUpdate) {
      await this.actionEventRepository.update(id, body);
    }
    return this.getSuite(suiteId);
  }

  async addSuiteEvent(suiteId: number, actionEventDto: CreateActionEventDto) {
    const suite = await this.actionSuiteRepository.findOneOrFail({
      where: { id: suiteId },
      relations: ['actions'],
    });

    for (const action of suite.actions) {
      console.log('adding event to action', action.id);
      const newEvent = this.actionEventRepository.create({
        ...actionEventDto,
        action,
        suiteManaged: true,
      });
      await this.actionEventRepository.save(newEvent);

      await this.reloadUsersJoinedForAction(action.id);
    }
    return this.getSuite(suiteId);
  }

  async deleteSuiteEvent(suiteId: number, eventId: number) {
    const event = await this.actionEventRepository.findOneOrFail({
      where: { id: eventId },
      relations: ['action', 'action.events'],
    });
    const suite = await this.actionSuiteRepository.findOneOrFail({
      where: { id: suiteId },
      relations: ['actions', 'actions.events'],
    });
    const eventIdx = event.action.events.findIndex(
      (event) => event.id === eventId,
    );

    for (const action of suite.actions) {
      if (action.events.length <= eventIdx) {
        throw new BadRequestException(
          'Events do not have equivalent events to delete',
        );
      }
      const possibleEvent = action.events[eventIdx];
      if (
        possibleEvent.newStatus === event.newStatus &&
        possibleEvent.suiteManaged
      ) {
        console.log('deleting event', possibleEvent.id);
        await this.actionEventRepository.delete(possibleEvent.id);
      }
    }
    return this.getSuite(suiteId);
  }

  async tentativePlansForGroup(
    eventId: number,
    body: CreateReminderGroupDto,
  ): Promise<PreviewNotificationPlan[]> {
    const event = await this.actionEventRepository.findOneOrFail({
      where: { id: eventId },
      relations: ['action', 'action.events', 'action.participatingGroups'],
    });

    let group: Group | undefined = undefined;
    if (body.userGroupId) {
      group = await this.groupRepository.findOneOrFail({
        where: { id: body.userGroupId },
      });
    }

    let users: User[] = [];
    if (body.userIds) {
      users = await this.userService.findByIds(body.userIds);
    }

    const fakeGroup = {
      ...body,
      id: 0,
      name: 'Tentative Reminder Group',
      memberActionEvent: event,
      notifications: [],
      users,
      userGroup: group,
      allSent: false,
    } satisfies ReminderGroup;

    const withDeadlineEvent =
      await this.actionEventReminderService.attachDeadlineEvent(fakeGroup);

    if (
      fakeGroup.timingMode === ReminderGroupTimingMode.FromDeadline ||
      fakeGroup.timingMode === ReminderGroupTimingMode.WithinRelativeRange
    ) {
      if (!withDeadlineEvent.deadlineEvent) {
        throw new BadRequestException(
          'Deadline event is required for relative timing modes',
        );
      }
    }
    if (fakeGroup.timingMode === ReminderGroupTimingMode.WithinRange) {
      if (
        fakeGroup.send_range_start &&
        fakeGroup.send_range_end &&
        new Date(fakeGroup.send_range_start).getTime() >
          new Date(fakeGroup.send_range_end).getTime()
      ) {
        throw new BadRequestException(
          'Send range start must be before the end',
        );
      }
    }

    const plans = await this.actionEventReminderService.getPlansForGroup(
      withDeadlineEvent,
      new Date(Date.now() - NOTIFICATION_LOOKBACK_WINDOW_MS),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    );

    return plans.map((plan) => ({
      ...plan,
      channel: shouldTextUser(plan.user) ? 'text' : 'email',
    }));
  }

  async getUncompletedTasks(
    userId: number,
    suiteId?: number,
  ): Promise<ActionDto[]> {
    const actions = (await this.findPublic(userId)).filter(
      (action) =>
        action.shouldParticipate &&
        action.userRelation !== UserActionRelation.Completed,
    );
    if (!suiteId) {
      return actions;
    }

    const suite = await this.actionSuiteRepository.findOneOrFail({
      where: { id: suiteId },
      relations: ['actions'],
    });

    return actions.filter((action) =>
      suite.actions.some((a) => a.id === action.id),
    );
  }

  async exportAction(
    id: number,
    events?: boolean,
    reminders?: boolean,
    taskForm?: boolean,
    suite?: boolean,
  ): Promise<ExportActionDto> {
    const relations = [
      'participatingGroups',
      ...(events ? ['events'] : []),
      ...(suite ? ['suite'] : []),
    ];
    const action = await this.actionRepository.findOneOrFail({
      where: { id },
      relations,
    });

    const actionWithExtras: ExportActionDto = {
      ...action,
      taskForm: taskForm
        ? await this.formRepository.findOneOrFail({
            where: { id: action.taskFormId },
          })
        : undefined,
      reminderGroups: reminders
        ? await this.actionEventReminderService.getReminderGroupsForEvent(
            action.id,
          )
        : undefined,
    };

    return actionWithExtras;
  }

  async importAction(json: string): Promise<ActionDto> {
    const importaction = JSON.parse(json) as ExportActionDto;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { taskForm, reminderGroups, ...action } = importaction;

    if (action.suite) {
      const suite = await this.actionSuiteRepository.findOne({
        where: { name: action.suite.name },
      });
      if (suite) {
        action.suite = suite;
      } else {
        const newSuite = this.actionSuiteRepository.create({
          name: action.suite.name,
        });
        await this.actionSuiteRepository.save(newSuite);
        action.suite = newSuite;
      }
    }

    if (taskForm) {
      const newTaskForm = this.formRepository.create({
        ...taskForm,
        id: undefined,
      });
      await this.formRepository.save(newTaskForm);
      action.taskFormId = newTaskForm.id;
    }

    if (action.events) {
      const newEvents: ActionEvent[] = [];
      for (const event of action.events) {
        const newEvent = this.actionEventRepository.create({
          ...event,
          id: undefined,
          action: undefined,
        });
        newEvents.push(newEvent);
      }
      await this.actionEventRepository.save(newEvents);
      action.events = newEvents;
    }

    if (action.participatingGroups) {
      const existingGroups: Group[] = [];
      for (const group of action.participatingGroups) {
        const found = await this.groupRepository.findOne({
          where: {
            id: group.id,
          },
        });
        if (found) {
          existingGroups.push(found);
        }
      }
      action.participatingGroups = existingGroups;
    }

    const newAction = this.actionRepository.create({
      ...action,
      id: undefined,
    });
    await this.actionRepository.save(newAction);

    return new ActionDto(newAction);
  }
}
