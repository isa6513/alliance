import { OmitType } from '@nestjs/swagger';
import { DailyStatsRecord } from './dailystats.entity';

export class DailyStatsDto extends OmitType(DailyStatsRecord, [] as const) {}
