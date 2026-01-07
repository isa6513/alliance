import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationCategory,
} from 'src/notifs/entities/notification.entity';
import { CreatePushMessage, PushService } from './push.service';

export class NotifPushDispatcherWorker {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly pushService: PushService,
  ) {}

  //   @Cron(CronExpression.EVERY_10_SECONDS)
  async dispatchPushes() {
    const now = new Date();
    console.log('dispatching pushes');

    const toSend = await this.notificationRepository
      .createQueryBuilder('n')
      .leftJoin('n.pushes', 'p')
      .leftJoinAndSelect('n.user', 'u')
      .where('n."sendTime" <= :now', { now })
      .andWhere('n."shouldPush" = true')
      .andWhere('p.id IS NULL')
      .orderBy('n."sendTime"', 'ASC')
      .limit(1000)
      .getMany();

    if (toSend.length === 0) {
      return;
    }

    console.log(`found ${toSend.length} notifs to send`);

    const messagesToSend: CreatePushMessage[] = [];
    for (const notif of toSend) {
      const notifTypeToSendable: Record<NotificationCategory, boolean> = {
        [NotificationCategory.ActionEvent]: true,
        [NotificationCategory.ActionUpdate]: true,
        [NotificationCategory.ForumReply]: notif.user.pushesForComments,
        [NotificationCategory.FriendRequest]:
          notif.user.pushesForFriendRequests,
        [NotificationCategory.FriendRequestAccepted]:
          notif.user.pushesForFriendRequests,
        [NotificationCategory.Likes]: notif.user.pushesForLikes,
        [NotificationCategory.CommunityInviteRejected]: true,
        [NotificationCategory.CommunityInviteAccepted]: true,
        [NotificationCategory.OnetimeInviteRequestCreated]: true,
        [NotificationCategory.OnetimeInviteRequestApproved]: true,
        [NotificationCategory.OnetimeInviteRequestRejected]: true,
      };
      if (!notifTypeToSendable[notif.category]) {
        console.log(`notif ${notif.id} not sendable`);
        await this.notificationRepository.update(notif.id, {
          shouldPush: false,
        });
        continue;
      }
      messagesToSend.push(
        ...(await this.pushService.getPushForAllUserDevices(notif.user.id, {
          body: notif.message,
          screen: notif.mobileAppLocation || notif.webAppLocation,
          notification: notif,
        })),
      );
    }

    await this.pushService.sendMessages(messagesToSend);
  }
}
