import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProfileDto } from 'src/user/dto/user.dto';
import {
  NOTIFICATION_CATEGORY_PRIORITIES,
  Notification,
  NotificationCategory,
  NotifPriority,
} from '../entities/notification.entity';
import { UnreadContentType } from '../entities/unread-content.entity';

export enum NotificationSourceType {
  Notification = 'notification',
  UnreadContent = 'unread_content',
}

export class NotificationDto {
  @ApiProperty()
  id: number;

  @ApiProperty({
    enum: NotificationCategory,
    enumName: 'NotificationCategory',
  })
  category: NotificationCategory;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional({ nullable: true })
  webAppLocation?: string | null;

  @ApiPropertyOptional({ nullable: true })
  mobileAppLocation?: string | null;

  @ApiPropertyOptional({ type: Date })
  @Type(() => Date)
  readAt?: Date;

  @ApiProperty({ type: Date })
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    enum: NotifPriority,
    enumName: 'NotifPriority',
  })
  priority: NotifPriority;

  @ApiProperty({ type: Date })
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({ type: Date })
  @Type(() => Date)
  sendTime: Date;

  @ApiProperty({ type: ProfileDto, isArray: true })
  associatedUsers: ProfileDto[];

  @ApiProperty({
    enum: NotificationSourceType,
    enumName: 'NotificationSourceType',
  })
  sourceType: NotificationSourceType;

  @ApiPropertyOptional({
    enum: UnreadContentType,
    enumName: 'UnreadContentType',
  })
  contentType?: UnreadContentType;

  @ApiPropertyOptional()
  contentId?: number;

  constructor(notification: NotificationDto) {
    Object.assign(this, notification);
  }

  static fromNotification(notification: Notification): NotificationDto {
    return new NotificationDto({
      id: notification.id,
      message: notification.message,
      category: notification.category,
      webAppLocation: notification.webAppLocation,
      mobileAppLocation: notification.mobileAppLocation,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      priority: notification.priority,
      updatedAt: notification.updatedAt,
      sendTime: notification.sendTime,
      sourceType: NotificationSourceType.Notification,
      contentType:
        notification.category === NotificationCategory.ForumReply
          ? UnreadContentType.ForumReply
          : notification.category === NotificationCategory.ActionUpdate
            ? UnreadContentType.ActionUpdate
            : undefined,
      contentId:
        notification.category === NotificationCategory.ForumReply
          ? notification.comment?.id
          : notification.category === NotificationCategory.ActionUpdate
            ? notification.actionUpdate?.id
            : undefined,
      associatedUsers: notification.associatedUsers
        ? notification.associatedUsers.map((user) => new ProfileDto(user))
        : [],
    });
  }

  static fromUnreadContent(params: {
    id: number;
    category: NotificationCategory;
    message: string;
    webAppLocation?: string;
    mobileAppLocation?: string;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    sendTime: Date;
    associatedUsers?: ProfileDto[];
    contentType: UnreadContentType;
    contentId: number;
  }): NotificationDto {
    return new NotificationDto({
      id: params.id,
      message: params.message,
      category: params.category,
      webAppLocation: params.webAppLocation,
      mobileAppLocation: params.mobileAppLocation,
      readAt: params.readAt,
      createdAt: params.createdAt,
      priority: NOTIFICATION_CATEGORY_PRIORITIES[params.category],
      updatedAt: params.updatedAt,
      sendTime: params.sendTime,
      sourceType: NotificationSourceType.UnreadContent,
      contentType: params.contentType,
      contentId: params.contentId,
      associatedUsers: params.associatedUsers ?? [],
    });
  }
}
