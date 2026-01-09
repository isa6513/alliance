import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DailyStatsRecord } from './dailystats.entity';
import { ActionStatsRecord } from './actionstats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ActionActivity } from 'src/actions/entities/action-activity.entity';
import { OnetimeInvite } from 'src/user/entities/onetime-invite.entity';
import { FormResponse } from 'src/tasks/entities/formresponse.entity';
import { Action } from 'src/actions/entities/action.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      DailyStatsRecord,
      ActionStatsRecord,
      User,
      ActionActivity,
      OnetimeInvite,
      FormResponse,
      Action,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
