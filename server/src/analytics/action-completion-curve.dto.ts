import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { ActionStatsRecord } from './actionstats.entity';

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
}
