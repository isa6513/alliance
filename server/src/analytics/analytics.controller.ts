import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TimeSpentForUserDto } from './timespent.dto';
import { DailyStatsDto } from './dailystats.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { MemberCompletionRetentionCohortDto } from './member-completion-retention.dto';
import { AggregateStatsDto } from './aggregatestats.dto';
import { ContractStatusPointDto } from './contract-status-history.dto';
import { TimeToChurnSampleDto } from './time-to-churn.dto';
import { ActionCompletionCurveDto } from './action-completion-curve.dto';
import { ActionStatsWithOnboardingDto } from './actionstats-with-onboarding.dto';
import { InviteFunnelDto } from './invite-funnel.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('time-spent-per-user')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: [TimeSpentForUserDto] })
  getTimeSpentPerUser(): Promise<TimeSpentForUserDto[]> {
    return this.analyticsService.getTimeSpentPerUser();
  }

  @Get('time-spent-per-user-total')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: [TimeSpentForUserDto] })
  getTimeSpentPerUserTotal(): Promise<TimeSpentForUserDto[]> {
    return this.analyticsService.getTimeSpentPerUserTotal();
  }

  @UseGuards(AdminGuard)
  @Get('daily-stats')
  @ApiOkResponse({ type: [DailyStatsDto] })
  getDailyStats(
    @Query('date') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<DailyStatsDto[]> {
    return this.analyticsService.getDailyStats(startDate, endDate);
  }

  @UseGuards(AdminGuard)
  @Get('action-stats')
  @ApiOkResponse({ type: [ActionStatsWithOnboardingDto] })
  getActionStats(): Promise<ActionStatsWithOnboardingDto[]> {
    return this.analyticsService.getActionStats();
  }

  @UseGuards(AdminGuard)
  @Get('action-stats/:actionId')
  @ApiOkResponse({ type: ActionStatsWithOnboardingDto })
  async getActionStatsById(
    @Param('actionId') actionId: string,
  ): Promise<ActionStatsWithOnboardingDto> {
    const stats = await this.analyticsService.getActionStatsById(
      Number(actionId),
    );
    if (!stats) {
      throw new NotFoundException('Action stats not found');
    }
    return stats;
  }

  @UseGuards(AdminGuard)
  @Post('action-stats/recalculate')
  @ApiOkResponse({ type: [ActionStatsWithOnboardingDto] })
  async recalculateActionStats(): Promise<ActionStatsWithOnboardingDto[]> {
    await this.analyticsService.calculateActionStats();
    return this.analyticsService.getActionStats();
  }

  @UseGuards(AdminGuard)
  @Get('member-completion-retention')
  @ApiOkResponse({ type: [MemberCompletionRetentionCohortDto] })
  getMemberCompletionRetention(): Promise<
    MemberCompletionRetentionCohortDto[]
  > {
    return this.analyticsService.getMemberCompletionRetentionByCohort();
  }

  @UseGuards(AdminGuard)
  @Get('action-completion-curves')
  @ApiOkResponse({ type: [ActionCompletionCurveDto] })
  @ApiQuery({ name: 'actionId', required: false, type: String })
  @ApiQuery({ name: 'granularity', required: false, enum: ['daily', 'hourly'] })
  getActionCompletionCurves(
    @Query('actionId') actionId?: string,
    @Query('granularity') granularity?: string,
  ): Promise<ActionCompletionCurveDto[]> {
    const parsedActionId = actionId ? Number(actionId) : undefined;
    const parsedGranularity = granularity === 'hourly' ? 'hourly' : 'daily';
    return this.analyticsService.getActionCompletionCurves(
      parsedActionId,
      parsedGranularity,
    );
  }

  @UseGuards(AdminGuard)
  @Get('time-to-churn')
  @ApiOkResponse({ type: [TimeToChurnSampleDto] })
  getTimeToChurnSamples(): Promise<TimeToChurnSampleDto[]> {
    return this.analyticsService.getTimeToChurnSamples();
  }

  @UseGuards(AdminGuard)
  @Get('aggregate-stats')
  @ApiOkResponse({ type: AggregateStatsDto })
  async getAggregateStats(): Promise<AggregateStatsDto> {
    return await this.analyticsService.getAggregateStats();
  }

  @UseGuards(AdminGuard)
  @Get('invite-funnel')
  @ApiOkResponse({ type: InviteFunnelDto })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getInviteFunnel(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<InviteFunnelDto> {
    return await this.analyticsService.getInviteFunnel(startDate, endDate);
  }

  @UseGuards(AdminGuard)
  @Get('contract-status-history')
  @ApiOkResponse({ type: [ContractStatusPointDto] })
  async getContractStatusHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ContractStatusPointDto[]> {
    return await this.analyticsService.getContractStatusHistory(
      startDate,
      endDate,
    );
  }
}
