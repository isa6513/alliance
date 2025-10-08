import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
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
import { ActionEventRecipientService } from './action-event-recipient.service';
import { Action } from '../actions/entities/action.entity';
import {
  NotificationScheduleEntryDto,
  NotificationScheduleMetadataDto,
} from 'src/actions/dto/notification-schedule.dto';

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

export const NOTIFICATION_LOOKBACK_WINDOW_MS = 24 * 60 * 60 * 1000;

export const POST_MEMBER_ACTION_STATUSES = new Set<ActionStatus>([
  ActionStatus.OfficeAction,
  ActionStatus.Resolution,
  ActionStatus.Completed,
  ActionStatus.Failed,
  ActionStatus.Abandoned,
]);

interface NotificationPlan {
  type: ActionEventNotifType;
  scheduledFor: Date;
  referenceEvent: ActionEvent;
  targetEvent: ActionEvent;
  metadata?: NotificationScheduleMetadataDto;
  recipients?: number;
}

@Injectable()
export class ActionEventReminderService {
  constructor(
    @InjectRepository(ActionEvent)
    private readonly eventRepository: Repository<ActionEvent>,
    @InjectRepository(ActionActivity)
    private readonly actionActivityRepository: Repository<ActionActivity>,
    private readonly recipientService: ActionEventRecipientService,
  ) {}

  async evaluateNotifications(
    windowStart: Date,
    windowEnd: Date,
    includeRecipients = false,
  ): Promise<NotificationPlan[]> {
    const start = new Date(windowStart);
    const end = new Date(windowEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid schedule window');
    }
    if (end.getTime() < start.getTime()) {
      throw new Error('windowEnd must not be before windowStart');
    }

    const plans: NotificationPlan[] = [];
    const requiredEvents = new Set<number>();

    // Announcements
    const announcements = await this.eventRepository.find({
      where: {
        sendNotifsTo: Not(NotificationType.None),
        announcementNotifsSentAt: IsNull(),
        newStatus: In(ANNOUNCEMENT_SUPPORTED_STATUSES),
        date: Between(start, end),
      },
      relations: ['action', 'action.participatingGroups'],
      order: { date: 'ASC' },
    });

    for (const event of announcements) {
      plans.push({
        type: ActionEventNotifType.Announcement,
        scheduledFor: event.date,
        referenceEvent: event,
        targetEvent: event,
      });
      requiredEvents.add(event.id);
    }

    // Reminders
    const reminderPlans = await this.computeReminderPlans(start, end);
    for (const plan of reminderPlans) {
      plans.push(plan);
      requiredEvents.add(plan.referenceEvent.id);
      requiredEvents.add(plan.targetEvent.id);
    }

    // Missed deadlines
    const deadlinePlans = await this.computeDeadlinePlans(start, end);
    for (const plan of deadlinePlans) {
      plans.push(plan);
      requiredEvents.add(plan.referenceEvent.id);
      requiredEvents.add(plan.targetEvent.id);
    }

    if (plans.length === 0) {
      return [];
    }

    // Load any events that were not already fully populated with relations
    const missingEventIds = Array.from(requiredEvents).filter((id) =>
      plans.every(
        (plan) => plan.referenceEvent.id !== id && plan.targetEvent.id !== id,
      ),
    );
    if (missingEventIds.length > 0) {
      const extras = await this.eventRepository.find({
        where: { id: In(missingEventIds) },
        relations: ['action', 'action.participatingGroups'],
      });
      const map = new Map(extras.map((event) => [event.id, event]));
      for (const plan of plans) {
        if (!plan.referenceEvent.action) {
          const replacement = map.get(plan.referenceEvent.id);
          if (replacement) plan.referenceEvent = replacement;
        }
        if (!plan.targetEvent.action) {
          const replacement = map.get(plan.targetEvent.id);
          if (replacement) plan.targetEvent = replacement;
        }
      }
    }

    if (includeRecipients) {
      const cache = new Map<string, number>();
      const getCount = async (
        status: ActionStatus,
        action: Action,
      ): Promise<number> => {
        const key = `${status}:${action.id}`;
        if (cache.has(key)) {
          return cache.get(key)!;
        }
        const users = await this.recipientService.getBaseUsersForEvent(
          status,
          action,
        );
        cache.set(key, users.length);
        return users.length;
      };

      for (const plan of plans) {
        if (
          plan.type === ActionEventNotifType.MissedDeadline ||
          plan.type === ActionEventNotifType.MissedSecondDeadline
        ) {
          plan.recipients = plan.recipients ?? 0;
          continue;
        }
        plan.recipients = await getCount(
          plan.referenceEvent.newStatus,
          plan.referenceEvent.action,
        );
      }
    }

    plans.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    return plans;
  }

