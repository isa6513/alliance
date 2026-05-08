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
  async getTimeSpentPerUser(): Promise<TimeSpentForUserDto[]> {
    const entries = await this.analyticsService.getTimeSpentPerUser();
    return entries.map((entry) => new TimeSpentForUserDto(entry));
  }

  @Get('time-spent-per-user-total')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: [TimeSpentForUserDto] })
  async getTimeSpentPerUserTotal(): Promise<TimeSpentForUserDto[]> {
    const entries = await this.analyticsService.getTimeSpentPerUserTotal();
    return entries.map((entry) => new TimeSpentForUserDto(entry));
  }

  @UseGuards(AdminGuard)
  @Get('daily-stats')
  @ApiOkResponse({ type: [DailyStatsDto] })
  async getDailyStats(
    @Query('date') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<DailyStatsDto[]> {
    const records = await this.analyticsService.getDailyStats(
      startDate,
      endDate,
    );
    return records.map((record) => new DailyStatsDto(record));
  }

  @UseGuards(AdminGuard)
  @Get('action-stats')
  @ApiOkResponse({ type: [ActionStatsWithOnboardingDto] })
  async getActionStats(): Promise<ActionStatsWithOnboardingDto[]> {
    const stats = await this.analyticsService.getActionStats();
    return stats.map((stat) => new ActionStatsWithOnboardingDto(stat));
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
    return new ActionStatsWithOnboardingDto(stats);
  }

  @UseGuards(AdminGuard)
  @Post('action-stats/recalculate')
  @ApiOkResponse({ type: [ActionStatsWithOnboardingDto] })
  async recalculateActionStats(): Promise<ActionStatsWithOnboardingDto[]> {
    await this.analyticsService.calculateActionStats();
    const stats = await this.analyticsService.getActionStats();
    return stats.map((stat) => new ActionStatsWithOnboardingDto(stat));
  }

  @UseGuards(AdminGuard)
  @Get('member-completion-retention')
  @ApiOkResponse({ type: [MemberCompletionRetentionCohortDto] })
  async getMemberCompletionRetention(): Promise<
    MemberCompletionRetentionCohortDto[]
  > {
    const cohorts =
      await this.analyticsService.getMemberCompletionRetentionByCohort();
    return cohorts.map(
      (cohort) => new MemberCompletionRetentionCohortDto(cohort),
    );
  }

  @UseGuards(AdminGuard)
  @Get('action-completion-curves')
  @ApiOkResponse({ type: [ActionCompletionCurveDto] })
  @ApiQuery({ name: 'actionId', required: false, type: String })
  @ApiQuery({ name: 'granularity', required: false, enum: ['daily', 'hourly'] })
  async getActionCompletionCurves(
    @Query('actionId') actionId?: string,
    @Query('granularity') granularity?: string,
  ): Promise<ActionCompletionCurveDto[]> {
    const parsedActionId = actionId ? Number(actionId) : undefined;
    const parsedGranularity = granularity === 'hourly' ? 'hourly' : 'daily';
    const curves = await this.analyticsService.getActionCompletionCurves(
      parsedActionId,
      parsedGranularity,
    );
    return curves.map((curve) => new ActionCompletionCurveDto(curve));
  }

  @UseGuards(AdminGuard)
  @Get('time-to-churn')
  @ApiOkResponse({ type: [TimeToChurnSampleDto] })
  async getTimeToChurnSamples(): Promise<TimeToChurnSampleDto[]> {
    const samples = await this.analyticsService.getTimeToChurnSamples();
    return samples.map((sample) => new TimeToChurnSampleDto(sample));
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
