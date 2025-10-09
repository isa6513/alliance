import { Repository } from 'typeorm';
import { ActionEventReminderService } from './action-event-reminder.service';
import { ActionEventNotifType } from './entities/action-event-notif.entity';
import {
  ActionStatus,
  NotificationType,
} from '../actions/entities/action-event.entity';
import {
  ActionActivity,
  ActionActivityType,
} from '../actions/entities/action-activity.entity';
import { ActionEvent } from '../actions/entities/action-event.entity';
import { ActionEventRecipientService } from './action-event-recipient.service';

const announcementEvent = (overrides: Partial<ActionEvent> = {}): ActionEvent =>
  ({
    id: 1,
    date: new Date('2024-01-11T12:00:00Z'),
    newStatus: ActionStatus.GatheringCommitments,
    sendNotifsTo: NotificationType.All,
    announcementNotifsSentAt: null,
    action: {
      id: 10,
      name: 'Announcement Action',
      participatingGroups: [],
    },
    ...overrides,
  }) as unknown as ActionEvent;

const reminderEvent = (overrides: Partial<ActionEvent> = {}): ActionEvent =>
  ({
    id: 2,
    action: {
      id: 20,
      name: 'Reminder Action',
      participatingGroups: [],
    },
    date: new Date('2024-01-13T12:00:00Z'),
    newStatus: ActionStatus.Resolution,
    ...overrides,
  }) as unknown as ActionEvent;

