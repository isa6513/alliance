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
import { ActionEventNotifWorker } from 'src/notifs/action-event-notif.worker';
import { NotifsService } from 'src/notifs/notifs.service';
import { ILike, In, LessThan, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import {
  ActionActivityDto,
  ActionDto,
  ActionEventDto,
  CreateActionDto,
  CreateActionEventDto,
  LatLonDto,
  PreEventNotifDataDto,
  UpdateActionActivityDto,
  UpdateActionDto,
} from './dto/action.dto';
import {
  ActionActivity,
  ActionActivityType,
} from './entities/action-activity.entity';
import {
  ActionEvent,
  ActionStatus,
  NotificationType,
} from './entities/action-event.entity';
import { Action, ActionTaskType } from './entities/action.entity';

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
    private readonly notifsService: NotifsService,
    private userService: UserService,
    public eventEmitter: EventEmitter2,
    private readonly actionEventNotifWorker: ActionEventNotifWorker,
  ) {}

  async create(createActionDto: CreateActionDto): Promise<Action> {
    const action = this.actionRepository.create(createActionDto);
    return this.actionRepository.save(action);
  }

  findAll(): Promise<ActionDto[]> {
    return this.actionRepository
      .find({
        relations: ['events', 'activities'],
      })
      .then((actions) => {
        return actions.map((action) => this.entityToDto(action));
      });
  }

  entityToDto(action: Action): ActionDto {
    return {
      ...action,
      usersJoined: action.usersJoined,
      usersCompleted: action.usersCompleted,
      status: action.status,
    };
  }

  findPublic(): Promise<ActionDto[]> {
    return this.actionRepository
      .find({
        relations: ['events', 'activities'],
      })
      .then((actions) => {
        return actions
          .filter((action) => action.status !== ActionStatus.Draft)
          .map((action) => this.entityToDto(action));
      });
  }

  async findOne(id: number): Promise<Action> {
    const action = await this.actionRepository.findOne({
      where: { id },
      relations: ['events', 'activities'],
    });
    if (!action) {
      throw new NotFoundException('Action not found');
    }
    return instanceToPlain(action) as Action;
  }

  async getActionRelation(
    actionId: number,
    userId: number,
  ): Promise<UserActionRelation | null> {
    const activities = await this.actionActivityRepository.find({
      where: { action: { id: actionId }, user: { id: userId } },
    });
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

  async createActionActivity(
    actionId: number,
    userId: number,
    type: ActionActivityType,
  ): Promise<ActionActivityDto> {
    if (type === ActionActivityType.USER_JOINED) {
      this.eventEmitter.emit('action.delta', { actionId, delta: +1 });
    }

    const action = await this.findOne(actionId);
    const user = await this.userService.findOneOrFail(userId);

    const activity = this.actionActivityRepository.create({
      type: type,
      actionId: actionId,
      userId: userId,
      action: action,
      user: user,
    });
    const savedActivity = await this.actionActivityRepository.save(activity);

    const activityDto = new ActionActivityDto(savedActivity);
    this.eventEmitter.emit('action.activity', {
      actionId,
      activity: activityDto,
    });

    await this.checkAndProcessAutomaticTransitions(actionId);

    return activityDto;
  }

  async joinAction(
    actionId: number,
    userId: number,
  ): Promise<ActionActivityDto> {
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
    const action = await this.findOne(actionId);
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
    const action = await this.findOne(actionId);
    const user = await this.userService.findOneOrFail(userId);

    const activity = this.actionActivityRepository.create({
      type: ActionActivityType.USER_WONT_COMPLETE,
      actionId: actionId,
      userId: userId,
      action: action,
      user: user,
      declineReason: reason,
      outOfTime,
    });
    const savedActivity = await this.actionActivityRepository.save(activity);
    return new ActionActivityDto(savedActivity);
  }

  async completeAction(
    actionId: number,
    userId: number,
  ): Promise<ActionActivityDto> {
    return this.createActionActivity(
      actionId,
      userId,
      ActionActivityType.USER_COMPLETED,
    );
  }

  async update(
    id: number,
    updateActionDto: UpdateActionDto,
  ): Promise<Action | null> {
    await this.actionRepository.update(id, updateActionDto);
    return this.findOne(id);
  }

  async addEvent(
    actionId: number,
    actionEventDto: CreateActionEventDto,
  ): Promise<ActionDto> {
    const action = await this.findOne(actionId);

    const newEvent = this.actionEventRepository.create({
      ...actionEventDto,
      action,
    });

    await this.actionEventRepository.save(newEvent);

    // re-fetch action from database to get the updated events
    const newAction = await this.findOne(actionId);

    return new ActionDto(newAction);
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

  async findCompletedForUser(userId: number): Promise<ActionActivityDto[]> {
    const activities = await this.actionActivityRepository.find({
      where: { userId, type: ActionActivityType.USER_COMPLETED },
      relations: ['action'],
    });
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

  async getActionActivities(actionId: number): Promise<ActionActivityDto[]> {
    const activities = await this.actionActivityRepository.find({
      where: { actionId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return activities.map((activity) => new ActionActivityDto(activity));
  }

  async getActivityFeed(
    limit: number = 20,
    before?: Date,
  ): Promise<ActionActivityDto[]> {
    const where = before ? { createdAt: LessThan(before) } : {};
    const activities = await this.actionActivityRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return activities.map((activity) => new ActionActivityDto(activity));
  }

  async checkAndProcessAutomaticTransitions(actionId: number) {
    const action = await this.findOne(actionId);

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
    if (action.status === ActionStatus.MemberAction) {
      if (
        action.usersJoined > 0 &&
        action.usersCompleted >= action.usersJoined
      ) {
        await this.createAutomaticTransitionEvent(
          actionId,
          ActionStatus.Resolution,
          'All members completed action',
          `All ${action.usersJoined} committed members have completed the action.`,
        );
      }
    }
  }

  private async createAutomaticTransitionEvent(
    actionId: number,
    newStatus: ActionStatus,
    title: string,
    description: string,
  ): Promise<void> {
    const action = await this.findOne(actionId);

    const eventData: CreateActionEventDto = {
      title,
      description,
      newStatus,
      sendNotifsTo: NotificationType.Joined, // Notify users who joined the action
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
    // Clear in order to respect foreign key constraints
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

  async friendActivity(userId: number): Promise<ActionActivityDto[]> {
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
      },
      relations: ['user', 'action'],
      order: { createdAt: 'DESC' },
    });
    return friendActivities.map((activity) => new ActionActivityDto(activity));
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
      relations: ['user', 'action', 'likes'],
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    const comments = await this.commentRepository.find({
      where: {
        parentObjectType: CommentParentObject.Activity,
        parentObjectId: id,
      },
      relations: ['author'],
    });
    const commentsDto = comments.map((comment) => new CommentDto(comment));
    return new ActionActivityDto(activity, commentsDto);
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

    if (unlike) {
      await qb.remove(user);
    } else {
      if (!activity.likes.some((like) => like.id === user.id)) {
        await qb.add(user);
      }
    }

    const updatedActivity = await this.actionActivityRepository.findOne({
      where: { id },
      relations: ['likes'],
    });
    if (!updatedActivity) {
      throw new NotFoundException('Activity not found');
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
      relations: ['editableContent'],
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
    const action = await this.findOne(id);
    if (action.type !== ActionTaskType.Funding) {
      throw new BadRequestException('Action is not a funding action');
    }
    if (!action.donationAmount) {
      throw new BadRequestException('Action has no funding amount');
    }
    return action.donationAmount;
  }

  async eventNotifData(
    actionId: number,
    type: ActionStatus,
    sendNotifsTo: NotificationType,
  ): Promise<PreEventNotifDataDto> {
    if (sendNotifsTo === NotificationType.None) {
      return {
        n_texts: 0,
        n_emails: 0,
        n_pushes: 0,
      };
    }

    const action = await this.actionRepository.findOne({
      where: { id: actionId },
    });
    if (!action) {
      throw new NotFoundException('Action not found');
    }

    const users = await this.actionEventNotifWorker.getBaseUsersForEvent(
      type,
      action,
    );

    const texts = users.filter((user) =>
      this.notifsService.shouldTextUser(user),
    );
    const emails = users
      .filter((user) => this.notifsService.shouldEmailUser(user))
      .filter((user) => !texts.includes(user));

    return {
      n_texts: texts.length,
      n_emails: emails.length,
      n_pushes: 0,
    };
  }
}
