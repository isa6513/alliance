import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Allow,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CommentDto } from 'src/forum/dto/comment.dto';
import { EditableContentDto } from 'src/forum/dto/editablecontent.dto';
import { ProfileDto, UserDto } from 'src/user/user.dto';
import { UserActionRelation } from '../actions.service';
import { ActionActivity } from '../entities/action-activity.entity';
import {
  ActionEvent,
  ActionStatus,
  NotificationType,
} from '../entities/action-event.entity';
import { ActionReminder } from '../entities/action-reminder.entity';
import { Action } from '../entities/action.entity';
import { getImageSource } from 'src/images/images.service';

export class ActionReminderDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  memberActionEventId: number;

  @ApiPropertyOptional()
  deadlineEventId?: number;

  @ApiPropertyOptional()
  customEmailMessage?: string;

  @ApiPropertyOptional()
  customTextMessage?: string;

  @ApiProperty({ type: Date })
  @Type(() => Date)
  sendAt: Date;

  @ApiPropertyOptional({ type: Date })
  @Type(() => Date)
  sentAt?: Date;

  @ApiProperty({ type: Number, isArray: true })
  userIds: number[];

  @ApiProperty({ type: ProfileDto, isArray: true })
  @Type(() => ProfileDto)
  users: ProfileDto[];

  constructor(reminder: ActionReminder) {
    this.id = reminder.id;
    this.memberActionEventId = reminder.memberActionEvent?.id ?? 0;
    this.deadlineEventId = reminder.deadlineEvent?.id ?? undefined;
    this.customEmailMessage = reminder.customEmailMessage ?? undefined;
    this.customTextMessage = reminder.customTextMessage ?? undefined;
    this.sendAt = reminder.sendAt;
    this.sentAt = reminder.sentAt ?? undefined;
    this.userIds = reminder.users?.map((user) => user.id) ?? [];
    this.users = reminder.users?.map((user) => new ProfileDto(user)) ?? [];
  }
}

export class CreateActionReminderDto {
  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDefined()
  @IsDate()
  sendAt: Date;

  @ApiPropertyOptional()
  @IsOptional()
  customEmailMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  customTextMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deadlineEventId?: number;

