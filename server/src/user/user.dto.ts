import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { FriendStatus } from './friend.entity';
import { User } from './user.entity';

export class UserDto extends PickType(User, [
  'name',
  'email',
  'admin',
  'id',
  'onboardingComplete',
  'primaryNotificationChannel',
  'socialNotifsPreference',
  'turnedOffAllNotifs',
  'referralCode',
  'anonymous',
]) {
  @ApiPropertyOptional()
  @IsOptional()
  cityId?: number;
}

export class FriendStatusDto {
  @ApiProperty({ enum: FriendStatus, nullable: true, enumName: 'FriendStatus' })
  status: FriendStatus;
}

export class ProfileDto extends PickType(User, [
  'admin',
  'id',
  'profilePicture',
  'profileDescription',
]) {
  @ApiProperty()
  displayName: string;

  constructor(
    user: Pick<
      User,
      | 'id'
      | 'name'
      | 'admin'
      | 'email'
      | 'anonymous'
      | 'profilePicture'
      | 'profileDescription'
    >,
  ) {
    super();
    this.id = user.id;
    this.profilePicture = user.profilePicture;
    this.profileDescription = user.profileDescription;
    this.admin = user.admin;
    if (user.anonymous) {
      this.displayName = 'Someone';
    } else {
      this.displayName = user.name;
    }
  }
}

// used instead of constructor to propagate nulls (TODO? ugly but maybe fine)
export function userToDto(user: User | null): ProfileDto | null {
  if (!user) {
    return null;
  }
  return new ProfileDto(user);
}

export class UpdateProfileDto extends PartialType(OmitType(User, ['city'])) {
  @ApiPropertyOptional()
  @IsOptional()
  cityId?: number;
}

export class OnboardingDto extends PickType(User, ['over18', 'anonymous']) {
  @ApiPropertyOptional()
  @IsOptional()
  cityId?: number;
}

export class ReferralDto {
  @ApiProperty({ type: String })
  referralCode: string;
}
