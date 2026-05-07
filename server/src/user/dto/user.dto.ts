import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Allow,
  IsArray,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { getImageSource } from 'src/images/images.service';
import { FriendStatus } from '../entities/friend.entity';
import { User } from '../entities/user.entity';
import { ContractEvent } from '../entities/contract-event.entity';

export class FriendStatusDto {
  @ApiProperty({ enum: FriendStatus, nullable: true, enumName: 'FriendStatus' })
  status: FriendStatus;
  @ApiProperty()
  didReceiveRequest: boolean;
}

export class ProfileDto extends PickType(User, [
  'admin',
  'staff',
  'id',
  'profilePicture',
  'profileDescription',
  'anonymous',
]) {
  @ApiProperty()
  displayName: string;

  @ApiProperty()
  hasActiveContract: boolean;

  @ApiProperty()
  isCommunityLeader: boolean;

  @ApiPropertyOptional({ type: ContractEvent })
  lastContractEvent?: ContractEvent;

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
      | 'hasActiveContract'
      | 'isCommunityLeader'
      | 'contractEvents'
    >,
  ) {
    super();
    this.id = user.id;
    this.profileDescription = user.profileDescription;
    this.admin = user.admin;
    this.staff = user.staff;
    this.hasActiveContract = user.hasActiveContract;
    this.isCommunityLeader = user.isCommunityLeader;
    this.anonymous = user.anonymous;
    this.lastContractEvent = user.contractEvents?.length
      ? user.contractEvents?.sort(
          (a, b) => b.date.getTime() - a.date.getTime(),
        )[0]
      : undefined;
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

export class ProfileDtoWithFriends extends ProfileDto {
  @ApiProperty({ type: ProfileDto, isArray: true })
  @Type(() => ProfileDto)
  @Allow()
  friends: ProfileDto[];

  constructor(user: User) {
    super(user);
    this.friends = user.friends.map((friend) => new ProfileDto(friend));
  }
}

/** Public signup page: overlapping avatars + name line (min 5 faces when DB allows). */
export class SignupSocialProofDto {
  @ApiProperty({ type: ProfileDto, isArray: true })
  profiles: ProfileDto[];

  constructor(profiles: ProfileDto[]) {
    this.profiles = profiles;
  }
}

export class UserDto extends PickType(User, [
  'name',
  'admin',
  'staff',
  'id',
  'emailNotifsForActions',
  'pushNotifsForActions',
  'textNotifsForActions',
  'profileDescription',
  'forumDigestPreference',
  'turnedOffAllNotifs',
  'referralCode',
  'referralSource',
  'anonymous',
  'pushesForLikes',
  'pushesForComments',
  'pushesForFriendRequests',
  'pushesForMessages',
  'pushesForActionUpdates',
  'phoneNumber',
  'communities',
  'profilePicture',
  'leaderOfIds',
  'activities',
  'shareEmailWithCommunityLead',
  'sharePhoneNumberWithCommunityLead',
  'preferredReminderTime',
  'remindAboutUncompletedGroupMembers',
  'timeZone',
  'formDataPreference',
  'contractEvents',
  'shareInfoPublicly',
  'customCityString',
  'undergoingGroupAssignment',
  'receiveReplyNotifications',
  'tags',
]) {
  @ApiProperty()
  @Allow()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @Allow()
  hasActiveContract: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  referredById?: number | null;

  constructor(user: User) {
    super();
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.preferredReminderTime = user.preferredReminderTime;
    this.timeZone = user.timeZone;
    this.emailNotifsForActions = user.emailNotifsForActions;
    this.textNotifsForActions = user.textNotifsForActions;
    this.pushNotifsForActions = user.pushNotifsForActions;
    this.shareEmailWithCommunityLead = user.shareEmailWithCommunityLead;
    this.sharePhoneNumberWithCommunityLead =
      user.sharePhoneNumberWithCommunityLead;
    this.turnedOffAllNotifs = user.turnedOffAllNotifs;
    this.forumDigestPreference = user.forumDigestPreference;
    this.admin = user.admin;
    this.staff = user.staff;
    this.profileDescription = user.profileDescription;
    this.referralCode = user.referralCode;
    this.referralSource = user.referralSource;
    this.customCityString = user.customCityString;
    this.anonymous = user.anonymous;
    this.shareInfoPublicly = user.shareInfoPublicly;
    this.formDataPreference = user.formDataPreference;
    this.pushesForLikes = user.pushesForLikes;
    this.pushesForComments = user.pushesForComments;
    this.pushesForFriendRequests = user.pushesForFriendRequests;
    this.pushesForMessages = user.pushesForMessages;
    this.pushesForActionUpdates = user.pushesForActionUpdates;
    this.undergoingGroupAssignment = user.undergoingGroupAssignment;
    this.remindAboutUncompletedGroupMembers =
      user.remindAboutUncompletedGroupMembers;
    this.receiveReplyNotifications = user.receiveReplyNotifications;
    this.contractEvents = user.contractEvents;
    this.activities = user.activities;
    this.tags = user.tags;
    this.communities = user.communities;
    this.leaderOfIds = user.leaderOfIds;
    this.hasActiveContract = user.hasActiveContract;
    this.profilePicture = getImageSource(user.profilePicture);
    this.referredById = user.referredBy?.id ?? null;
  }
}

export class UpdateProfileDto extends PartialType(
  PickType(User, [
    'name',
    'phoneNumber',
    'phoneNumberValidated',
    'profileDescription',
    'profilePicture',
    'anonymous',
    'emailNotifsForActions',
    'pushNotifsForActions',
    'textNotifsForActions',
    'shareEmailWithCommunityLead',
    'remindAboutUncompletedGroupMembers',
    'receiveReplyNotifications',
    'sharePhoneNumberWithCommunityLead',
    'forumDigestPreference',
    'preferredReminderTime',
    'formDataPreference',
    'timeZone',
    'isNotSignedUpPartialProfile',
    'shareInfoPublicly',
    'customCityString',
    'pushesForLikes',
    'pushesForComments',
    'pushesForFriendRequests',
    'pushesForMessages',
    'pushesForActionUpdates',
  ]),
) {
  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  cityId?: number | null;
}

export class ReferralDto {
  @ApiProperty({ type: String })
  referralCode: string;
}

export class UserCityCountDto {
  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  cityId?: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  cityName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  countryCode?: string | null;

  @ApiProperty()
  @Allow()
  count: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  latitude?: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  longitude?: number | null;
}

export class SingleGroupAssignmentDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  userId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  communityId: number;
}

export class AssignGroupsDto {
  @ApiProperty({ type: SingleGroupAssignmentDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleGroupAssignmentDto)
  assignments: Array<SingleGroupAssignmentDto>;
}

export class NMembersResponseDto {
  @ApiProperty()
  @Allow()
  count: number;

  constructor(count: number) {
    this.count = count;
  }
}
