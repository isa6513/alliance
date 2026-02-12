import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventLog, EventType } from './event-log.entity';
import type { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventLogDto, EventLogListDto, EventLogQueryDto } from './dto/event-log.dto';
import { EventLogEvents } from './eventlog.events';

@Injectable()
export class EventLogService {
  private readonly logger = new Logger(EventLogService.name);
  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  private toDto(eventLog: EventLog): EventLogDto {
    const { user, ...rest } = eventLog;
    return {
      ...rest,
      user: user
        ? { id: user.id, displayName: user.anonymous ? 'Someone' : user.name }
        : undefined,
    };
  }

  async findAll(query: EventLogQueryDto): Promise<EventLogListDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const qb = this.eventLogRepository
      .createQueryBuilder('eventLog')
      .leftJoinAndSelect('eventLog.user', 'user')
      .orderBy('eventLog.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.eventType) {
      qb.andWhere('eventLog.event = :eventType', { eventType: query.eventType });
    }

    const [items, totalCount] = await qb.getManyAndCount();

    return {
      items: items.map((item) => this.toDto(item)),
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findOne(id: string): Promise<EventLogDto | null> {
    const eventLog = await this.eventLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return eventLog ? this.toDto(eventLog) : null;
  }

  async sendMessage(data: { type: EventType, message: string, blob?: Record<string, unknown>, userId?: number }) {
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
      this.eventEmitter.emit(EventLogEvents.Created, this.toDto(fullEvent));
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
