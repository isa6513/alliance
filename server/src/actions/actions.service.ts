import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActionDto,
  CreateActionDto,
  UpdateActionDto,
  LatLonDto,
  CreateActionEventDto,
  ActionActivityDto,
  UserActionDto,
  UpdateActionActivityDto,
} from './dto/action.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Action } from './entities/action.entity';
import {
  ActionEvent,
  NotificationType,
  ActionStatus,
} from './entities/action-event.entity';
import { ILike, In, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { UserAction, UserActionRelation } from './entities/user-action.entity';
import {
  ActionActivity,
  ActionActivityType,
} from './entities/action-activity.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { instanceToPlain } from 'class-transformer';
import {
  Comment,
  CommentParentObject,
} from 'src/forum/entities/comment.entity';
import { CommentDto, CreateCommentDto } from 'src/forum/dto/comment.dto';

@Injectable()
export class ActionsService {
  constructor(
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    @InjectRepository(ActionEvent)
    private readonly actionEventRepository: Repository<ActionEvent>,
    @InjectRepository(UserAction)
    private readonly userActionRepository: Repository<UserAction>,
    @InjectRepository(ActionActivity)
    private readonly actionActivityRepository: Repository<ActionActivity>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private userService: UserService,
    public eventEmitter: EventEmitter2,
  ) {}

  async create(createActionDto: CreateActionDto): Promise<Action> {
    const action = this.actionRepository.create(createActionDto);
    return this.actionRepository.save(action);
  }

  findAll(): Promise<ActionDto[]> {
    return this.actionRepository
      .find({
        relations: ['userRelations', 'events'],
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
        relations: ['userRelations', 'events'],
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
      relations: ['userRelations', 'events'],
    });
    if (!action) {
      throw new NotFoundException('Action not found');
    }
    return instanceToPlain(action) as Action;
  }

  async setActionRelation(
    actionId: number,
    userId: number,
    status: UserActionRelation,
  ): Promise<UserAction> {
    const action = await this.findOne(actionId);
    const user = await this.userService.findOne(userId);
    if (!action || !user) {
      throw new NotFoundException('Action or user not found');
    }
    let userAction = await this.userActionRepository.findOne({
      where: { user: { id: userId }, action: { id: actionId } },
      relations: ['user', 'action'],
    });

    if (!userAction) {
      userAction = this.userActionRepository.create({
        user,
        action,
        status,
      });
    } else {
      userAction.status = status;
    }

    try {
      return await this.userActionRepository.save(userAction);
    } catch (error) {
      if (
        //TODO
        error.code === '23505' &&
        error.constraint === 'UQ_649286366665d12427427df5439'
      ) {
        const existingUserAction = await this.userActionRepository.findOne({
          where: { user: { id: userId }, action: { id: actionId } },
          relations: ['user', 'action'],
        });
        if (existingUserAction) {
          existingUserAction.status = status;
          return await this.userActionRepository.save(existingUserAction);
        }
      }
      throw error;
    }
  }

  async getActionRelation(
    actionId: number,
    userId: number,
  ): Promise<UserAction | null> {
    let userAction = await this.userActionRepository.findOne({
      where: { action: { id: actionId }, user: { id: userId } },
    });
    if (!userAction) {
      console.log('no userAction found, setting to none');
      userAction = await this.setActionRelation(
        actionId,
        userId,
        UserActionRelation.none,
      );
    }
    return userAction;
  }

  async joinAction(actionId: number, userId: number): Promise<UserAction> {
    const default_days = 3;

    const relation = await this.setActionRelation(
      actionId,
      userId,
      UserActionRelation.joined,
    );
    relation.dateCommitted = new Date();
    relation.deadline = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * default_days,
    );
    this.eventEmitter.emit('action.delta', { actionId, delta: +1 });

    const action = await this.findOne(actionId);
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Create activity record for user joining
    const activity = this.actionActivityRepository.create({
      type: ActionActivityType.USER_JOINED,
      actionId: actionId,
      userId: userId,
      action: action,
      user: user,
    });
    const savedActivity = await this.actionActivityRepository.save(activity);

    if (user) {
      const activityDto = new ActionActivityDto(savedActivity);
      this.eventEmitter.emit('action.activity', {
        actionId,
        activity: activityDto,
      });
    }

    const result = await this.userActionRepository.save(relation);

    await this.checkAndProcessAutomaticTransitions(actionId);

    return result;
  }

  async completeAction(actionId: number, userId: number): Promise<UserAction> {
    const relation = await this.setActionRelation(
      actionId,
      userId,
      UserActionRelation.completed,
    );

    const action = await this.findOne(actionId);
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create activity record for user completing
    const activity = this.actionActivityRepository.create({
      type: ActionActivityType.USER_COMPLETED,
      actionId,
      userId,
      action: action,
      user: user,
    });
    const savedActivity = await this.actionActivityRepository.save(activity);

    if (user) {
      const activityDto = new ActionActivityDto(savedActivity);
      this.eventEmitter.emit('action.activity', {
        actionId,
        activity: activityDto,
      });
    }

    await this.checkAndProcessAutomaticTransitions(actionId);

    return relation;
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
      this.userActionRepository.count({
        where: {
          action: { id: actionId },
          status: In(['joined', 'completed']),
        },
      }),
    );
  }

  async countCommittedBulk(ids: number[]): Promise<Record<number, number>> {
    if (!ids.length) return {};

    const rows = await this.userActionRepository
      .createQueryBuilder('ua')
      .select('ua.actionId', 'id')
      .addSelect('COUNT(*)', 'count')
      .where('ua.actionId IN (:...ids)', { ids })
      .andWhere('ua.status IN (:...statuses)', {
        statuses: ['joined', 'completed'],
      })
      .groupBy('ua.actionId')
      .getRawMany<{ id: string; count: string }>();

    const map: Record<number, number> = {};
    rows.forEach((r) => (map[+r.id] = +r.count));
    ids.forEach((id) => (map[id] ??= 0));
    return map;
  }

  async findCompletedForUser(userId: number): Promise<ActionDto[]> {
    const userActions = await this.userActionRepository.find({
      where: { user: { id: userId }, status: UserActionRelation.completed },
      relations: ['action', 'user'],
    });
    return userActions.map((ua) => ({
      ...ua.action,
      relation: ua,
      usersJoined: ua.action.usersJoined,
      usersCompleted: ua.action.usersCompleted,
      status: ua.action.status,
    }));
  }

  async userCoordinatesForAction(actionId: number): Promise<LatLonDto[]> {
    const userActions = await this.userActionRepository.find({
      where: {
        action: { id: actionId },
        status: In([UserActionRelation.joined, UserActionRelation.completed]),
      },
      relations: ['user', 'user.city'],
    });
    return userActions
      .filter(
        (
          ua,
        ): ua is typeof ua & {
          user: { city: NonNullable<typeof ua.user.city> };
        } => ua.user.city !== null,
      )
      .map((ua) => ({
        latitude: ua.user.city.latitude,
        longitude: ua.user.city.longitude,
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

  async getActivityFeed(limit: number = 50): Promise<ActionActivityDto[]> {
    const activities = await this.actionActivityRepository.find({
      relations: ['user', 'action'],
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
          ActionStatus.CommitmentsReached,
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
    await this.userActionRepository.delete({});
    await this.actionEventRepository.delete({});
    await this.actionRepository.delete({});
  }

  async setTestRelations(id: number) {
    const actions = await this.actionRepository.find({
      relations: ['userRelations', 'events'],
    });
    for (const action of actions) {
      if (action.status === ActionStatus.MemberAction) {
        await this.setActionRelation(action.id, id, UserActionRelation.joined);
      }
    }
  }

  async findActionRelations(userId: number): Promise<UserActionDto[]> {
    let userActions = await this.userActionRepository.find({
      where: {
        user: { id: userId },
        status: In(['joined', 'completed']),
      },
      relations: ['action', 'user', 'action.events'],
    });
    userActions = userActions.filter(
      (ua) => ua.action.status !== ActionStatus.Draft,
    );
    return userActions.map((ua) => new UserActionDto(ua));
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
    return new ActionActivityDto(activity, comments);
  }

  async likeActivity(id: number, userId: number, unlike = false) {
    const activity = await this.actionActivityRepository.findOne({
      where: { id },
      relations: ['user', 'action', 'likes'],
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const comment = this.commentRepository.create({
      ...commentDto,
      parentObjectType: CommentParentObject.Activity,
      parentObjectId: id,
      author: user,
      authorId: user.id,
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
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this activity');
    }
    await this.actionActivityRepository.update(id, updateActivityDto);
    return this.getActivity(id);
  }
}
