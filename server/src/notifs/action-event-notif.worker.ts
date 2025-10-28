// action-event-notif.worker.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailStatus } from 'src/mail/mail.entity';
import { MailService, processKeywordReplacements } from 'src/mail/mail.service';
import { Mms } from 'src/mms/mms.entity';
import { MmsService } from 'src/mms/mms.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource, In, MoreThan, QueryRunner, Repository } from 'typeorm';
import { actionUrl, withCid } from 'src/search/approutes';
import {
  ActionEvent,
  NotificationType,
} from '../actions/entities/action-event.entity';
import { Action } from '../actions/entities/action.entity';
import {
  ActionReminder,
  ReminderCohortType,
} from '../actions/entities/action-reminder.entity';
import { NotifsService } from '../notifs/notifs.service';
import { generateCIDForNotif } from './notif-utils';
import {
  ActionEventNotif,
  ActionEventNotifType,
} from './entities/action-event-notif.entity';
import {
  ActionEventReminderService,
  ANNOUNCEMENT_SUPPORTED_STATUSES,
  NOTIFICATION_LOOKBACK_WINDOW_MS,
  NotificationPlan,
  POST_MEMBER_ACTION_STATUSES,
} from './action-event-reminder.service';
import { ActionEventRecipientService } from './action-event-recipient.service';
import { NotificationChannel } from './notif-utils';
import {
  defaultEventTextAnnouncement,
  defaultEventTextMissedDeadline,
  defaultEventTextMissedSecondDeadline,
} from './textnotifcontents';
import { withPgAdvisoryLock } from './lock-utils';
import { getNotifTestUsers } from './test-users';
import { PersonalActionReminder } from 'src/actions/entities/personal-action-reminder.entity';

export interface ActionEventNotificationContext {
  event: ActionEvent;
  deadlineEvent?: ActionEvent;
  type: ActionEventNotifType;
  user: User;
  action: Action;
  cid: string;
  isSecondMiss?: boolean;
  customEmailMessage?: string;
  customTextMessage?: string;
  customEmailSubject?: string;
}

const PROCESS_ONE_LOCK_KEY1 = 0xa11a;
const PROCESS_ONE_LOCK_KEY2 = 0xce01;

const typeToSentAtField: Partial<
  Record<ActionEventNotifType, keyof ActionEvent>
> = {
  [ActionEventNotifType.Announcement]: 'announcementNotifsSentAt',
  [ActionEventNotifType.MissedDeadline]: 'deadlineNotifsSentAt',
};

