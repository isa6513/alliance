import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ActionEventNotifType } from './entities/action-event-notif.entity';
import {
  ActionEvent,
  ActionStatus,
  NotificationType,
} from '../actions/entities/action-event.entity';
import {
  ActionActivity,
  ActionActivityType,
} from '../actions/entities/action-activity.entity';

type PastEventRow = {
  id: number;
  actionId: number;
  date: Date | string;
  newStatus: ActionStatus;
  threeDayReminderNotifsSentAt?: Date | string | null;
  oneDayReminderNotifsSentAt?: Date | string | null;
  rn?: number;
};

type PastEventSummary = {
  id: number;
  actionId: number;
  date: Date;
  newStatus: ActionStatus;
  threeDayReminderNotifsSentAt: Date | null;
  oneDayReminderNotifsSentAt: Date | null;
};

export interface ReminderCandidate {
  actionId: number;
  currentEventId: number;
  nextEventId: number;
  nextDate: Date;
  type: ActionEventNotifType;
}

export interface MissedDeadlineCandidate {
  actionId: number;
  userId: number;
  deadlineEventId: number;
  deadlineDate: Date;
  resolutionEventId: number;
  resolutionDate: Date;
  isSecondMiss: boolean;
}

export const ANNOUNCEMENT_SUPPORTED_STATUSES: ActionStatus[] = [
  ActionStatus.GatheringCommitments,
  ActionStatus.MemberAction,
];

const POST_MEMBER_ACTION_STATUSES = new Set<ActionStatus>([
  ActionStatus.OfficeAction,
  ActionStatus.Resolution,
  ActionStatus.Completed,
  ActionStatus.Failed,
  ActionStatus.Abandoned,
]);

@Injectable()
export class ActionEventReminderService {
  constructor(
    @InjectRepository(ActionEvent)
    private readonly eventRepository: Repository<ActionEvent>,
    @InjectRepository(ActionActivity)
    private readonly actionActivityRepository: Repository<ActionActivity>,
  ) {}

  async findDueAnnouncementEventIds(now: Date): Promise<number[]> {
    const statuses = ANNOUNCEMENT_SUPPORTED_STATUSES.map(
      (status) => `'${status}'`,
    ).join(', ');

    const rows: Array<{ id: number }> = await this.eventRepository.query(
      `
        SELECT id
        FROM action_event
        WHERE "sendNotifsTo" != $1
          AND date <= $2
          AND "announcementNotifsSentAt" IS NULL
          AND "newStatus" IN (${statuses})
        ORDER BY date ASC
        LIMIT 100
      `,
      [NotificationType.None, now],
    );

    return rows.map((row) => row.id);
  }

