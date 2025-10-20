import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { PostHog } from 'posthog-node';
import { MailgunWebhookBody } from './mailgun';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

function verifyMailgunSignature(sig: {
  timestamp: string;
  token: string;
  signature: string;
}) {
  const hmac = crypto
    .createHmac('sha256', process.env.MAILGUN_SIGNING_KEY!)
    .update(sig.timestamp + sig.token)
    .digest('hex');

  const withinWindow =
    Math.abs(Date.now() / 1000 - Number(sig.timestamp)) < 600; // 10 minutes
  return (
    withinWindow &&
    crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(sig.signature))
  );
}

function toPostHogEventName(event: string): string {
  switch (event) {
    case 'delivered':
      return 'emaildelivered';
    case 'opened':
      return 'emailopened';
    case 'clicked':
      return 'emailclicked';
    case 'bounced':
      return 'emailbounced';
    case 'complained':
      return 'emailcomplained';
    case 'unsubscribed':
      return 'emailunsubscribed';
    default:
      return `email${event}`;
  }
}

@Controller('/mailgun')
export class MailgunWebhookController {
  private readonly posthog: PostHog;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    if (process.env.NODE_ENV === 'test') return;
    this.posthog = new PostHog(process.env.POSTHOG_KEY!, {
      host: 'https://us.i.posthog.com',
    });
  }

  @Post('/handle-event')
  @ApiOkResponse()
  async handle(@Body() body: MailgunWebhookBody) {
    if (process.env.NODE_ENV === 'test') return;

    if (!body?.signature || !verifyMailgunSignature(body.signature)) {
      throw new BadRequestException('invalid signature');
    }

    const e = body['event-data'];
    console.log('message headers', e.message?.headers);
    const eventName = toPostHogEventName(e.event);
    const email = e.recipient ?? 'unknown';
    const phTimestamp = e.timestamp ? new Date(e.timestamp * 1000) : undefined;

    const user = await this.userRepository.findOneBy({ email });
    const distinctId = user?.id.toString() ?? email;

    const isProduction = e.tags?.includes('production');
    if (!isProduction) {
      return;
    }

    const posthogEvent = {
      event: eventName,
      distinctId,
      properties: {
        recipient: email,
        timestamp: phTimestamp,
        subject: e.message?.headers?.subject,
        mailgunId: e.id,
        headers: e.message?.headers,
      },
    };
    console.log('posthogEvent', posthogEvent);

    this.posthog.capture(posthogEvent);

    await this.posthog.flush();
  }
}
