import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionEventNotifType } from './entities/action-event-notif.entity';
import {
  ActionEvent,
  ActionStatus,
} from '../actions/entities/action-event.entity';

export interface ReminderCandidate {
  actionId: number;
  currentEventId: number;
  nextEventId: number;
  nextDate: Date;
  type: ActionEventNotifType;
}

@Injectable()
export class ActionEventReminderService {
  constructor(
    @InjectRepository(ActionEvent)
    private readonly eventRepository: Repository<ActionEvent>,
  ) {}

  async findDueReminderEvents(now: Date): Promise<ReminderCandidate[]> {
    const toDate = (value: string | Date): Date =>
      value instanceof Date ? value : new Date(value);

    const currentRows: Array<{
      id: number;
      actionId: number;
      date: Date | string;
      threeDayReminderNotifsSentAt: Date | string | null;
      oneDayReminderNotifsSentAt: Date | string | null;
    }> = await this.eventRepository.query(
      `
        SELECT
          id,
          "actionId",
          date,
          "threeDayReminderNotifsSentAt",
          "oneDayReminderNotifsSentAt"
        FROM action_event
        WHERE date <= $1
          AND "newStatus" IN ('${ActionStatus.GatheringCommitments}', '${ActionStatus.MemberAction}')
        ORDER BY "actionId" ASC, date DESC
      `,
      [now],
    );

    const latestCurrentEventByAction = new Map<
      number,
      {
        id: number;
        actionId: number;
        date: Date;
        threeDayReminderNotifsSentAt: Date | null;
        oneDayReminderNotifsSentAt: Date | null;
      }
    >();

    for (const row of currentRows) {
      if (!latestCurrentEventByAction.has(row.actionId)) {
        latestCurrentEventByAction.set(row.actionId, {
          id: row.id,
          actionId: row.actionId,
          date: toDate(row.date),
          threeDayReminderNotifsSentAt: row.threeDayReminderNotifsSentAt
            ? toDate(row.threeDayReminderNotifsSentAt)
            : null,
          oneDayReminderNotifsSentAt: row.oneDayReminderNotifsSentAt
            ? toDate(row.oneDayReminderNotifsSentAt)
            : null,
        });
      }
    }

    const actionIds = Array.from(latestCurrentEventByAction.keys());
    if (actionIds.length === 0) {
      return [];
    }

    const placeholders = actionIds
      .map((_, index) => `$${index + 2}`)
      .join(', ');
    const nextRows: Array<{
      id: number;
      actionId: number;
      date: Date | string;
    }> = await this.eventRepository.query(
      `
        SELECT id, "actionId", date
        FROM action_event
        WHERE date > $1
          AND "actionId" IN (${placeholders})
        ORDER BY "actionId" ASC, date ASC
      `,
      [now, ...actionIds],
    );

    const earliestNextEventByAction = new Map<
      number,
      { id: number; actionId: number; date: Date }
    >();
    for (const row of nextRows) {
      if (!earliestNextEventByAction.has(row.actionId)) {
        earliestNextEventByAction.set(row.actionId, {
          id: row.id,
          actionId: row.actionId,
          date: toDate(row.date),
        });
      }
    }

    const oneDayMs = 24 * 60 * 60 * 1000;
    const threeDayMs = 3 * oneDayMs;

    const candidates: ReminderCandidate[] = [];

    for (const [actionId, currentEvent] of latestCurrentEventByAction) {
      const nextEvent = earliestNextEventByAction.get(actionId);
      if (!nextEvent) {
        continue;
      }

      const millisUntilNext = nextEvent.date.getTime() - now.getTime();
      let type: ActionEventNotifType | null = null;

      if (
        currentEvent.oneDayReminderNotifsSentAt == null &&
        millisUntilNext <= oneDayMs
      ) {
        type = ActionEventNotifType.OneDayReminder;
      } else if (
        currentEvent.threeDayReminderNotifsSentAt == null &&
        millisUntilNext <= threeDayMs
      ) {
        type = ActionEventNotifType.ThreeDayReminder;
      }

      if (type) {
        candidates.push({
          actionId,
          currentEventId: currentEvent.id,
          nextEventId: nextEvent.id,
          nextDate: nextEvent.date,
          type,
        });
      }
    }

    candidates.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

    return candidates.slice(0, 100);
  }
}
