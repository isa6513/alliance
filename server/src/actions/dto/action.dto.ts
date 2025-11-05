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
  IsBoolean,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CommentDto } from 'src/forum/dto/comment.dto';
import {
  CreateEditableContentDto,
  EditableContentDto,
} from 'src/forum/dto/editablecontent.dto';
import { ProfileDto } from 'src/user/user.dto';
import { UserActionRelation } from '../actions.service';
import { ActionActivity } from '../entities/action-activity.entity';
import { ActionEvent, ActionStatus } from '../entities/action-event.entity';
import { Action } from '../entities/action.entity';
import { getImageSource } from 'src/images/images.service';
import { ActionUpdate } from '../entities/action-update.entity';
import { ReminderGroup } from '../entities/reminder-group.entity';
import { ActionSuite } from '../entities/action-suite.entity';

export class CreateTODReminderGroupDto extends PickType(ReminderGroup, [
  'name',
  'emailMessage',
  'cohortType',
  'timingMode',
  'emailSubject',
  'textMessage',
  'sendAtAbsolute',
  'sendAtSecondsFromDeadline',
  'send_range_start',
  'send_range_end',
]) {
  @ApiPropertyOptional({ type: Number, isArray: true })
  @IsOptional()
  userIds?: number[];

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  userGroupId?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  suiteId?: number;
}

export class PreviewEmailHtmlDto extends PickType(CreateTODReminderGroupDto, [
  'emailMessage',
  'emailSubject',
]) {}

export class PreviewTextDto extends PickType(CreateTODReminderGroupDto, [
  'textMessage',
]) {}

export class ActionEventDto extends PickType(ActionEvent, [
  'id',
  'title',
  'description',
  'newStatus',
  'showInTimeline',
  'suiteManaged',
  'date',
]) {
  constructor(event: ActionEvent) {
    super();
    Object.assign(this, event);
  }
}

export class CreateActionEventDto extends OmitType(ActionEventDto, [
  'id',
  'suiteManaged',
]) {}

export class UpdateActionEventDto extends PartialType(CreateActionEventDto) {}

export class ActionDto extends OmitType(Action, [
  'createdAt',
  'updatedAt',
  'events',
]) {
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

  @ApiPropertyOptional({
    enum: UserActionRelation,
    enumName: 'UserActionRelation',
  })
  userRelation?: UserActionRelation;

  @ApiPropertyOptional()
  reqAuthenticated?: boolean;

  constructor(
    action: Partial<Action>,
    extra?: {
      canParticipate?: boolean;
      shouldParticipate?: boolean;
      userRelation?: UserActionRelation;
      reqAuthenticated?: boolean;
    },
  ) {
    super();
    Object.assign(this, action);
    this.image = action.image ? getImageSource(action.image) : undefined;
    this.usersCompleted = action.usersCompleted || 0;
    this.status = action.status || ActionStatus.Draft;
    this.events =
      action.events?.map((event) => new ActionEventDto(event)) || [];
    this.canParticipate = extra?.canParticipate;
    this.shouldParticipate = extra?.shouldParticipate;
    this.userRelation = extra?.userRelation;
    this.reqAuthenticated = extra?.reqAuthenticated;
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
  'suite',
  'archived',
  'updates',
]) {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  suiteId?: number;
}

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
  'actionId',
]) {
  @ApiProperty({ type: () => ProfileDto })
  @Type(() => ProfileDto)
  @Allow()
  user: ProfileDto;

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
    this.actionName = actionActivity.action?.name;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { action, ...rest } = actionActivity;
    Object.assign(this, rest);
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

export class CreateActionUpdateDto extends PickType(ActionUpdate, [
  'title',
  'displayDate',
  'visibleAt',
  'notifyType',
]) {
  @ApiProperty({ type: () => CreateEditableContentDto })
  @Type(() => CreateEditableContentDto)
  @IsDefined()
  content: CreateEditableContentDto;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  associatedEventId?: number;
}

export class CreateActionSuiteDto extends PickType(ActionSuite, ['name']) {}

export class ActionSuiteDto extends OmitType(ActionSuite, ['actions']) {
  @ApiProperty({ type: () => ActionDto, isArray: true })
  @Type(() => ActionDto)
  @Allow()
  actions: ActionDto[];

  constructor(suite: ActionSuite, actions?: ActionDto[]) {
    super();
    Object.assign(this, suite);
    this.actions =
      actions || suite.actions.map((action) => new ActionDto(action));
  }
}