  async getNotificationSchedule(
    windowStart: Date,
    windowEnd: Date,
  ): Promise<NotificationScheduleEntryDto[]> {
    const plans = await this.evaluateNotifications(
      windowStart,
      windowEnd,
      true,
    );

    return plans.map((plan) => ({
      type: plan.type,
      scheduledFor: plan.scheduledFor,
      actionId: plan.referenceEvent.action!.id,
      actionName: plan.referenceEvent.action!.name,
      actionStatus: plan.referenceEvent.newStatus,
      eventId: plan.targetEvent.id,
      estimatedRecipients: plan.recipients ?? 0,
      metadata: plan.metadata,
    }));
  }

  async evaluateDueNotifications(now: Date) {
    const windowStart = new Date(
      now.getTime() - NOTIFICATION_LOOKBACK_WINDOW_MS,
    );
    return this.evaluateNotifications(windowStart, now, false);
  }

  private async computeReminderPlans(
    windowStart: Date,
    windowEnd: Date,
  ): Promise<NotificationPlan[]> {
    const results: NotificationPlan[] = [];
    const reminderWindowEnd = new Date(
      windowEnd.getTime() + 3 * 24 * 60 * 60 * 1000,
    );

    const events = await this.eventRepository.find({
      where: { date: LessThanOrEqual(reminderWindowEnd) },
      relations: ['action', 'action.participatingGroups'],
      order: { action: { id: 'ASC' }, date: 'ASC' },
    });

    const eventsByAction = new Map<number, ActionEvent[]>();
    for (const event of events) {
      if (!event.action) continue;
      const list = eventsByAction.get(event.action.id) ?? [];
      list.push(event);
      eventsByAction.set(event.action.id, list);
    }

    const threeDayMs = 3 * 24 * 60 * 60 * 1000;
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (const [, list] of eventsByAction) {
      list.sort((a, b) => a.date.getTime() - b.date.getTime());
      for (let i = 0; i < list.length - 1; i += 1) {
        const current = list[i];
        const next = list[i + 1];
        if (
          !current.action ||
          !ANNOUNCEMENT_SUPPORTED_STATUSES.includes(current.newStatus)
        ) {
          continue;
        }

        if (current.threeDayReminderNotifsSentAt == null) {
          const scheduled = new Date(next.date.getTime() - threeDayMs);
          if (scheduled >= windowStart && scheduled <= windowEnd) {
            results.push({
              type: ActionEventNotifType.ThreeDayReminder,
              scheduledFor: scheduled,
              referenceEvent: current,
              targetEvent: next,
              metadata: {
                currentEventId: current.id,
                nextEventId: next.id,
              },
            });
          }
        }

        if (current.oneDayReminderNotifsSentAt == null) {
          const scheduled = new Date(next.date.getTime() - oneDayMs);
          if (scheduled >= windowStart && scheduled <= windowEnd) {
            results.push({
              type: ActionEventNotifType.OneDayReminder,
              scheduledFor: scheduled,
              referenceEvent: current,
              targetEvent: next,
              metadata: {
                currentEventId: current.id,
                nextEventId: next.id,
              },
            });
          }
        }
      }
    }

    return results;
  }

  private async computeDeadlinePlans(
    windowStart: Date,
    windowEnd: Date,
  ): Promise<NotificationPlan[]> {
    const candidates = await this.findMissedDeadlineCandidates(
      windowStart,
      windowEnd,
    );

    if (!candidates.length) {
      return [];
    }

    const eventIds = Array.from(
      new Set(
        candidates.flatMap((candidate) => [
          candidate.deadlineEventId,
          candidate.resolutionEventId,
        ]),
      ),
    );

    const events = await this.eventRepository.find({
      where: { id: In(eventIds) },
      relations: ['action', 'action.participatingGroups'],
    });

    const eventMap = new Map(events.map((event) => [event.id, event]));

    const aggregated = new Map<
      string,
      {
        deadlineEvent: ActionEvent;
        resolutionEvent: ActionEvent;
        count: number;
        isSecondMiss: boolean;
      }
    >();

    for (const candidate of candidates) {
      const deadlineEvent = eventMap.get(candidate.deadlineEventId);
      const resolutionEvent = eventMap.get(candidate.resolutionEventId);
      if (!deadlineEvent || !resolutionEvent || !deadlineEvent.action) {
        continue;
      }

      const key = `${candidate.resolutionEventId}:${candidate.isSecondMiss ? 'second' : 'first'}`;
      const group = aggregated.get(key) ?? {
        deadlineEvent,
        resolutionEvent,
        count: 0,
        isSecondMiss: false,
      };

      group.count += 1;
      group.isSecondMiss = group.isSecondMiss || candidate.isSecondMiss;
      aggregated.set(key, group);
    }

    const plans: NotificationPlan[] = [];

    for (const group of aggregated.values()) {
      plans.push({
        type: group.isSecondMiss
          ? ActionEventNotifType.MissedSecondDeadline
          : ActionEventNotifType.MissedDeadline,
        scheduledFor: group.resolutionEvent.date,
        referenceEvent: group.deadlineEvent,
        targetEvent: group.resolutionEvent,
        metadata: {
          deadlineEventId: group.deadlineEvent.id,
          isSecondMiss: group.isSecondMiss || undefined,
        },
        recipients: group.count,
      });
    }

    return plans;
  }