describe('ActionEventReminderService', () => {
  let eventQueryMock: jest.Mock;
  let repositoryMock: { query: jest.Mock; find: jest.Mock };
  let activityRepositoryMock: { find: jest.Mock };
  let recipientServiceMock: { getBaseUsersForEvent: jest.Mock };
  let service: ActionEventReminderService;

  beforeEach(() => {
    eventQueryMock = jest.fn();
    repositoryMock = {
      query: eventQueryMock,
      find: jest.fn().mockResolvedValue([]),
    };
    activityRepositoryMock = {
      find: jest.fn().mockResolvedValue([]),
    };
    recipientServiceMock = {
      getBaseUsersForEvent: jest.fn().mockResolvedValue([]),
    };

    service = new ActionEventReminderService(
      repositoryMock as unknown as Repository<ActionEvent>,
      activityRepositoryMock as unknown as Repository<ActionActivity>,
      recipientServiceMock as unknown as ActionEventRecipientService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findMissedDeadlineCandidates', () => {
    it('identifies missed deadlines and second misses', async () => {
      (repositoryMock.find as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          action: { id: 100, name: 'Deadline Action' },
          date: new Date('2024-01-05T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        } as unknown as ActionEvent,
        {
          id: 2,
          action: { id: 100, name: 'Deadline Action' },
          date: new Date('2024-01-10T12:00:00Z'),
          newStatus: ActionStatus.OfficeAction,
        } as unknown as ActionEvent,
      ]);

      eventQueryMock.mockResolvedValueOnce([
        {
          id: 1,
          actionId: 100,
          date: new Date('2024-01-05T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        },
        {
          id: 2,
          actionId: 100,
          date: new Date('2024-01-10T12:00:00Z'),
          newStatus: ActionStatus.OfficeAction,
        },
      ]);

      activityRepositoryMock.find.mockResolvedValue([
        {
          actionId: 100,
          userId: 1,
          type: ActionActivityType.USER_JOINED,
          createdAt: new Date('2024-01-04T00:00:00Z'),
        },
      ]);

      const results = await service.findMissedDeadlineCandidates(
        new Date('2024-01-07T00:00:00Z'),
        new Date('2024-01-12T00:00:00Z'),
      );

      //   const sanitized = results.map((candidate) => {
      //     const { _timelineDate, ...rest } = candidate;
      //     return rest;
      //   });

      expect(results.length).toBe(1);
      expect(results[0]).toMatchObject({
        actionId: 100,
        userId: 1,
        deadlineEventId: 1,
        deadlineDate: new Date('2024-01-05T12:00:00Z'),
        resolutionEventId: 2,
        resolutionDate: new Date('2024-01-10T12:00:00Z'),
        isSecondMiss: false,
      });
    });

    it('includes all base recipients for commitmentless actions', async () => {
      const action = {
        id: 200,
        name: 'Commitmentless Action',
        commitmentless: true,
        participatingGroups: [],
      };

      (repositoryMock.find as jest.Mock).mockResolvedValueOnce([
        {
          id: 10,
          action,
          date: new Date('2024-02-01T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        } as unknown as ActionEvent,
        {
          id: 11,
          action,
          date: new Date('2024-02-05T12:00:00Z'),
          newStatus: ActionStatus.Resolution,
        } as unknown as ActionEvent,
      ]);

      activityRepositoryMock.find
        .mockResolvedValueOnce([
          {
            actionId: action.id,
            userId: 1,
            type: ActionActivityType.USER_JOINED,
            createdAt: new Date('2024-01-31T00:00:00Z'),
          },
        ])
        .mockResolvedValueOnce([]);

      recipientServiceMock.getBaseUsersForEvent.mockResolvedValueOnce([
        {
          id: 1,
          contractDateSigned: new Date('2024-01-01T00:00:00Z'),
        },
        {
          id: 2,
          contractDateSigned: new Date('2024-01-02T00:00:00Z'),
        },
      ]);

      const results = await service.findMissedDeadlineCandidates(
        new Date('2024-02-03T00:00:00Z'),
        new Date('2024-02-06T00:00:00Z'),
      );

      expect(recipientServiceMock.getBaseUsersForEvent).toHaveBeenCalledWith(
        ActionStatus.MemberAction,
        action,
        new Date('2024-02-01T12:00:00.000Z'),
      );
      expect(results).toHaveLength(2);
      expect(results.map((candidate) => candidate.userId).sort()).toEqual([
        1, 2,
      ]);
    });

    it('skips base recipients without signed contracts for commitmentless actions', async () => {
      const action = {
        id: 201,
        name: 'Commitmentless Action',
        commitmentless: true,
        participatingGroups: [],
      };

      (repositoryMock.find as jest.Mock).mockResolvedValueOnce([
        {
          id: 20,
          action,
          date: new Date('2024-03-01T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        } as unknown as ActionEvent,
        {
          id: 21,
          action,
          date: new Date('2024-03-05T12:00:00Z'),
          newStatus: ActionStatus.Resolution,
        } as unknown as ActionEvent,
      ]);

      activityRepositoryMock.find
        .mockResolvedValueOnce([
          {
            actionId: action.id,
            userId: 1,
            type: ActionActivityType.USER_JOINED,
            createdAt: new Date('2024-02-28T00:00:00Z'),
          },
        ])
        .mockResolvedValueOnce([]);

      recipientServiceMock.getBaseUsersForEvent.mockResolvedValueOnce([
        {
          id: 1,
          contractDateSigned: new Date('2024-01-01T00:00:00Z'),
        },
        {
          id: 3,
          contractDateSigned: null,
        },
      ]);

      const results = await service.findMissedDeadlineCandidates(
        new Date('2024-03-03T00:00:00Z'),
        new Date('2024-03-06T00:00:00Z'),
      );

      expect(results.map((candidate) => candidate.userId)).toEqual([1]);
    });
  });

  describe('evaluateNotifications', () => {
    it('includes reminder plans for upcoming events', async () => {
      const windowStart = new Date('2024-01-10T00:00:00Z');
      const windowEnd = new Date('2024-01-12T23:59:59Z');

      const currentEvent = reminderEvent({
        id: 500,
        date: new Date('2024-01-10T12:00:00Z'),
        newStatus: ActionStatus.MemberAction,
      });

      const nextEvent = reminderEvent({
        id: 501,
        date: new Date('2024-01-13T12:00:00Z'),
        newStatus: ActionStatus.Resolution,
      });

      (repositoryMock.find as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([currentEvent, nextEvent])
        .mockResolvedValueOnce([]);

      jest
        .spyOn(
          service as unknown as { findMissedDeadlineCandidates: jest.Mock },
          'findMissedDeadlineCandidates',
        )
        .mockResolvedValueOnce([]);

      const plans = await service.evaluateNotifications(
        windowStart,
        windowEnd,
        false,
      );

      expect(plans.map((plan) => plan.type)).toEqual([
        ActionEventNotifType.ThreeDayReminder,
        ActionEventNotifType.OneDayReminder,
      ]);
      expect(plans[0].referenceEvent.id).toBe(currentEvent.id);
      expect(plans[0].targetEvent.id).toBe(nextEvent.id);
    });
  });

  describe('getNotificationSchedule', () => {
    it('maps evaluation plans to DTOs', async () => {
      const plan = {
        type: ActionEventNotifType.Announcement,
        scheduledFor: new Date('2024-01-11T12:00:00Z'),
        referenceEvent: announcementEvent(),
        targetEvent: announcementEvent(),
        metadata: { currentEventId: 1 },
        recipients: 5,
      };

      jest
        .spyOn(
          service as unknown as { evaluateNotifications: jest.Mock },
          'evaluateNotifications',
        )
        .mockResolvedValueOnce([plan]);

      const result = await service.getNotificationSchedule(
        new Date('2024-01-10T12:00:00Z'),
        new Date('2024-01-12T12:00:00Z'),
      );

      expect(result).toEqual([
        {
          type: plan.type,
          scheduledFor: plan.scheduledFor,
          actionId: plan.referenceEvent.action!.id,
          actionName: plan.referenceEvent.action!.name,
          actionStatus: plan.referenceEvent.newStatus,
          eventId: plan.targetEvent.id,
          estimatedRecipients: 5,
          metadata: plan.metadata,
        },
      ]);
    });
  });
});