  async findDueReminderEvents(now: Date): Promise<ReminderCandidate[]> {
    const { latestEvents } = await this.loadPastEvents(now);

    const eligibleActions = Array.from(latestEvents.entries()).filter(
      ([, event]) =>
        event.newStatus === ActionStatus.GatheringCommitments ||
        event.newStatus === ActionStatus.MemberAction,
    );

    if (eligibleActions.length === 0) {
      return [];
    }

    const actionIds = eligibleActions.map(([actionId]) => actionId);

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
          date: this.toDate(row.date),
        });
      }
    }

    const oneDayMs = 24 * 60 * 60 * 1000;
    const threeDayMs = 3 * oneDayMs;

    const candidates: ReminderCandidate[] = [];

    for (const [actionId, currentEvent] of eligibleActions) {
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

  async findMissedDeadlineCandidates(
    now: Date,
  ): Promise<MissedDeadlineCandidate[]> {
    const rows: PastEventRow[] = await this.eventRepository.query(
      `
        SELECT id, "actionId", date, "newStatus"
        FROM action_event
        WHERE date <= $1
        ORDER BY "actionId" ASC, date ASC
      `,
      [now],
    );

    const eventsByAction = new Map<number, PastEventSummary[]>();

    for (const row of rows) {
      const summary: PastEventSummary = {
        id: row.id,
        actionId: row.actionId,
        date: this.toDate(row.date),
        newStatus: row.newStatus,
        threeDayReminderNotifsSentAt: row.threeDayReminderNotifsSentAt
          ? this.toDate(row.threeDayReminderNotifsSentAt)
          : null,
        oneDayReminderNotifsSentAt: row.oneDayReminderNotifsSentAt
          ? this.toDate(row.oneDayReminderNotifsSentAt)
          : null,
      };

      const arr = eventsByAction.get(row.actionId) ?? [];
      arr.push(summary);
      eventsByAction.set(row.actionId, arr);
    }

    const candidatesByAction = new Map<
      number,
      {
        deadlineEvent: PastEventSummary;
        resolutionEvent: PastEventSummary;
      }
    >();

    for (const [actionId, events] of eventsByAction) {
      for (let i = events.length - 1; i >= 0; i -= 1) {
        const candidateDeadline = events[i];
        if (candidateDeadline.newStatus !== ActionStatus.MemberAction) {
          continue;
        }

        let followUp: PastEventSummary | null = null;
        for (let j = i + 1; j < events.length; j += 1) {
          const event = events[j];
          if (event.newStatus === ActionStatus.MemberAction) {
            continue;
          }

          if (!POST_MEMBER_ACTION_STATUSES.has(event.newStatus)) {
            continue;
          }

          followUp = event;
          break;
        }

        if (followUp) {
          candidatesByAction.set(actionId, {
            deadlineEvent: candidateDeadline,
            resolutionEvent: followUp,
          });
        }

        break;
      }
    }

    if (candidatesByAction.size === 0) {
      return [];
    }

    const actionIds = Array.from(candidatesByAction.keys());

    const activities = await this.actionActivityRepository.find({
      where: { actionId: In(actionIds) },
      order: { createdAt: 'ASC' },
      select: ['actionId', 'userId', 'type', 'createdAt'],
    });

    const latestActivityByAction = new Map<
      number,
      Map<
        number,
        {
          type: ActionActivityType;
          createdAt: Date;
        }
      >
    >();

    for (const activity of activities) {
      const userMap =
        latestActivityByAction.get(activity.actionId) ??
        new Map<number, { type: ActionActivityType; createdAt: Date }>();

      userMap.set(activity.userId, {
        type: activity.type,
        createdAt: activity.createdAt,
      });

      latestActivityByAction.set(activity.actionId, userMap);
    }

    const rawCandidates: Array<
      MissedDeadlineCandidate & { _timelineDate: Date }
    > = [];

    for (const [actionId, context] of candidatesByAction) {
      const userMap = latestActivityByAction.get(actionId);
      if (!userMap) {
        continue;
      }

      for (const [userId, activity] of userMap) {
        if (activity.type !== ActionActivityType.USER_JOINED) {
          continue;
        }

        rawCandidates.push({
          actionId,
          userId,
          deadlineEventId: context.deadlineEvent.id,
          deadlineDate: context.deadlineEvent.date,
          resolutionEventId: context.resolutionEvent.id,
          resolutionDate: context.resolutionEvent.date,
          isSecondMiss: false,
          _timelineDate: context.resolutionEvent.date,
        });
      }
    }

    if (rawCandidates.length === 0) {
      return [];
    }

    const userIds = Array.from(
      new Set(rawCandidates.map((candidate) => candidate.userId)),
    );

    const completionsByUser = new Map<number, Date[]>();
    if (userIds.length > 0) {
      const completionActivities = await this.actionActivityRepository.find({
        where: {
          userId: In(userIds),
          type: ActionActivityType.USER_COMPLETED,
        },
        order: { createdAt: 'ASC' },
        select: ['userId', 'createdAt'],
      });

      for (const completion of completionActivities) {
        const list = completionsByUser.get(completion.userId) ?? [];
        list.push(completion.createdAt);
        completionsByUser.set(completion.userId, list);
      }
    }

    const candidatesByUser = new Map<
      number,
      Array<MissedDeadlineCandidate & { _timelineDate: Date }>
    >();

    for (const candidate of rawCandidates) {
      const arr = candidatesByUser.get(candidate.userId) ?? [];
      arr.push(candidate);
      candidatesByUser.set(candidate.userId, arr);
    }

    for (const [userId, candidates] of candidatesByUser) {
      const completions = (completionsByUser.get(userId) ?? [])
        .slice()
        .sort((a, b) => a.getTime() - b.getTime());

      const timeline: Array<
        | { type: 'completion'; time: Date }
        | {
            type: 'miss';
            time: Date;
            candidate: MissedDeadlineCandidate & { _timelineDate: Date };
          }
      > = [];

      for (const completion of completions) {
        timeline.push({ type: 'completion', time: completion });
      }

      for (const candidate of candidates) {
        timeline.push({
          type: 'miss',
          time: candidate._timelineDate,
          candidate,
        });
      }

      timeline.sort((a, b) => {
        const diff = a.time.getTime() - b.time.getTime();
        if (diff !== 0) {
          return diff;
        }
        if (a.type === b.type) {
          return 0;
        }
        return a.type === 'completion' ? -1 : 1;
      });

      let consecutiveMisses = 0;
      for (const entry of timeline) {
        if (entry.type === 'completion') {
          consecutiveMisses = 0;
        } else {
          consecutiveMisses += 1;
          entry.candidate.isSecondMiss = consecutiveMisses >= 2;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return rawCandidates.map(({ _timelineDate, ...rest }) => rest);
  }

  private toDate(value: string | Date): Date {
    return value instanceof Date ? value : new Date(value);
  }

  private async loadPastEvents(now: Date): Promise<{
    latestEvents: Map<number, PastEventSummary>;
    previousEvents: Map<number, PastEventSummary>;
  }> {
    const rows: PastEventRow[] = await this.eventRepository.query(
      `
        SELECT
          id,
          "actionId",
          date,
          "newStatus",
          "threeDayReminderNotifsSentAt",
          "oneDayReminderNotifsSentAt",
          ROW_NUMBER() OVER (PARTITION BY "actionId" ORDER BY date DESC) AS rn
        FROM action_event
        WHERE date <= $1
        ORDER BY "actionId" ASC, date DESC
      `,
      [now],
    );

    const latestEvents = new Map<number, PastEventSummary>();
    const previousEvents = new Map<number, PastEventSummary>();

    for (const row of rows) {
      const summary: PastEventSummary = {
        id: row.id,
        actionId: row.actionId,
        date: this.toDate(row.date),
        newStatus: row.newStatus,
        threeDayReminderNotifsSentAt: row.threeDayReminderNotifsSentAt
          ? this.toDate(row.threeDayReminderNotifsSentAt)
          : null,
        oneDayReminderNotifsSentAt: row.oneDayReminderNotifsSentAt
          ? this.toDate(row.oneDayReminderNotifsSentAt)
          : null,
      };

      if (row.rn === 1) {
        latestEvents.set(row.actionId, summary);
      } else if (row.rn === 2 && !previousEvents.has(row.actionId)) {
        previousEvents.set(row.actionId, summary);
      }
    }

    return { latestEvents, previousEvents };
  }
}