  async findMissedDeadlineCandidates(
    reference: Date,
    windowEnd: Date = reference,
  ): Promise<MissedDeadlineCandidate[]> {
    const rows = await this.eventRepository.find({
      where: { date: LessThanOrEqual(windowEnd) },
      relations: ['action'],
      order: { action: { id: 'ASC' }, date: 'ASC' },
    });

    const eventsByAction = new Map<number, ActionEvent[]>();
    for (const event of rows) {
      if (!event.action) continue;
      const list = eventsByAction.get(event.action.id) ?? [];
      list.push(event);
      eventsByAction.set(event.action.id, list);
    }

    const candidates = new Map<
      number,
      { deadlineEvent: ActionEvent; resolutionEvent: ActionEvent }
    >();

    for (const [actionId, list] of eventsByAction) {
      list.sort((a, b) => a.date.getTime() - b.date.getTime());
      for (let i = list.length - 1; i >= 0; i -= 1) {
        const deadline = list[i];
        if (deadline.newStatus !== ActionStatus.MemberAction) {
          continue;
        }

        let followUp: ActionEvent | null = null;
        for (let j = i + 1; j < list.length; j += 1) {
          const candidate = list[j];
          if (candidate.newStatus === ActionStatus.MemberAction) {
            continue;
          }
          if (!POST_MEMBER_ACTION_STATUSES.has(candidate.newStatus)) {
            continue;
          }
          followUp = candidate;
          break;
        }

        if (
          followUp &&
          followUp.date >= reference &&
          followUp.date <= windowEnd
        ) {
          candidates.set(actionId, {
            deadlineEvent: deadline,
            resolutionEvent: followUp,
          });
        }

        break;
      }
    }

    if (candidates.size === 0) {
      return [];
    }

    const activities = await this.actionActivityRepository.find({
      where: { actionId: In(Array.from(candidates.keys())) },
      order: { createdAt: 'ASC' },
      select: ['actionId', 'userId', 'type', 'createdAt'],
    });

    const latestActivityByAction = new Map<
      number,
      Map<number, { type: ActionActivityType; createdAt: Date }>
    >();

    for (const activity of activities) {
      const map =
        latestActivityByAction.get(activity.actionId) ??
        new Map<number, { type: ActionActivityType; createdAt: Date }>();
      map.set(activity.userId, {
        type: activity.type,
        createdAt: activity.createdAt,
      });
      latestActivityByAction.set(activity.actionId, map);
    }

    const raw: Array<MissedDeadlineCandidate & { _timelineDate: Date }> = [];

    for (const [actionId, context] of candidates) {
      const userMap = latestActivityByAction.get(actionId);
      if (!userMap) continue;

      for (const [userId, activity] of userMap) {
        if (activity.type !== ActionActivityType.USER_JOINED) {
          continue;
        }
        raw.push({
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

    if (raw.length === 0) {
      return [];
    }

    const userIds = Array.from(
      new Set(raw.map((candidate) => candidate.userId)),
    );
    const completionsByUser = new Map<number, Date[]>();

    if (userIds.length) {
      const completionActivities = await this.actionActivityRepository.find({
        where: {
          userId: In(userIds),
          type: ActionActivityType.USER_COMPLETED,
        },
        order: { createdAt: 'ASC' },
        select: ['userId', 'createdAt'],
      });

      for (const activity of completionActivities) {
        const list = completionsByUser.get(activity.userId) ?? [];
        list.push(activity.createdAt);
        completionsByUser.set(activity.userId, list);
      }
    }

    const groupedByUser = new Map<
      number,
      Array<MissedDeadlineCandidate & { _timelineDate: Date }>
    >();

    for (const candidate of raw) {
      const list = groupedByUser.get(candidate.userId) ?? [];
      list.push(candidate);
      groupedByUser.set(candidate.userId, list);
    }

    for (const [userId, list] of groupedByUser) {
      const completions = (completionsByUser.get(userId) ?? []).slice();
      completions.sort((a, b) => a.getTime() - b.getTime());

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

      for (const candidate of list) {
        timeline.push({
          type: 'miss',
          time: candidate._timelineDate,
          candidate,
        });
      }

      timeline.sort((a, b) => a.time.getTime() - b.time.getTime());

      let consecutiveMisses = 0;
      for (const item of timeline) {
        if (item.type === 'completion') {
          consecutiveMisses = 0;
        } else {
          consecutiveMisses += 1;
          item.candidate.isSecondMiss = consecutiveMisses >= 2;
        }
      }
    }

    return raw;
  }
}
