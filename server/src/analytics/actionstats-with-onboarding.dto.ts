import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ActionStatsRecord } from './actionstats.entity';

export class ActionStatsWithOnboardingDto extends OmitType(
  ActionStatsRecord,
  [] as const,
) {
  @ApiProperty({
    description: 'Whether the action is marked as onboarding.',
  })
  onboarding: boolean;
}
