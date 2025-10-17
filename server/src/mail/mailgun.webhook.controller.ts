import {
  Body,
  Controller,
  Headers,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { PostHog } from 'posthog-node';
import { MailgunWebhookBody } from './mailgun';

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
      return 'email delivered';
    case 'opened':
      return 'email opened';
    case 'clicked':
      return 'email clicked';
    case 'bounced':
      return 'email bounced';
    case 'complained':
      return 'email complained';
    case 'unsubscribed':
      return 'email unsubscribed';
    default:
      return `email ${event}`;
  }
}

@Controller('/mailgun')
export class MailgunWebhookController {
  private readonly posthog: PostHog;
  constructor() {
    this.posthog = new PostHog(process.env.POSTHOG_KEY!, {
      host: 'https://us.i.posthog.com',
    });
  }

  @Post('/handle-event')
  @ApiOkResponse()
  async handle(
    @Body() body: MailgunWebhookBody,
    @Headers('user-agent') ua?: string,
  ) {
    console.log('webhook body', body);
    if (!body?.signature || !verifyMailgunSignature(body.signature)) {
      throw new BadRequestException('invalid signature');
    }

    const e = body['event-data'];
    const eventName = toPostHogEventName(e.event);
    const distinctId =
      e.recipient ?? (e['user-variables']?.userId as string) ?? 'unknown';
    const phTimestamp = e.timestamp ? new Date(e.timestamp * 1000) : new Date();
    const messageId = e.message?.headers?.['message-id'];

    // Use Mailgun event id as a stable UUID for dedupe
    const uuid = e.id;

    const properties = {
      message_id: messageId,
      recipient: e.recipient,
      subject: e.message?.headers?.subject,
      campaign: e.campaign ?? e['campaign-id'],
      tags: e.tags,
      url: e.url,
      ip: e.ip,
      client: e['client-info']?.client_name,
      client_os: e['client-info']?.client_os,
      user_agent: e['client-info']?.user_agent || ua,
      geo: e.geolocation,
      bounce: e['delivery-status'],
      mailgun_event: e.event,
      mailgun_event_id: e.id,
      ...e['user-variables'], // your app metadata you added when sending
    };

    // (Optional) set/update person properties for the recipient
    if (distinctId && distinctId !== 'unknown') {
      this.posthog.identify({
        distinctId,
        properties: {
          last_email_event: e.event,
          last_email_subject: properties.subject,
          last_email_campaign: properties.campaign,
        },
      });
    }

    // Capture in PostHog
    this.posthog.capture({
      event: eventName,
      distinctId,
      properties,
      timestamp: phTimestamp, // server-side timestamp
      uuid, // aids deduplication in PostHog
    });

    await this.posthog.flush();
  }
}
