import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { getImageSource } from 'src/images/images.service';
import { FriendStatus } from './friend.entity';
import { User } from './user.entity';

export class UserDto extends PickType(User, [
  'name',
  'email',
  'admin',
  'staff',
  'id',
  'onboardingComplete',
  'emailNotifsEnabled',
  'pushNotifsEnabled',
  'textNotifsEnabled',
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
  'staff',
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
      | 'staff'
      | 'email'
      | 'anonymous'
      | 'profilePicture'
      | 'profileDescription'
    >,
  ) {
    super();
    this.id = user.id;
    this.profileDescription = user.profileDescription;
    this.admin = user.admin;
    this.staff = user.staff;
    if (user.anonymous) {
      this.displayName = 'Someone';
    } else {
      this.displayName = user.name;
    }
    if (user.profilePicture) {
      this.profilePicture = getImageSource(user.profilePicture);
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
