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
    Object.assign(this, communityInvite);
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
  @ApiProperty({ type: ProfileDto })
  @Type(() => ProfileDto)
  invitingUser: ProfileDto;

  constructor(onetimeInvite: OnetimeInvite) {
    super();
    Object.assign(this, onetimeInvite);
    this.invitingUser = new ProfileDto(onetimeInvite.invitingUser);
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
