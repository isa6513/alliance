import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventLog, EventType, SEND_TO_SLACK } from './event-log.entity';
import type { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EventLogDto,
  EventLogList,
  EventLogQueryDto,
} from './dto/event-log.dto';
import { EventLogEvents } from './eventlog.events';

@Injectable()
export class EventLogService {
  private readonly logger = new Logger(EventLogService.name);
  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(query: EventLogQueryDto): Promise<EventLogList> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const qb = this.eventLogRepository
      .createQueryBuilder('eventLog')
      .leftJoinAndSelect('eventLog.user', 'user')
      .orderBy('eventLog.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.eventType) {
      qb.andWhere('eventLog.event = :eventType', {
        eventType: query.eventType,
      });
    }

    const [items, totalCount] = await qb.getManyAndCount();

    return {
      items,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findOne(id: string): Promise<EventLog | null> {
    return this.eventLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async sendMessage(data: {
    type: EventType;
    message: string;
    blob?: Record<string, unknown>;
    userId?: number;
  }) {
    const { type, message, blob, userId } = data;

    const eventLog = this.eventLogRepository.create({
      event: type,
      message: message,
      blob: blob,
      user: userId ? { id: userId } : undefined,
    });

    const saved = await this.eventLogRepository.save(eventLog);

    // Re-query with user relation for the event payload
    const fullEvent = await this.eventLogRepository.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    if (fullEvent) {
      this.eventEmitter.emit(
        EventLogEvents.Created,
        new EventLogDto(fullEvent),
      );
    }
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      this.logger.warn('SLACK_WEBHOOK_URL is not set; skipping Slack message');
      return;
    }
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`Skipping Slack message in development: ${message}`);
      return;
    }

    if (!SEND_TO_SLACK[type]) {
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
