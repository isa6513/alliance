import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActionStatus } from 'src/actions/entities/action-event.entity';
import {
  ActionEventNotificationContext,
  ReminderKind,
} from 'src/notifs/action-event-notif.worker';
import { ActionEventNotifType } from 'src/notifs/entities/action-event-notif.entity';
import { actionUrl, withCid } from 'src/search/approutes';
import { Repository } from 'typeorm';
import { EmailStatus, EmailType, Mail } from './mail.entity';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(Mail)
    private readonly mailRepository: Repository<Mail>,
  ) {}

  private readonly templates: Record<EmailType, string> = {
    [EmailType.Welcome]: 'welcome',
    [EmailType.PasswordReset]: 'password-reset',
    [EmailType.Verification]: '',
    [EmailType.Other]: '',
    [EmailType.PartialSignup]: 'partial-signup',
    [EmailType.Commitment]: 'commitment',
    [EmailType.MemberAction]: 'memberaction',
    [EmailType.CommitmentReminder]: 'commitmentreminder',
    [EmailType.MemberActionReminder]: 'memberactionreminder',
    [EmailType.ForumDigest]: 'forumdigest',
    [EmailType.MissedDeadline]: 'misseddeadline',
    [EmailType.MissedSecondDeadline]: 'missedseconddeadline',
  };

  async sendMail(
    recipient: string,
    emailType: EmailType,
    subject: string | null,
    context: ISendMailOptions['context'],
    cid?: string,
  ): Promise<Mail> {
    if (process.env.NODE_ENV === 'test') {
      return {
        id: 0,
        sentMessageId: 'test',
        to: recipient,
        cid,
        clickedLink: false,
        status: EmailStatus.Sent,
        emailType: emailType,
        createdAt: new Date(),
      };
    }
    const mail = await this.mailRepository.create({
      to: recipient,
      emailType: emailType,
      status: EmailStatus.Pending,
      cid,
    });

    const e = await this.mailerService.sendMail({
      to: recipient,
      from: 'no-reply@worldalliance.org',
      subject: subject ?? undefined,
      headers: {
        'o:tag': emailType,
      },
      template:
        __dirname + `/../../mail/templates/${this.templates[emailType]}`,
      context,
    });

    const accepted = e.accepted as string[];
    const messageId = e.messageId as string;

    if (accepted.length > 0) {
      mail.status = EmailStatus.Sent;
    } else {
      mail.status = EmailStatus.Failed;
    }
    mail.sentMessageId = messageId;
    return this.mailRepository.save(mail);
  }

  public async sendWelcomeEmail(
    recipient: string,
    name: string,
    verifyToken: string,
  ): Promise<Mail> {
    return this.sendMail(
      recipient,
      EmailType.Welcome,
      'Welcome to the Alliance',
      {
        name,
        url: `${process.env.APP_URL}/verifyEmail?token=${verifyToken}`,
      },
    );
  }

  private getPasswordResetUrl(resetToken: string) {
    return `${process.env.APP_URL}/resetpassword?token=${resetToken}`; //todo: domain param
  }

  public async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string,
  ): Promise<Mail> {
    const url = this.getPasswordResetUrl(resetToken);
    return this.sendMail(
      email,
      EmailType.PasswordReset,
      'a link to reset your password',
      {
        name,
        url,
      },
    );
  }

  public async sendPartialSignupEmail(
    email: string,
    name: string,
    resetToken: string,
  ): Promise<Mail> {
    const url = this.getPasswordResetUrl(resetToken);
    return this.sendMail(
      email,
      EmailType.PartialSignup,
      'Thanks for helping out! Want to do more?',
      {
        name,
        email,
        url,
      },
    );
  }

  public async sendCommitmentEmail(
    email: string,
    name: string,
    actionName: string,
    url: string,
  ): Promise<Mail> {
    return this.sendMail(
      email,
      EmailType.Commitment,
      'New Action: ' + actionName,
      {
        name,
        actionName,
        url,
      },
    );
  }

  public async sendMemberActionEmail(
    email: string,
    name: string,
    actionName: string,
    url: string,
  ): Promise<Mail> {
    return this.sendMail(
      email,
      EmailType.MemberAction,
      'Ready to complete: ' + actionName,
      {
        name,
        actionName,
        url,
      },
    );
  }

  public async sendCommitmentReminderEmail(
    email: string,
    name: string,
    actionName: string,
    url: string,
    kind: ReminderKind,
  ): Promise<Mail> {
    return this.sendMail(
      email,
      EmailType.CommitmentReminder,
      `${kind === '3dayreminder' ? '3 day' : '1 day'} left to commit to: ` +
        actionName,
      {
        name,
        actionName,
        url,
        daysleft: kind === '3dayreminder' ? '3 days' : '1 day',
      },
    );
  }

  public async sendMemberActionReminderEmail(
    email: string,
    name: string,
    actionName: string,
    url: string,
    kind: ReminderKind,
  ): Promise<Mail> {
    return this.sendMail(
      email,
      EmailType.MemberActionReminder,
      `${kind === '3dayreminder' ? '3 day' : '1 day'} left to complete: ` +
        actionName,
      {
        name,
        actionName,
        url,
        daysleft: kind === '3dayreminder' ? '3 days' : '1 day',
      },
    );
  }

  public async sendForumDigestEmail(
    email: string,
    name: string,
    unreadCount: number,
    notifications: {
      message: string;
      url?: string | null;
      createdAt: string;
    }[],
    cid: string,
  ): Promise<Mail> {
    const subject = `You have ${unreadCount} unread Alliance forum notification${unreadCount === 1 ? '' : 's'}`;

    return this.sendMail(
      email,
      EmailType.ForumDigest,
      subject,
      {
        name,
        count: unreadCount,
        notifications: notifications.map((item) => ({
          message: item.message,
          url: item.url,
          createdAt: item.createdAt,
        })),
        appUrl: process.env.APP_URL,
      },
      cid,
    );
  }

  getSubject(context: ActionEventNotificationContext): string {
    if (context.type === ActionEventNotifType.Announcement) {
      if (context.event.newStatus === ActionStatus.GatheringCommitments) {
        return 'New Action: ' + context.action.name;
      }
      if (context.event.newStatus === ActionStatus.MemberAction) {
        return 'Ready to complete: ' + context.action.name;
      }
    } else if (context.type === ActionEventNotifType.ThreeDayReminder) {
      if (context.event.newStatus === ActionStatus.GatheringCommitments) {
        return '3 days left to commit to: ' + context.action.name;
      }
      if (context.event.newStatus === ActionStatus.MemberAction) {
        return '3 days left to complete: ' + context.action.name;
      }
    } else if (context.type === ActionEventNotifType.OneDayReminder) {
      if (context.event.newStatus === ActionStatus.GatheringCommitments) {
        return '1 day left to commit to: ' + context.action.name;
      }
      if (context.event.newStatus === ActionStatus.MemberAction) {
        return '1 day left to complete: ' + context.action.name;
      }
    }
    throw new Error('Invalid event in mail context: ' + context.event);
  }

  public async sendActionEventNotificationEmail(
    context: ActionEventNotificationContext,
  ): Promise<Mail> {
    const subject = this.getSubject(context);

    const emailType =
      context.type === ActionEventNotifType.Announcement
        ? context.event.newStatus === ActionStatus.GatheringCommitments
          ? EmailType.Commitment
          : EmailType.MemberAction
        : context.event.newStatus === ActionStatus.GatheringCommitments
          ? EmailType.CommitmentReminder
          : EmailType.MemberActionReminder;

    console.log(
      'url',
      withCid(actionUrl(context.action.id, true), context.cid),
    );
    console.log('cid', context.cid);

    return this.sendMail(
      context.user.email,
      emailType,
      subject,
      {
        name: context.user.name,
        actionName: context.action.name,
        url: withCid(actionUrl(context.action.id, true), context.cid),
        daysleft:
          context.type === ActionEventNotifType.ThreeDayReminder
            ? '3 days'
            : '1 day',
        cid: context.cid,
      },
      context.cid,
    );
  }

  async setClickedLinkByCid(cid: string): Promise<void> {
    const mail = await this.mailRepository.findOne({ where: { cid } });
    if (!mail) {
      throw new NotFoundException('Mail not found');
    }
    mail.clickedLink = true;
    await this.mailRepository.save(mail);
  }
}
