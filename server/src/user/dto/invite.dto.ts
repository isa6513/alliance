import { ApiProperty, PickType } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { OnetimeInvite } from '../entities/onetime-invite.entity';

export class CreateOnetimeInviteDto extends PickType(OnetimeInvite, [
  'invitee',
]) {
  @ApiProperty()
  @Allow()
  invitingUserId: number;
}

export class OnetimeInviteDto extends PickType(OnetimeInvite, [
  'id',
  'invitee',
  'invitingUser',
  'code',
  'isValid',
  'createdAt',
]) {}
