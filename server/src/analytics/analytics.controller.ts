import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TimeSpentForUserDto } from './timespent.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('time-spent-per-user')
  @ApiOkResponse({ type: [TimeSpentForUserDto] })
  getTimeSpentPerUser() {
    return this.analyticsService.getTimeSpentPerUser();
  }

  @Get('time-spent-per-user-total')
  @ApiOkResponse({ type: [TimeSpentForUserDto] })
  getTimeSpentPerUserTotal() {
    return this.analyticsService.getTimeSpentPerUserTotal();
  }
}
