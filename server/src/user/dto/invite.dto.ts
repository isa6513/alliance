import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Allow,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { CommunityDto } from 'src/community/dto/community.dto';
import { CommunityInvite } from 'src/community/entities/community-invite.entity';
import { AmbassadorInviteGoal } from '../entities/ambassador-invite-goal.entity';
import { OnetimeInvite } from '../entities/onetime-invite.entity';
import { ProfileDto } from './user.dto';

export class CreateOnetimeInviteDto extends PickType(OnetimeInvite, [
  'invitee',
  'info',
]) {
  @ApiPropertyOptional()
  @IsOptional()
  invitingUserId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  communityId?: number;
}

export class CreateCommunityInviteDto {
  @ApiProperty()
  @Allow()
  invitedUserId: number;

  @ApiProperty()
  @Allow()
  communityId: number;
}

export class RequestCommunityInviteDto {
  @ApiProperty()
  @Allow()
  communityId: number;

  @ApiProperty()
  @Allow()
  invitedUserId: number;
}

export class CommunityInviteDto extends PickType(CommunityInvite, [
  'id',
  'status',
  'createdAt',
  'updatedAt',
]) {
  @ApiProperty({ type: CommunityDto })
  @Type(() => CommunityDto)
  community: CommunityDto;

  @ApiPropertyOptional({ type: ProfileDto })
  invitedUser?: ProfileDto;

  @ApiPropertyOptional({ type: ProfileDto })
  invitingUser?: ProfileDto;

  constructor(communityInvite: CommunityInvite) {
    super();
    this.id = communityInvite.id;
    this.status = communityInvite.status;
    this.createdAt = communityInvite.createdAt;
    this.updatedAt = communityInvite.updatedAt;
    this.community = new CommunityDto(communityInvite.community);
    this.invitedUser = communityInvite.invitedUser
      ? new ProfileDto(communityInvite.invitedUser)
      : undefined;
    this.invitingUser = communityInvite.invitingUser
      ? new ProfileDto(communityInvite.invitingUser)
      : undefined;
  }
}

export class OnetimeInviteDto extends PickType(OnetimeInvite, [
  'id',
  'invitee',
  'inviteeDescription',
  'info',
  'code',
  'status',
  'createdAt',
  'invitedUserId',
]) {
  @ApiPropertyOptional({ type: CommunityDto })
  @Type(() => CommunityDto)
  community?: CommunityDto | null;

  @ApiPropertyOptional({ type: ProfileDto })
  @Type(() => ProfileDto)
  invitingUser?: ProfileDto;

  @ApiPropertyOptional({ type: ProfileDto })
  @Type(() => ProfileDto)
  invitedUser?: ProfileDto;

  constructor(onetimeInvite: OnetimeInvite) {
    super();
    this.id = onetimeInvite.id;
    this.invitee = onetimeInvite.invitee;
    this.inviteeDescription = onetimeInvite.inviteeDescription;
    this.info = onetimeInvite.info;
    this.code = onetimeInvite.code;
    this.status = onetimeInvite.status;
    this.createdAt = onetimeInvite.createdAt;
    this.community = onetimeInvite.community
      ? new CommunityDto(onetimeInvite.community)
      : onetimeInvite.community;
    this.invitedUserId = onetimeInvite.invitedUserId;
    this.invitingUser = onetimeInvite.invitingUser
      ? new ProfileDto(onetimeInvite.invitingUser)
      : undefined;
    this.invitedUser = onetimeInvite.invitedUser
      ? new ProfileDto(onetimeInvite.invitedUser)
      : undefined;
  }
}

export class RequestOnetimeInviteDto extends PickType(OnetimeInvite, [
  'invitee',
  'inviteeDescription',
]) {
  @ApiPropertyOptional()
  @IsOptional()
  invitingUserId?: number;

  @ApiProperty()
  @Allow()
  communityId: number;
}

export class CreateAmbassadorInviteGoalDto extends PickType(
  AmbassadorInviteGoal,
  ['targetSuccessfulRecruits'],
) {
  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  dueAt: string;
}

export class UpdateAmbassadorInviteGoalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  targetSuccessfulRecruits?: number;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}

export class AmbassadorInviteGoalDto extends PickType(AmbassadorInviteGoal, [
  'id',
  'targetSuccessfulRecruits',
  'startAt',
  'dueAt',
  'createdAt',
  'updatedAt',
]) {
  constructor(goal: AmbassadorInviteGoal) {
    super();
    this.id = goal.id;
    this.targetSuccessfulRecruits = goal.targetSuccessfulRecruits;
    this.startAt = goal.startAt;
    this.dueAt = goal.dueAt;
    this.createdAt = goal.createdAt;
    this.updatedAt = goal.updatedAt;
  }
}

export type AmbassadorInviteStats = {
  totalInvitesSent: number;
  totalAcceptedInvites: number;
  totalSuccessfulRecruits: number;
  goalSuccessfulRecruits: number;
};

export class AmbassadorInviteStatsDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  totalInvitesSent: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  totalAcceptedInvites: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  totalSuccessfulRecruits: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  goalSuccessfulRecruits: number;

  constructor(stats: AmbassadorInviteStats) {
    this.totalInvitesSent = stats.totalInvitesSent;
    this.totalAcceptedInvites = stats.totalAcceptedInvites;
    this.totalSuccessfulRecruits = stats.totalSuccessfulRecruits;
    this.goalSuccessfulRecruits = stats.goalSuccessfulRecruits;
  }
}

export type AmbassadorInviteGoalWithStats = {
  goal: AmbassadorInviteGoal;
  stats: AmbassadorInviteStats;
};

export class AmbassadorInviteGoalWithStatsDto {
  @ApiProperty({ type: AmbassadorInviteGoalDto })
  @Type(() => AmbassadorInviteGoalDto)
  goal: AmbassadorInviteGoalDto;

  @ApiProperty({ type: AmbassadorInviteStatsDto })
  @Type(() => AmbassadorInviteStatsDto)
  stats: AmbassadorInviteStatsDto;

  constructor(input: AmbassadorInviteGoalWithStats) {
    this.goal = new AmbassadorInviteGoalDto(input.goal);
    this.stats = new AmbassadorInviteStatsDto(input.stats);
  }
}

export type AmbassadorInviteDashboard = {
  goals: AmbassadorInviteGoalWithStats[];
  stats: AmbassadorInviteStats;
};

export class AmbassadorInviteDashboardDto {
  @ApiProperty({ type: AmbassadorInviteGoalWithStatsDto, isArray: true })
  @Type(() => AmbassadorInviteGoalWithStatsDto)
  goals: AmbassadorInviteGoalWithStatsDto[];

  @ApiProperty({ type: AmbassadorInviteStatsDto })
  @Type(() => AmbassadorInviteStatsDto)
  stats: AmbassadorInviteStatsDto;

  constructor(input: AmbassadorInviteDashboard) {
    this.goals = input.goals.map(
      (goal) => new AmbassadorInviteGoalWithStatsDto(goal),
    );
    this.stats = new AmbassadorInviteStatsDto(input.stats);
  }
}
