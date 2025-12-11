import { ApiProperty, PickType } from '@nestjs/swagger';
import { ProfileDto } from 'src/user/user.dto';
import { Notification } from '../entities/notification.entity';

export class NotificationDto extends PickType(Notification, [
  'id',
  'message',
  'category',
  'webAppLocation',
  'mobileAppLocation',
  'readAt',
  'createdAt',
  'updatedAt',
  'sendTime',
]) {
  @ApiProperty({ type: ProfileDto, isArray: true })
  associatedUsers: ProfileDto[];

  constructor(notification: Notification) {
    super();
    Object.assign(this, notification);
    this.associatedUsers = notification.associatedUsers
      ? notification.associatedUsers.map((user) => new ProfileDto(user))
      : [];
  }
}