  @ApiProperty({ type: Number, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  userIds: number[];
}

export class ActionEventDto extends PickType(ActionEvent, [
  'id',
  'title',
  'description',
  'newStatus',
  'showInTimeline',
  'sendNotifsTo',
  'date',
  'announcementNotifsSentAt',
  'threeDayReminderNotifsSentAt',
  'oneDayReminderNotifsSentAt',
]) {
  constructor(event: ActionEvent) {
    super();
    Object.assign(this, event);
  }
}

export class AdminActionEventDto extends PickType(ActionEvent, [
  'id',
  'title',
  'description',
  'newStatus',
  'showInTimeline',
  'sendNotifsTo',
  'date',
  'announcementNotifsSentAt',
  'threeDayReminderNotifsSentAt',
  'oneDayReminderNotifsSentAt',
  'customReminders',
  'deadlineNotifsSentAt',
  'updatedAt',
  'notifications',
]) {
  constructor(event: ActionEvent) {
    super();
    Object.assign(this, event);
  }
}

export class CreateActionEventDto extends OmitType(ActionEventDto, [
  'id',
  'announcementNotifsSentAt',
  'threeDayReminderNotifsSentAt',
  'oneDayReminderNotifsSentAt',
]) {}

export class ActionDto extends OmitType(Action, [
  'createdAt',
  'updatedAt',
  'events',
]) {
  @ApiProperty()
  usersJoined: number;

  @ApiProperty()
  usersCompleted: number;

  @ApiProperty({ type: ActionEventDto, isArray: true })
  events: ActionEventDto[];

  @ApiProperty({ enum: ActionStatus, enumName: 'ActionStatus' })
  status: ActionStatus;

  @ApiPropertyOptional()
  canParticipate?: boolean;

  @ApiPropertyOptional()
  shouldParticipate?: boolean;

  constructor(
    action: Partial<Action>,
    canParticipate?: boolean,
    shouldParticipate?: boolean,
  ) {
    super();
    Object.assign(this, action);
    this.image = action.image ? getImageSource(action.image) : undefined;
    this.usersJoined = action.usersJoined || 0;
    this.usersCompleted = action.usersCompleted || 0;
    this.status = action.status || ActionStatus.Draft;
    this.events =
      action.events?.map((event) => new ActionEventDto(event)) || [];
    this.canParticipate = canParticipate ?? false;
    this.shouldParticipate = shouldParticipate ?? false;
  }
}

export class CreateActionDto extends OmitType(ActionDto, [
  'id',
  'usersJoined',
  'events',
  'activities',
  'usersCompleted',
  'status',
  'taskContents',
  'events',
  'archived',
]) {}

export class UpdateActionDto extends PartialType(CreateActionDto) {}

export class LatLonDto {
  @ApiProperty({ type: Number })
  latitude: number;

  @ApiProperty({ type: Number })
  longitude: number;
}

export class DeclineActionDto {
  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty()
  @IsBoolean()
  moral: boolean;
}

export class OptOutActionDto {
  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty()
  @IsBoolean()
  outOfTime: boolean;
}

export class ActionActivityDto extends PickType(ActionActivity, [
  'id',
  'type',
  'createdAt',
]) {
  @ApiProperty({ type: () => ProfileDto })
  @Type(() => ProfileDto)
  @Allow()
  user: ProfileDto;

  @ApiProperty()
  @Allow()
  actionId: number;

  @ApiProperty({ type: () => ActionDto })
  @Type(() => ActionDto)
  @Allow()
  action: ActionDto;

  @ApiProperty()
  @Allow()
  actionName: string;

  @ApiProperty({ type: () => ProfileDto, isArray: true })
  @Type(() => ProfileDto)
  @Allow()
  likes: ProfileDto[];

  @ApiProperty({ type: () => CommentDto, isArray: true })
  @Type(() => CommentDto)
  @Allow()
  comments: CommentDto[];

  @ApiProperty({ type: () => EditableContentDto })
  @Type(() => EditableContentDto)
  @Allow()
  editableContent: EditableContentDto;

  constructor(actionActivity: ActionActivity, comments: CommentDto[] = []) {
    super();
    Object.assign(this, actionActivity);
    this.actionId = actionActivity.action.id;
    this.action = new ActionDto(actionActivity.action);
    this.actionName = actionActivity.action.name;
    this.user = new ProfileDto(actionActivity.user);
    this.likes =
      actionActivity.likes !== undefined
        ? actionActivity.likes.map((like) => new ProfileDto(like))
        : [];
    this.comments = comments;
    if (!this.editableContent) {
      this.editableContent = {
        body: '',
        attachments: [],
      };
    }
  }
}

export class CreateActionActivityDto extends PickType(ActionActivityDto, [
  'actionId',
  'type',
]) {
  @ApiProperty()
  @IsNumber()
  userId: number;
}

export class UpdateActionActivityDto extends PickType(ActionActivityDto, [
  'editableContent',
]) {}

export class ActionRelationsDto {
  @ApiProperty({ type: () => Map<number, UserActionRelation> })
  relations: Map<number, UserActionRelation>;
}

export class PreEventNotifDataDto {
  @ApiProperty({ type: () => UserDto, isArray: true })
  emails: UserDto[];

  @ApiProperty({ type: () => UserDto, isArray: true })
  texts: UserDto[];

  @ApiProperty({ type: () => UserDto, isArray: true })
  pushes: UserDto[];
}

export class PreEventNotifDataQueryDto {
  @ApiProperty({ enum: ActionStatus, enumName: 'ActionStatus' })
  @Allow()
  type: ActionStatus;

  @ApiProperty({ enum: NotificationType, enumName: 'NotificationType' })
  @Allow()
  sendNotifsTo: NotificationType;
}
