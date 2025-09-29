import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActionStatus } from 'src/actions/entities/action-event.entity';
import { ActionActivityType } from 'src/actions/entities/action-activity.entity';

export enum UserActionRelationStatus {
  None = 'none',
  Joined = 'joined',
  Completed = 'completed',
  Declined = 'declined',
  WontComplete = 'wont_complete',
  MissedDeadline = 'missed_deadline',
}

export class UserActionSummaryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ActionStatus, enumName: 'ActionStatus' })
  status: ActionStatus;
}

export class UserActionRelationDetailDto {
  @ApiProperty()
  actionId: number;

  @ApiProperty({
    enum: UserActionRelationStatus,
    enumName: 'UserActionRelationStatus',
  })
  status: UserActionRelationStatus;

  @ApiPropertyOptional({
    enum: ActionActivityType,
    enumName: 'ActionActivityType',
  })
  latestActivityType?: ActionActivityType;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  latestActivityAt?: string;
}

export class UserActionRelationsForUserDto {
  @ApiProperty()
  userId: number;

  @ApiProperty({ type: () => UserActionRelationDetailDto, isArray: true })
  relations: UserActionRelationDetailDto[];
}

export class UserActionRelationsResponseDto {
  @ApiProperty({ type: () => UserActionSummaryDto, isArray: true })
  actions: UserActionSummaryDto[];

  @ApiProperty({ type: () => UserActionRelationsForUserDto, isArray: true })
  users: UserActionRelationsForUserDto[];
}
