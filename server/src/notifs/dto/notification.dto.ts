import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { ProfileDto } from 'src/user/user.dto';
import { Notification } from '../entities/notification.entity';

export class NotificationDto extends PickType(Notification, [
  'id',
  'message',
  'category',
  'webAppLocation',
  'mobileAppLocation',
  'read',
  'createdAt',
  'cleared',
  'updatedAt',
]) {
  @ApiPropertyOptional({ type: ProfileDto })
  associatedUser?: ProfileDto;

  constructor(notification: Notification) {
    super();
    Object.assign(this, notification);
    this.associatedUser = notification.associatedUser
      ? new ProfileDto(notification.associatedUser)
      : undefined;
  }
}
