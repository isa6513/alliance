import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Allow, IsBoolean, IsString } from 'class-validator';
import { CommentDto } from 'src/forum/dto/comment.dto';
import { EditableContentDto } from 'src/forum/dto/editablecontent.dto';
import { ProfileDto } from 'src/user/user.dto';
import { UserActionRelation } from '../actions.service';
import { ActionActivity } from '../entities/action-activity.entity';
import {
  ActionEvent,
  ActionStatus,
  NotificationType,
} from '../entities/action-event.entity';
import { Action } from '../entities/action.entity';

export class ActionEventDto extends PickType(ActionEvent, [
  'id',
  'title',
  'description',
  'newStatus',
  'showInTimeline',
  'sendNotifsTo',
  'date',
  'deadline',
]) {
  constructor(partial: Partial<ActionEventDto>) {
    super();
    Object.assign(this, partial);
  }
}

export class CreateActionEventDto extends OmitType(ActionEventDto, ['id']) {}

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

  constructor(action: Partial<Action>) {
    super();
    Object.assign(this, action);
    this.usersJoined = action.usersJoined || 0;
    this.usersCompleted = action.usersCompleted || 0;
    this.status = action.status || ActionStatus.Draft;
    this.events =
      action.events?.map((event) => new ActionEventDto({ ...event })) || [];
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
  user: ProfileDto;

  @ApiProperty()
  actionId: number;

  @ApiProperty({ type: () => ActionDto })
  action: ActionDto;

  @ApiProperty()
  actionName: string;

  @ApiProperty({ type: () => ProfileDto, isArray: true })
  likes: ProfileDto[];

  @ApiProperty({ type: () => CommentDto, isArray: true })
  comments: CommentDto[];

  @ApiProperty({ type: () => EditableContentDto })
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

export class UpdateActionActivityDto extends PickType(ActionActivityDto, [
  'editableContent',
]) {}

export class ActionRelationsDto {
  @ApiProperty({ type: () => Map<number, UserActionRelation> })
  relations: Map<number, UserActionRelation>;
}

export class PreEventNotifDataDto {
  @ApiProperty()
  n_emails: number;

  @ApiProperty()
  n_texts: number;

  @ApiProperty()
  n_pushes: number;
}

export class PreEventNotifDataQueryDto {
  @ApiProperty({ enum: ActionStatus, enumName: 'ActionStatus' })
  @Allow()
  type: ActionStatus;

  @ApiProperty({ enum: NotificationType, enumName: 'NotificationType' })
  @Allow()
  sendNotifsTo: NotificationType;
}
