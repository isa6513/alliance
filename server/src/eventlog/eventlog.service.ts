import { Injectable, Logger } from '@nestjs/common';
import { EventLog, EventType } from './event-log.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EventLogService {
  private readonly logger = new Logger(EventLogService.name);
  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
  ) { }

  async sendMessage(data: { type: EventType, message: string, blob?: Record<string, unknown>, userId?: number }) {
    const { type, message, blob, userId } = data;

    const eventLog = this.eventLogRepository.create({
      event: type,
      message: message,
      blob: blob,
      user: userId ? { id: userId } : undefined,
    });

    await this.eventLogRepository.save(eventLog);
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      this.logger.warn('SLACK_WEBHOOK_URL is not set; skipping Slack message');
      return;
    }
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`Skipping Slack message in development: ${message}`);
      return;
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(
        `Failed to send Slack message: ${res.status} ${res.statusText} ${text}`,
      );
    }
  }
}
