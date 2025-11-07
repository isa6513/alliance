import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Allow, IsNumber, IsOptional } from 'class-validator';
import { OnetimeInvite } from '../entities/onetime-invite.entity';

export class CreateOnetimeInviteDto extends PickType(OnetimeInvite, [
  'invitee',
]) {
  @ApiProperty()
  @Allow()
  invitingUserId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  communityId?: number;
}

export class OnetimeInviteDto extends PickType(OnetimeInvite, [
  'id',
  'invitee',
  'invitingUser',
  'code',
  'isValid',
  'createdAt',
  'community',
]) {}
