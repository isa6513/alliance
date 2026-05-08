import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { ActionStatsRecord } from './actionstats.entity';

export type ActionCompletionCurve = {
  actionId: number;
  actionName: string;
  usersJoined: number;
  memberActionStartDate?: Date;
  memberActionEndDate?: Date;
  bucketDays: number;
  dayOffsets: number[];
  completedCounts: number[];
  completionFractions: number[];
  bucketHours?: number;
  hourOffsets?: number[];
};

export class ActionCompletionCurveDto extends PickType(ActionStatsRecord, [
  'actionId',
  'actionName',
  'usersJoined',
  'memberActionStartDate',
  'memberActionEndDate',
] as const) {
  @ApiProperty({
    description: 'Bucket size in days used to group completions.',
    example: 1,
  })
  bucketDays: number;

  @ApiProperty({
    type: Number,
    isArray: true,
    description: 'Bucket offsets (in days) from the member_action start date.',
  })
  dayOffsets: number[];

  @ApiProperty({
    type: Number,
    isArray: true,
    description: 'Completion counts per bucket.',
  })
  completedCounts: number[];

  @ApiProperty({
    type: Number,
    isArray: true,
    description:
      'Completion fraction per bucket (completedCounts / usersJoined).',
  })
  completionFractions: number[];

  @ApiPropertyOptional({
    description: 'Bucket size in hours (present when granularity is hourly).',
    example: 1,
  })
  bucketHours?: number;

  @ApiPropertyOptional({
    type: Number,
    isArray: true,
    description:
      'Bucket offsets (in hours) from the member_action start date (present when granularity is hourly).',
  })
  hourOffsets?: number[];

  constructor(input: ActionCompletionCurve) {
    super();
    this.actionId = input.actionId;
    this.actionName = input.actionName;
    this.usersJoined = input.usersJoined;
    this.memberActionStartDate = input.memberActionStartDate;
    this.memberActionEndDate = input.memberActionEndDate;
    this.bucketDays = input.bucketDays;
    this.dayOffsets = input.dayOffsets;
    this.completedCounts = input.completedCounts;
    this.completionFractions = input.completionFractions;
    this.bucketHours = input.bucketHours;
    this.hourOffsets = input.hourOffsets;
  }
}
