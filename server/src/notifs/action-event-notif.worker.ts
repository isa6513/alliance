// action-event-notif.worker.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailStatus } from 'src/mail/mail.entity';
import { MailService } from 'src/mail/mail.service';
import { Mms } from 'src/mms/mms.entity';
import { MmsService } from 'src/mms/mms.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource, In, MoreThan, QueryRunner, Repository } from 'typeorm';
import {
  ActionEvent,
  ActionStatus,
  NotificationType,
} from '../actions/entities/action-event.entity';
import { Action } from '../actions/entities/action.entity';
import { NotifsService } from '../notifs/notifs.service';
import { generateCIDForNotif } from './notif-utils';
import {
  ActionEventNotif,
  ActionEventNotifType,
} from './entities/action-event-notif.entity';
import {
  ActionEventReminderService,
  ANNOUNCEMENT_SUPPORTED_STATUSES,
  MissedDeadlineCandidate,
  NOTIFICATION_LOOKBACK_WINDOW_MS,
  POST_MEMBER_ACTION_STATUSES,
} from './action-event-reminder.service';
import { ActionEventRecipientService } from './action-event-recipient.service';
import { NotificationChannel } from './notif-utils';
import {
  defaultEventText1DayReminder,
  defaultEventText3DayReminder,
  defaultEventTextAnnouncement,
  defaultEventTextMissedDeadline,
  defaultEventTextMissedSecondDeadline,
} from './textnotifcontents';
import { withPgAdvisoryLock } from './lock-utils';

export type ReminderKind =
  | ActionEventNotifType.ThreeDayReminder
  | ActionEventNotifType.OneDayReminder;

export interface ActionEventNotificationContext {
  event: ActionEvent;
  deadlineEvent?: ActionEvent;
  type: ActionEventNotifType;
  user: User;
  action: Action;
  cid: string;
}