@Injectable()
export class ActionEventNotifWorker {
  private readonly logger = new Logger(ActionEventNotifWorker.name);
  constructor(
    private readonly dataSource: DataSource,
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

        const duePlans = await this.reminderService.evaluateNotifications(
          windowStart,
          now,
        );
        for (const plan of duePlans) {
          await this.processOne(qr, plan);
        }
      },
    );

    if (ran === null) {
      this.logger.log('processOne skipped bc of lock');
    }
  }

  processCustomReminderText(
    text: string,
    context: ActionEventNotificationContext,
  ): string {
    return processKeywordReplacements(text, context);
  }

  private async processOne(qr: QueryRunner, plan: NotificationPlan) {
    const manager = qr.manager;

    const event = await manager.getRepository(ActionEvent).findOne({
      where: { id: plan.referenceEvent.id },
      relations: ['action', 'action.participatingGroups'],
    });

    if (!event || !event.action) return;

    if (plan.type === ActionEventNotifType.Reminder) {
      if (!plan.reminder || plan.reminder.sentAt) {
        return;
      }
    } else {
      const sentAtField = typeToSentAtField[plan.type];
      if (
        (sentAtField && event[sentAtField]) ||
        event.date > new Date() ||
        event.sendNotifsTo === NotificationType.None
      ) {
        return;
      }

      if (
        plan.type === ActionEventNotifType.Announcement &&
        !ANNOUNCEMENT_SUPPORTED_STATUSES.includes(event.newStatus)
      ) {
        return;
      }
    }

    const action = event.action;

    let baseUsers: User[];
    if (plan.type === ActionEventNotifType.PersonalReminder) {
      baseUsers = [plan.reminder!.user];
    } else if (
      plan.type === ActionEventNotifType.Reminder &&
      plan.reminder.cohortType === ReminderCohortType.Custom
    ) {
      baseUsers = plan.reminder.users;
    } else {
      baseUsers = await this.recipientService.getBaseUsersForEvent(
        event.newStatus,
        action,
      );
    }

    let users = await this.recipientService.filterForShouldRemind(
      baseUsers,
      event,
    );

    if (
      plan.type === ActionEventNotifType.PersonalReminder &&
      baseUsers.length === 1 &&
      users.length === 0 &&
      plan.reminder
    ) {
      plan.reminder.skippedForCompletion = true;
      await manager.getRepository(PersonalActionReminder).save(plan.reminder);
    }

    if (
      users.length > 0 &&
      plan.type !== ActionEventNotifType.PersonalReminder
    ) {
      const testUsers = getNotifTestUsers();
      users = [...users, ...testUsers];
    }

    const baseContext: Omit<ActionEventNotificationContext, 'user' | 'cid'> = {
      event,
      type: plan.type,
      action,
      ...(plan.type === ActionEventNotifType.PersonalReminder
        ? {
            customEmailMessage: plan.reminder?.group.emailMessage,
            customTextMessage: plan.reminder?.group.textMessage,
            customEmailSubject: plan.reminder?.group.emailSubject,
          }
        : {
            customEmailMessage: plan.reminder?.emailMessage,
            customTextMessage: plan.reminder?.textMessage,
            customEmailSubject: plan.reminder?.emailSubject,
          }),
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
      if (context.customEmailMessage) {
        context.customEmailMessage = this.processCustomReminderText(
          context.customEmailMessage,
          context,
        );
      }
      if (context.customTextMessage) {
        context.customTextMessage = this.processCustomReminderText(
          context.customTextMessage,
          context,
        );
      }
      if (context.customEmailSubject) {
        context.customEmailSubject = this.processCustomReminderText(
          context.customEmailSubject,
          context,
        );
      }

      if (plan.type === ActionEventNotifType.MissedDeadline) {
        context.isSecondMiss = false; //TODO;
      }

      const notif = new ActionEventNotif();
      notif.user = user;
      notif.actionEvent = event;
      notif.channel = NotificationChannel.Email;
      notif.sent = false;
      notif.type = plan.type;
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
      if (sentAnyNotif && user.id !== -1) {
        await this.actionEventNotifsRepository.save(notif);
      }
    }

    this.logger.log('notifs sent for event ' + event.id);
    const sentAtField = typeToSentAtField[plan.type];
    if (sentAtField) {
      (event[sentAtField] as Date | undefined) = new Date();
      await manager.getRepository(ActionEvent).save(event);
    } else if (
      plan.type === ActionEventNotifType.Reminder ||
      plan.type === ActionEventNotifType.PersonalReminder
    ) {
      const reminder = plan.reminder;

      if (!reminder) {
        this.logger.error('reminder not found for in worker');
        return;
      }

      reminder.sentAt = new Date();

      if (plan.type === ActionEventNotifType.Reminder) {
        await manager.getRepository(ActionReminder).save(reminder);
      } else {
        await manager.getRepository(PersonalActionReminder).save(reminder);
      }
    }
  }

  async sendActionEventNotificationMms(
    context: ActionEventNotificationContext,
  ): Promise<Mms | null> {
    let body = '';
    if (context.type === ActionEventNotifType.Announcement) {
      body = defaultEventTextAnnouncement[context.event.newStatus](context);
    } else if (
      context.type === ActionEventNotifType.Reminder ||
      context.type === ActionEventNotifType.PersonalReminder
    ) {
      if (context.customTextMessage) {
        body = context.customTextMessage;
      } else {
        const url = withCid(actionUrl(context.action.id, true), context.cid);
        body = `Reminder: ${context.action.name}. ${url}`;
      }
    } else if (context.type === ActionEventNotifType.MissedDeadline) {
      body = context.isSecondMiss
        ? defaultEventTextMissedSecondDeadline(context)
        : defaultEventTextMissedDeadline(context);
    } else {
      throw context.type satisfies never;
    }

    return this.mmsService.sendMms(
      context.user.phoneNumber!,
      body,
      [],
      context.cid,
    );
  }
}
