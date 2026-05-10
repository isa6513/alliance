import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Allow, IsNumber, IsOptional } from 'class-validator';
import { OnetimeInvite } from '../entities/onetime-invite.entity';
import { CommunityInvite } from 'src/community/entities/community-invite.entity';
import { ProfileDto } from './user.dto';
import { Type } from 'class-transformer';

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
  'community',
]) {
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
    this.community = communityInvite.community;
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
  'community',
  'invitedUserId',
]) {
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
    this.community = onetimeInvite.community;
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
