// action-event-notif.worker.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailStatus } from 'src/mail/mail.entity';
import { MailService } from 'src/mail/mail.service';
import { Mms } from 'src/mms/mms.entity';
import { MmsService } from 'src/mms/mms.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import {
  ActionEvent,
  NotificationType,
} from '../actions/entities/action-event.entity';
import { Action } from '../actions/entities/action.entity';
import { NotifsService } from '../notifs/notifs.service';
import { generateCIDForNotif } from './notif_utils';
import {
  ActionEventNotif,
  ActionEventNotifType,
} from './entities/action-event-notif.entity';
import { ActionEventReminderService } from './action-event-reminder.service';
import { ActionEventRecipientService } from './action-event-recipient.service';
import { NotificationChannel } from './notifchannel';
import {
  defaultEventText1DayReminder,
  defaultEventText3DayReminder,
  defaultEventTextAnnouncement,
} from './textnotifcontents';

export type ReminderKind =
  | ActionEventNotifType.ThreeDayReminder
  | ActionEventNotifType.OneDayReminder;

export interface ActionEventNotificationContext {
  event: ActionEvent;
  type: ActionEventNotifType;
  user: User;
  action: Action;
  cid: string;
}

@Injectable()
export class ActionEventNotifWorker {
  private readonly logger = new Logger(ActionEventNotifWorker.name);
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ActionEvent)
    private readonly eventRepo: Repository<ActionEvent>,
    private readonly notifsService: NotifsService,
    private readonly mailService: MailService,
    private readonly mmsService: MmsService,
    @InjectRepository(ActionEventNotif)
    private readonly actionEventNotifsRepository: Repository<ActionEventNotif>,
    private readonly recipientService: ActionEventRecipientService,
    private readonly reminderService: ActionEventReminderService,
  ) {}

  @Cron('*/3 * * * *')
  async dispatchDueNotifs() {
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.SEND_DEV_NOTIFS !== '1'
    ) {
      return;
    }

    const now = new Date();

    const due = await this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.action', 'action')
      .where('event.sendNotifsTo != :none', { none: NotificationType.None })
      .andWhere('event.date <= :now', { now })
      .andWhere('event.announcementNotifsSentAt IS NULL')
      .orderBy('event.date', 'ASC')
      .limit(2)
      .getMany();

    for (const event of due) {
      await this.processOne(event.id, ActionEventNotifType.Announcement);
    }

    const dueReminders = await this.reminderService.findDueReminderEvents(now);

    for (const reminder of dueReminders) {
      await this.processOne(reminder.currentEventId, reminder.type);
    }
  }

  private async processOne(eventId: number, type: ActionEventNotifType) {
    await this.dataSource.transaction(async (manager) => {
      const event = await manager.getRepository(ActionEvent).findOne({
        where: { id: eventId },
        relations: ['action', 'action.participatingGroups'],
      });

      console.log('processing notif', eventId);

      if (!event || !event.action) return;

      if (
        (type === 'announcement' && event.announcementNotifsSentAt) ||
        (type === '3dayreminder' && event.threeDayReminderNotifsSentAt) ||
        (type === '1dayreminder' && event.oneDayReminderNotifsSentAt) ||
        event.date > new Date() ||
        event.sendNotifsTo === NotificationType.None
      ) {
        return;
      }

      const action = event.action;

      const users = await this.recipientService.getBaseUsersForEvent(
        event.newStatus,
        action,
      );

      const baseContext: Omit<ActionEventNotificationContext, 'user' | 'cid'> =
        {
          event,
          type,
          action,
        };

      for (const user of users) {
        const context: ActionEventNotificationContext = {
          ...baseContext,
          user,
          cid: await generateCIDForNotif(),
        };
        const notif = new ActionEventNotif();
        notif.user = user;
        notif.actionEvent = event;
        notif.channel = NotificationChannel.Email;
        notif.sent = false;
        notif.type = type;
        let sentAnyNotif = false;
        if (this.notifsService.shouldTextUser(user)) {
          sentAnyNotif = true;
          const result = await this.sendActionEventNotificationMms(context);

          if (result && !result.errorCode) {
            notif.sent = true;
          }
          notif.channel = NotificationChannel.Text;
          notif.mms = result;
        }
        if (!notif.sent && this.notifsService.shouldEmailUser(user)) {
          sentAnyNotif = true;
          notif.channel = NotificationChannel.Email;
          const result =
            await this.mailService.sendActionEventNotificationEmail(context);
          notif.mail = result;
          if (result.status === EmailStatus.Sent) {
            notif.sent = true;
          }
        } else {
          //TODO: pushes
        }
        if (sentAnyNotif) {
          await this.actionEventNotifsRepository.save(notif);
        }
      }

      this.logger.log('notifs sent for event ' + event.id);

      switch (type) {
        case ActionEventNotifType.Announcement:
          event.announcementNotifsSentAt = new Date();
          break;
        case ActionEventNotifType.ThreeDayReminder:
          event.threeDayReminderNotifsSentAt = new Date();
          break;
        case ActionEventNotifType.OneDayReminder:
          event.oneDayReminderNotifsSentAt = new Date();
          break;
        default:
          ((x: never) => x)(type);
      }

      await manager.getRepository(ActionEvent).save(event);
    });
  }

  async sendActionEventNotificationMms(
    context: ActionEventNotificationContext,
  ): Promise<Mms | null> {
    let body = '';
    if (context.type === ActionEventNotifType.Announcement) {
      body = defaultEventTextAnnouncement[context.event.newStatus](context);
    } else if (context.type === ActionEventNotifType.ThreeDayReminder) {
      body = defaultEventText3DayReminder[context.event.newStatus](context);
    } else if (context.type === ActionEventNotifType.OneDayReminder) {
      body = defaultEventText1DayReminder[context.event.newStatus](context);
    }

    return this.mmsService.sendMms(
      context.user.phoneNumber!,
      body,
      [],
      context.cid,
    );
  }
}
