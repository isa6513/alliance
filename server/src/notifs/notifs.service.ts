import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActionEvent } from 'src/actions/entities/action-event.entity';
import { Action } from 'src/actions/entities/action.entity';
import { MailService } from 'src/mail/mail.service';
import { actionUrl } from 'src/search/approutes';
import { SmsService } from 'src/sms/sms.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ActionEventNotif } from './entities/action-event-notif.entity';
import { Notification } from './entities/notification.entity';
import { NotificationChannel } from './notifchannel';

@Injectable()
export class NotifsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifsRepository: Repository<Notification>,
    @InjectRepository(ActionEventNotif)
    private readonly actionEventNotifsRepository: Repository<ActionEventNotif>,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  async findAll(userId: number) {
    const notifs = await this.notifsRepository.find({
      where: { user: { id: userId }, cleared: false },
      relations: ['user'],
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

  private shouldEmailUser(user: User) {
    return (
      user.primaryNotificationChannel === NotificationChannel.Email &&
      !user.turnedOffAllNotifs
    );
  }
  private shouldTextUser(user: User) {
    return (
      user.primaryNotificationChannel === NotificationChannel.Text &&
      !user.turnedOffAllNotifs &&
      user.phoneNumber
    );
  }

  async sendCommitmentNotifs(
    event: ActionEvent,
    action: Action,
    users: User[],
  ) {
    console.log('sendCommitmentNotifs:', users.length);
    for (const user of users) {
      if (
        await this.actionEventNotifsRepository.findOne({
          where: {
            user: { id: user.id },
            actionEvent: { id: event.id },
            sent: true,
          },
        })
      ) {
        continue;
      }
      const notif = new ActionEventNotif();
      notif.user = user;
      notif.actionEvent = event;
      notif.channel = NotificationChannel.Email;
      notif.sent = false;
      if (this.shouldEmailUser(user)) {
        notif.channel = NotificationChannel.Email;
        //TODO: do this async?
        // console.log('sending email to', user.email);
        // const result = await this.mailService.sendCommitmentEmail(
        //   user.email,
        //   user.name,
        //   action.name,
        //   actionUrl(action.id, true),
        // );
        // notif.mail = result;
        // if (result.status === EmailStatus.Sent) {
        //   notif.sent = true;
        // }
        console.log(notif.sent);
      } else if (this.shouldTextUser(user)) {
        const result = await this.smsService.sendSms(
          user.phoneNumber!,
          `New action to join: ${action.name}. ${actionUrl(action.id, true)}`,
        );
        if (result) {
          notif.sent = true;
        }
        notif.channel = NotificationChannel.Text;
      }
      await this.actionEventNotifsRepository.save(notif);
    }
    console.log('sendCommitmentNotifs done');
  }

  async sendMemberActionNotifs(
    event: ActionEvent,
    action: Action,
    users: User[],
  ) {
    for (const user of users) {
      if (this.shouldEmailUser(user)) {
        await this.mailService.sendMemberActionEmail(
          user.email,
          user.name,
          action.name,
          actionUrl(action.id, true),
        );
      }
    }
  }
}
