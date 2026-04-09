import { ApiProperty } from '@nestjs/swagger';

export class MemberCompletionRetentionActionSummaryDto {
  @ApiProperty()
  actionId: number;

  @ApiProperty()
  actionName: string;

  @ApiProperty()
  memberCount: number;
}

export class MemberCompletionRetentionPointDto {
  @ApiProperty()
  weekIndex: number;

  @ApiProperty()
  actionIndex: number;

  @ApiProperty()
  actionStartDate: string;

  @ApiProperty()
  completionRate: number;

  @ApiProperty()
  joinedCount: number;

  @ApiProperty()
  completedCount: number;

  @ApiProperty()
  weekCompletionRate: number;

  @ApiProperty()
  weekJoinedCount: number;

  @ApiProperty()
  weekCompletedCount: number;

  @ApiProperty({ type: () => MemberCompletionRetentionActionSummaryDto, isArray: true })
  actions: MemberCompletionRetentionActionSummaryDto[];
}

export class MemberCompletionRetentionCohortDto {
  @ApiProperty()
  cohortStart: string;

  @ApiProperty()
  cohortSize: number;

  @ApiProperty({ type: () => MemberCompletionRetentionPointDto, isArray: true })
  points: MemberCompletionRetentionPointDto[];
}
