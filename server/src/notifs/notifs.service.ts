import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActionEvent } from 'src/actions/entities/action-event.entity';
import { Action } from 'src/actions/entities/action.entity';
import { EmailStatus, Mail } from 'src/mail/mail.entity';
import { MailService } from 'src/mail/mail.service';
import { MmsService } from 'src/mms/mms.service';
import { actionUrl } from 'src/search/approutes';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ReminderKind } from './action-event-notif.worker';
import {
  ActionEventNotif,
  ActionEventNotifType,
} from './entities/action-event-notif.entity';
import { Notification } from './entities/notification.entity';
import { NotificationChannel } from './notifchannel';
import {
  defaultEventText1DayReminder,
  defaultEventText3DayReminder,
  defaultEventTextAnnouncement,
} from './notifcontents';

@Injectable()
export class NotifsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifsRepository: Repository<Notification>,
    @InjectRepository(ActionEventNotif)
    private readonly actionEventNotifsRepository: Repository<ActionEventNotif>,
    private readonly mailService: MailService,
    private readonly mmsService: MmsService,
  ) {
    // mmsService.sendMms(
    //   '+16502728685',
    //   'This is a test message from the alliance foundation',
    //   [],
    // );
  }

  async findAll(userId: number) {
    const notifs = await this.notifsRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'associatedUser'],
    });
    return notifs;
  }

  findOne(id: number) {
    return this.notifsRepository.findOne({
      where: { id },
    });
  }

  async setRead(id: number, userId: number) {
    const notif = await this.notifsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!notif) {
      throw new NotFoundException('Notif not found');
    }
    if (notif.user.id !== userId) {
      throw new UnauthorizedException();
    }
    return this.notifsRepository.update(id, { read: true });
  }

  async setReadAll(userId: number) {
    return this.notifsRepository.update(
      { user: { id: userId }, cleared: false },
      { read: true },
    );
  }

  async clear(userId: number) {
    return this.notifsRepository.update(
      { user: { id: userId }, cleared: false },
      { cleared: true },
    );
  }

  shouldEmailUser(user: User) {
    return (
      user.emailNotifsEnabled &&
      !user.turnedOffAllNotifs &&
      user.emailNotifsEnabled
    );
  }

  shouldTextUser(user: User) {
    return (
      user.textNotifsEnabled &&
      !user.turnedOffAllNotifs &&
      user.phoneNumber &&
      user.textNotifsEnabled
    );
  }

  async sendActionNotifsToUsers(
    event: ActionEvent,
    action: Action,
    users: User[],
    sendMail: (user: User, action: Action) => Promise<Mail>,
    smsContent: (user: User, action: Action) => string,
    type: ActionEventNotifType,
  ) {
    console.log('sending to n users: ', users.length);
    for (const user of users) {
      const notif = new ActionEventNotif();
      notif.user = user;
      notif.actionEvent = event;
      notif.channel = NotificationChannel.Email;
      notif.sent = false;
      notif.type = type;
      if (this.shouldTextUser(user)) {
        console.log('sending text notif to user', user.id);
        const result = await this.mmsService.sendMms(
          user.phoneNumber!,
          smsContent(user, action),
          [],
        );
        if (!result.errorCode) {
          notif.sent = true;
        }
        notif.channel = NotificationChannel.Text;
        notif.mms = result;
      } else if (this.shouldEmailUser(user)) {
        console.log('sending email notif to user', user.id);
        notif.channel = NotificationChannel.Email;
        const result = await sendMail(user, action);
        notif.mail = result;
        if (result.status === EmailStatus.Sent) {
          notif.sent = true;
        }
      } else {
        //TODO: pushes
      }
      await this.actionEventNotifsRepository.save(notif);
    }
  }

  async sendCommitmentNotifs(
    event: ActionEvent,
    action: Action,
    users: User[],
  ) {
    await this.sendActionNotifsToUsers(
      event,
      action,
      users,
      (user, action) =>
        this.mailService.sendCommitmentEmail(
          user.email,
          user.name,
          action.name,
          actionUrl(action.id, true),
        ),
      defaultEventTextAnnouncement[event.newStatus],
      ActionEventNotifType.Announcement,
    );
  }

  async sendMemberActionNotifs(
    event: ActionEvent,
    action: Action,
    users: User[],
  ) {
    await this.sendActionNotifsToUsers(
      event,
      action,
      users,
      (user, action) =>
        this.mailService.sendMemberActionEmail(
          user.email,
          user.name,
          action.name,
          actionUrl(action.id, true),
        ),
      defaultEventTextAnnouncement[event.newStatus],
      ActionEventNotifType.Announcement,
    );
  }

  async sendCommitmentReminderNotifs(
    event: ActionEvent,
    action: Action,
    users: User[],
    kind: ReminderKind,
  ) {
    await this.sendActionNotifsToUsers(
      event,
      action,
      users,
      (user, action) =>
        this.mailService.sendCommitmentReminderEmail(
          user.email,
          user.name,
          action.name,
          actionUrl(action.id, true),
          kind,
        ),
      kind === '3dayreminder'
        ? defaultEventText3DayReminder[event.newStatus]
        : defaultEventText1DayReminder[event.newStatus],
      kind === ActionEventNotifType.ThreeDayReminder
        ? ActionEventNotifType.ThreeDayReminder
        : ActionEventNotifType.OneDayReminder,
    );
  }

  // TODO: refactor all of this a lot
  async sendMemberActionReminderNotifs(
    event: ActionEvent,
    action: Action,
    users: User[],
    kind: ReminderKind,
  ) {
    await this.sendActionNotifsToUsers(
      event,
      action,
      users,
      (user, action) =>
        this.mailService.sendMemberActionReminderEmail(
          user.email,
          user.name,
          action.name,
          actionUrl(action.id, true),
          kind,
        ),
      kind === '3dayreminder'
        ? defaultEventText3DayReminder[event.newStatus]
        : defaultEventText1DayReminder[event.newStatus],
      kind === ActionEventNotifType.ThreeDayReminder
        ? ActionEventNotifType.ThreeDayReminder
        : ActionEventNotifType.OneDayReminder,
    );
  }

  async notifsForEvent(id: number) {
    return this.actionEventNotifsRepository.find({
      where: { actionEvent: { id } },
      relations: ['user', 'mail', 'mms'],
    });
  }

  async reloadNotifDataForEvent(id: number) {
    const notifs = await this.notifsForEvent(id);
    for (const notif of notifs) {
      if (notif.channel === NotificationChannel.Text) {
        const mms = notif.mms;
        if (!mms) {
          continue;
        }
        notif.mms = await this.mmsService.refreshMmsData(mms);
        await this.actionEventNotifsRepository.save(notif);
      }
      if (notif.channel === NotificationChannel.Email) {
        //TODO: refresh mail data
      }
    }
  }
}
