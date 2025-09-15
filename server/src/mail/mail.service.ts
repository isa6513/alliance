import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailStatus, EmailType, Mail } from './mail.entity';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(Mail)
    private readonly mailRepository: Repository<Mail>,
  ) {}

  private readonly templates = {
    [EmailType.Welcome]: 'welcome',
    [EmailType.PasswordReset]: 'password-reset',
    [EmailType.Verification]: '',
    [EmailType.Other]: '',
    [EmailType.PartialSignup]: 'partial-signup',
    [EmailType.Commitment]: 'commitment',
    [EmailType.MemberAction]: 'memberaction',
  };

  async sendMail(
    recipient: string,
    emailType: EmailType,
    subject: string,
    context: ISendMailOptions['context'],
  ): Promise<Mail> {
    if (process.env.NODE_ENV === 'test') {
      return {
        id: 0,
        sentMessageId: 'test',
        to: recipient,
        status: EmailStatus.Sent,
        emailType: emailType,
        createdAt: new Date(),
      };
    }
    const mail = await this.mailRepository.create({
      to: recipient,
      emailType: emailType,
      status: EmailStatus.Pending,
    });

    const e = await this.mailerService.sendMail({
      to: recipient,
      from: 'no-reply@worldalliance.org',
      subject: subject,
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
}
