import { ApiProperty, PickType } from '@nestjs/swagger';
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
    type: [Number],
    description: 'Bucket offsets (in days) from the member_action start date.',
  })
  dayOffsets: number[];

  @ApiProperty({
    type: [Number],
    description: 'Completion counts per bucket.',
  })
  completedCounts: number[];

  @ApiProperty({
    type: [Number],
    description:
      'Completion fraction per bucket (completedCounts / usersJoined).',
  })
  completionFractions: number[];
}
