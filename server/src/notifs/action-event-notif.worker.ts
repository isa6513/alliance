// action-event-notif.worker.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailStatus } from 'src/mail/mail.entity';
import { MailService } from 'src/mail/mail.service';
import { Mms } from 'src/mms/mms.entity';
import { MmsService } from 'src/mms/mms.service';
import { User } from 'src/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import {
  ActionActivity,
  ActionActivityType,
} from '../actions/entities/action-activity.entity';
import {
  ActionEvent,
  ActionStatus,
  NotificationType,
} from '../actions/entities/action-event.entity';
import { Action } from '../actions/entities/action.entity';
import { NotifsService } from '../notifs/notifs.service';
import { generateCIDForNotif } from './notif_utils';
import { UserService } from '../user/user.service';
import {
  ActionEventNotif,
  ActionEventNotifType,
} from './entities/action-event-notif.entity';
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
    @InjectRepository(ActionActivity)
    private readonly actionActivityRepository: Repository<ActionActivity>,
    private readonly notifsService: NotifsService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly mmsService: MmsService,
    @InjectRepository(ActionEventNotif)
    private readonly actionEventNotifsRepository: Repository<ActionEventNotif>,
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

    const rows: Array<{
      actionId: number;
      currentEventId: number;
      nextEventId: number;
      nextDate: string;
      which: '3dayreminder' | '1dayreminder';
    }> = await this.eventRepo.query(
      `
          WITH params AS (
            SELECT $1::timestamptz AS now
          ),
          current AS (
            SELECT
              e.*,
              ROW_NUMBER() OVER (PARTITION BY e."actionId" ORDER BY e.date DESC) AS rn
            FROM action_event e, params
            WHERE e.date <= (SELECT now FROM params)
          ),
          next AS (
            SELECT
              e.*,
              ROW_NUMBER() OVER (PARTITION BY e."actionId" ORDER BY e.date ASC) AS rn
            FROM action_event e, params
            WHERE e.date > (SELECT now FROM params)
          ),
          pairs AS (
            SELECT
              c."actionId",
              c.id  AS "currentEventId",
              c."newStatus",
              c."threeDayReminderNotifsSentAt",
              c."oneDayReminderNotifsSentAt",
              n.id  AS "nextEventId",
              n.date AS "nextDate"
            FROM current c
            JOIN next n
              ON n."actionId" = c."actionId"
             AND n.rn = 1
            WHERE c.rn = 1
          ),
          due AS (
            SELECT
              p."actionId",
              p."currentEventId",
              p."nextEventId",
              p."nextDate",
              CASE
                -- Prioritize 1-day if both thresholds are crossed
                WHEN p."nextDate" <= (SELECT now FROM params) + INTERVAL '1 day'
                     AND p."oneDayReminderNotifsSentAt" IS NULL
                THEN '1dayreminder'
                WHEN p."nextDate" <= (SELECT now FROM params) + INTERVAL '3 day'
                     AND p."threeDayReminderNotifsSentAt" IS NULL
                THEN '3dayreminder'
                ELSE NULL
              END AS which
            FROM pairs p
            WHERE p."newStatus" IN ('gathering_commitments', 'member_action')
          )
          SELECT
            "actionId",
            "currentEventId",
            "nextEventId",
            "nextDate",
            which
          FROM due
          WHERE which IS NOT NULL
          ORDER BY "nextDate" ASC
          LIMIT 100
          `,
      [now],
    );

    for (const row of rows) {
      await this.processOne(
        row.currentEventId,
        row.which === '3dayreminder'
          ? ActionEventNotifType.ThreeDayReminder
          : ActionEventNotifType.OneDayReminder,
      );
    }
  }

  async getBaseUsersForEvent(eventStatus: ActionStatus, action: Action) {
    if (
      eventStatus === ActionStatus.MemberAction ||
      eventStatus === ActionStatus.OfficeAction ||
      eventStatus === ActionStatus.Resolution //TODO: decide
    ) {
      const activities = await this.actionActivityRepository.find({
        where: {
          actionId: action.id,
          type: ActionActivityType.USER_JOINED,
        },
        relations: ['user'],
      });
      const users = action.commitmentless
        ? await this.userService.findActiveUsers()
        : activities.map((a) => a.user);

      return users;
    }

    return this.userService.findActiveUsers();
  }

  private async processOne(eventId: number, type: ActionEventNotifType) {
    await this.dataSource.transaction(async (manager) => {
      const event = await manager
        .createQueryBuilder(ActionEvent, 'event')
        .where('event.id = :id', { id: eventId })
        .getOne();

      console.log('processing notif', eventId);

      if (!event) return;

      if (
        (type === 'announcement' && event.announcementNotifsSentAt) ||
        (type === '3dayreminder' && event.threeDayReminderNotifsSentAt) ||
        (type === '1dayreminder' && event.oneDayReminderNotifsSentAt) ||
        event.date > new Date() ||
        event.sendNotifsTo === NotificationType.None
      ) {
        return;
      }

      const action = await manager
        .createQueryBuilder()
        .relation(ActionEvent, 'action')
        .of(event)
        .loadOne<Action>();
      if (!action) return;

      const users = await this.getBaseUsersForEvent(event.newStatus, action);

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