const PROCESS_ONE_LOCK_KEY1 = 0xa11a;
const PROCESS_ONE_LOCK_KEY2 = 0xce01;

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

    const ran = await withPgAdvisoryLock(
      this.dataSource,
      PROCESS_ONE_LOCK_KEY1,
      PROCESS_ONE_LOCK_KEY2,
      async (qr) => {
        const now = new Date();
        const windowStart = new Date(
          now.getTime() - NOTIFICATION_LOOKBACK_WINDOW_MS,
        );

        const duePlans =
          await this.reminderService.evaluateDueNotifications(now);

        for (const plan of duePlans) {
          if (
            plan.type === ActionEventNotifType.MissedDeadline ||
            plan.type === ActionEventNotifType.MissedSecondDeadline
          ) {
            continue;
          }
          await this.processOne(qr, plan.referenceEvent.id, plan.type);
        }

        const missedDeadlineCandidates =
          await this.reminderService.findMissedDeadlineCandidates(
            windowStart,
            now,
          );

        for (const candidate of missedDeadlineCandidates) {
          await this.processMissedDeadlineCandidate(candidate);
        }
      },
    );

    if (ran === null) {
      this.logger.log('processOne skipped bc of lock');
    }
  }

  private async processOne(
    qr: QueryRunner,
    eventId: number,
    type: ActionEventNotifType,
  ) {
    const manager = qr.manager;

    const event = await manager.getRepository(ActionEvent).findOne({
      where: { id: eventId },
      relations: ['action', 'action.participatingGroups'],
    });

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

    if (
      type === ActionEventNotifType.Announcement &&
      !ANNOUNCEMENT_STATUS_SET.has(event.newStatus)
    ) {
      return;
    }

    const action = event.action;

    const users = await this.recipientService.getBaseUsersForEvent(
      event.newStatus,
      action,
    );

    const baseContext: Omit<ActionEventNotificationContext, 'user' | 'cid'> = {
      event,
      type,
      action,
    };

    const deadlineEvent =
      (await manager.getRepository(ActionEvent).findOne({
        where: {
          action: { id: action.id },
          date: MoreThan(event.date),
          newStatus: In(Array.from(POST_MEMBER_ACTION_STATUSES)),
        },
        order: { date: 'ASC' },
      })) ?? undefined;

    for (const user of users) {
      const context: ActionEventNotificationContext = {
        ...baseContext,
        user,
        deadlineEvent,
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
      case ActionEventNotifType.MissedDeadline:
      case ActionEventNotifType.MissedSecondDeadline:
        break;
      default:
        ((x: never) => x)(type);
    }

    await manager.getRepository(ActionEvent).save(event);
  }

  private async processMissedDeadlineCandidate(
    candidate: MissedDeadlineCandidate,
  ) {
    const type = candidate.isSecondMiss
      ? ActionEventNotifType.MissedSecondDeadline
      : ActionEventNotifType.MissedDeadline;

    await this.dataSource.transaction(async (manager) => {
      const eventRepository = manager.getRepository(ActionEvent);
      const notifRepository = manager.getRepository(ActionEventNotif);
      const userRepository = manager.getRepository(User);

      const resolutionEvent = await eventRepository.findOne({
        where: { id: candidate.resolutionEventId },
        relations: ['action', 'action.participatingGroups'],
      });

      if (!resolutionEvent || !resolutionEvent.action) {
        return;
      }

      const user = await userRepository.findOne({
        where: { id: candidate.userId },
      });

      if (!user) {
        return;
      }

      const existing = await notifRepository.findOne({
        where: {
          actionEvent: { id: resolutionEvent.id },
          user: { id: user.id },
          type,
        },
        relations: ['actionEvent', 'user'],
      });

      if (existing) {
        return;
      }

      const shouldText = this.notifsService.shouldTextUser(user);
      const shouldEmail = this.notifsService.shouldEmailUser(user);

      if (!shouldText && !shouldEmail) {
        return;
      }

      const context: ActionEventNotificationContext = {
        event: resolutionEvent,
        action: resolutionEvent.action,
        type,
        user,
        cid: await generateCIDForNotif(),
      };

      const notif = new ActionEventNotif();
      notif.user = user;
      notif.actionEvent = resolutionEvent;
      notif.type = type;
      notif.channel = NotificationChannel.Email;
      notif.sent = false;

      let sentAnyNotif = false;

      if (shouldText) {
        sentAnyNotif = true;
        const result = await this.sendActionEventNotificationMms(context);
        notif.mms = result;
        notif.channel = NotificationChannel.Text;

        if (result && !result.errorCode) {
          notif.sent = true;
        }
      }

      if (!notif.sent && shouldEmail) {
        sentAnyNotif = true;
        notif.channel = NotificationChannel.Email;
        const mail = await this.mailService.sendMissedDeadlineEmail(
          user.email,
          user.name,
          resolutionEvent.action.name,
          type === ActionEventNotifType.MissedSecondDeadline,
          context.cid,
        );
        notif.mail = mail;
        if (mail.status === EmailStatus.Sent) {
          notif.sent = true;
        }
      }

      if (sentAnyNotif) {
        await notifRepository.save(notif);
        this.logger.log(
          `missed deadline notif sent for action ${resolutionEvent.action.id} user ${user.id} type ${type}`,
        );
      }
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
    } else if (context.type === ActionEventNotifType.MissedDeadline) {
      body = defaultEventTextMissedDeadline(context);
    } else if (context.type === ActionEventNotifType.MissedSecondDeadline) {
      body = defaultEventTextMissedSecondDeadline(context);
    }

    return this.mmsService.sendMms(
      context.user.phoneNumber!,
      body,
      [],
      context.cid,
    );
  }
}
const ANNOUNCEMENT_STATUS_SET = new Set<ActionStatus>(
  ANNOUNCEMENT_SUPPORTED_STATUSES,
);
