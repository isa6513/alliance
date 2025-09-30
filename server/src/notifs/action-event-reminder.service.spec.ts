import { Repository } from 'typeorm';
import {
  ActionEventReminderService,
  MissedDeadlineCandidate,
} from './action-event-reminder.service';
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

describe('ActionEventReminderService', () => {
  let eventQueryMock: jest.Mock;
  let actionActivityFindMock: jest.Mock;
  let eventRepositoryMock: { query: jest.Mock };
  let actionActivityRepositoryMock: { find: jest.Mock };
  let service: ActionEventReminderService;
  const now = new Date('2024-01-10T12:00:00Z');

  const buildPastEventRow = (
    overrides: Partial<{
      id: number;
      actionId: number;
      date: Date | string;
      newStatus: ActionStatus;
      threeDayReminderNotifsSentAt: Date | string | null;
      oneDayReminderNotifsSentAt: Date | string | null;
      rn: number;
    }>,
  ) => ({
    id: 0,
    actionId: 0,
    date: new Date('2024-01-01T00:00:00Z'),
    newStatus: ActionStatus.GatheringCommitments,
    threeDayReminderNotifsSentAt: null,
    oneDayReminderNotifsSentAt: null,
    rn: 1,
    ...overrides,
  });

  const buildNextRow = (
    overrides: Partial<{ id: number; actionId: number; date: Date | string }>,
  ) => ({
    id: 0,
    actionId: 0,
    date: new Date('2024-01-02T00:00:00Z'),
    ...overrides,
  });

  beforeEach(() => {
    eventQueryMock = jest.fn();
    actionActivityFindMock = jest.fn();
    eventRepositoryMock = {
      query: eventQueryMock,
    };
    actionActivityRepositoryMock = {
      find: actionActivityFindMock,
    };
    service = new ActionEventReminderService(
      eventRepositoryMock as unknown as Repository<ActionEvent>,
      actionActivityRepositoryMock as unknown as Repository<ActionActivity>,
    );
  });

  describe('findDueAnnouncementEventIds', () => {
    it('returns event ids when announcements are due', async () => {
      const rows = [{ id: 42 }];
      eventQueryMock.mockResolvedValueOnce(rows);

      const result = await service.findDueAnnouncementEventIds(now);

      expect(result).toEqual([42]);
      expect(eventQueryMock).toHaveBeenCalledWith(
        expect.stringContaining('"announcementNotifsSentAt" IS NULL'),
        [NotificationType.None, now],
      );
    });

    it('returns empty array when nothing is due', async () => {
      eventQueryMock.mockResolvedValueOnce([]);

      const result = await service.findDueAnnouncementEventIds(now);

      expect(result).toEqual([]);
    });
  });

  describe('findDueReminderEvents', () => {
    it('returns 3-day reminder candidates when within window and unsent', async () => {
      const pastRows = [
        buildPastEventRow({
          id: 1,
          actionId: 1,
          date: new Date('2024-01-08T12:00:00Z'),
          newStatus: ActionStatus.GatheringCommitments,
        }),
      ];
      const nextRows = [
        buildNextRow({
          id: 2,
          actionId: 1,
          date: new Date('2024-01-12T11:00:00Z'),
        }),
      ];

      eventQueryMock.mockResolvedValueOnce(pastRows).mockResolvedValueOnce(nextRows);

      const result = await service.findDueReminderEvents(now);

      expect(eventQueryMock).toHaveBeenCalledTimes(2);

      expect(result).toEqual([
        {
          actionId: 1,
          currentEventId: 1,
          nextEventId: 2,
          nextDate: new Date('2024-01-12T11:00:00Z'),
          type: ActionEventNotifType.ThreeDayReminder,
        },
      ]);
    });

    it('prefers 1-day reminders when both windows are satisfied', async () => {
      const pastRows = [
        buildPastEventRow({
          id: 10,
          actionId: 10,
          date: new Date('2024-01-09T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        }),
      ];
      const nextRows = [
        buildNextRow({
          id: 11,
          actionId: 10,
          date: new Date('2024-01-10T18:00:00Z'),
        }),
      ];

      eventQueryMock.mockResolvedValueOnce(pastRows).mockResolvedValueOnce(nextRows);

      const result = await service.findDueReminderEvents(now);

      expect(result[0].type).toBe(ActionEventNotifType.OneDayReminder);
    });

    it('skips actions missing a future event', async () => {
      const pastRows = [buildPastEventRow({ id: 20, actionId: 20 })];

      eventQueryMock.mockResolvedValueOnce(pastRows).mockResolvedValueOnce([]);

      const result = await service.findDueReminderEvents(now);

      expect(result).toHaveLength(0);
    });

    it('skips 3-day window if reminder already sent', async () => {
      const pastRows = [
        buildPastEventRow({
          id: 30,
          actionId: 30,
          date: new Date('2024-01-08T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
          threeDayReminderNotifsSentAt: new Date('2024-01-07T00:00:00Z'),
        }),
      ];
      const nextRows = [
        buildNextRow({
          id: 31,
          actionId: 30,
          date: new Date('2024-01-12T12:00:00Z'),
        }),
      ];

      eventQueryMock.mockResolvedValueOnce(pastRows).mockResolvedValueOnce(nextRows);

      const result = await service.findDueReminderEvents(now);

      expect(result).toHaveLength(0);
    });

    it('falls back to 3-day reminder when 1-day already sent', async () => {
      const pastRows = [
        buildPastEventRow({
          id: 35,
          actionId: 35,
          newStatus: ActionStatus.MemberAction,
          oneDayReminderNotifsSentAt: new Date('2024-01-09T20:00:00Z'),
        }),
      ];
      const nextRows = [
        buildNextRow({
          id: 36,
          actionId: 35,
          date: new Date('2024-01-10T18:00:00Z'),
        }),
      ];

      eventQueryMock.mockResolvedValueOnce(pastRows).mockResolvedValueOnce(nextRows);

      const result = await service.findDueReminderEvents(now);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(ActionEventNotifType.ThreeDayReminder);
    });

    it('omits reminders when both flags already populated', async () => {
      const pastRows = [
        buildPastEventRow({
          id: 37,
          actionId: 37,
          newStatus: ActionStatus.MemberAction,
          threeDayReminderNotifsSentAt: new Date('2024-01-08T00:00:00Z'),
          oneDayReminderNotifsSentAt: new Date('2024-01-09T20:00:00Z'),
        }),
      ];
      const nextRows = [
        buildNextRow({
          id: 38,
          actionId: 37,
          date: new Date('2024-01-10T18:00:00Z'),
        }),
      ];

      eventQueryMock.mockResolvedValueOnce(pastRows).mockResolvedValueOnce(nextRows);

      const result = await service.findDueReminderEvents(now);

      expect(result).toHaveLength(0);
    });

    it('orders results by the next event date and caps at 100', async () => {
      const pastRows = Array.from({ length: 120 }, (_, idx) =>
        buildPastEventRow({
          id: 1000 + idx,
          actionId: 1000 + idx,
          date: new Date('2024-01-08T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        }),
      );

      const nextRows = pastRows.map((event, idx) =>
        buildNextRow({
          id: 2000 + idx,
          actionId: event.actionId,
          date: new Date('2024-01-10T12:00:00Z'),
        }),
      );

      eventQueryMock.mockResolvedValueOnce(pastRows).mockResolvedValueOnce(nextRows);

      const result = await service.findDueReminderEvents(now);

      expect(result).toHaveLength(100);
      expect(result[0].nextDate <= result[1].nextDate).toBe(true);
    });

    it('ignores current events whose status is not eligible', async () => {
      const pastRows = [
        buildPastEventRow({
          id: 50,
          actionId: 50,
          newStatus: ActionStatus.Resolution,
        }),
      ];

      eventQueryMock.mockResolvedValueOnce(pastRows);

      await service.findDueReminderEvents(now);

      expect(eventQueryMock).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('ROW_NUMBER'),
        [now],
      );
    });
  });

  describe('findMissedDeadlineCandidates', () => {
    const buildDeadlineRows = () => [
      buildPastEventRow({
        id: 1,
        actionId: 1,
        date: new Date('2024-01-08T12:00:00Z'),
        newStatus: ActionStatus.MemberAction,
      }),
      buildPastEventRow({
        id: 2,
        actionId: 1,
        date: new Date('2024-01-09T12:00:00Z'),
        newStatus: ActionStatus.OfficeAction,
      }),
    ];

    it('returns users who remained joined when the action moved past member action', async () => {
      eventQueryMock.mockResolvedValueOnce(buildDeadlineRows());

      actionActivityFindMock
        .mockResolvedValueOnce([
          {
            actionId: 1,
            userId: 10,
            type: ActionActivityType.USER_JOINED,
            createdAt: new Date('2024-01-01T00:00:00Z'),
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.findMissedDeadlineCandidates(now);

      expect(result).toEqual<MissedDeadlineCandidate[]>([
        {
          actionId: 1,
          userId: 10,
          deadlineEventId: 1,
          deadlineDate: new Date('2024-01-08T12:00:00Z'),
          resolutionEventId: 2,
          resolutionDate: new Date('2024-01-09T12:00:00Z'),
          isSecondMiss: false,
        },
      ]);
    });

    it('omits users who completed the action', async () => {
      eventQueryMock.mockResolvedValueOnce(buildDeadlineRows());

      actionActivityFindMock
        .mockResolvedValueOnce([
          {
            actionId: 1,
            userId: 10,
            type: ActionActivityType.USER_COMPLETED,
            createdAt: new Date('2024-01-05T00:00:00Z'),
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.findMissedDeadlineCandidates(now);

      expect(result).toHaveLength(0);
    });

    it('flags a second consecutive miss without an intervening completion', async () => {
      const rows = [
        buildPastEventRow({
          id: 4,
          actionId: 2,
          date: new Date('2024-01-07T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        }),
        buildPastEventRow({
          id: 5,
          actionId: 2,
          date: new Date('2024-01-09T12:00:00Z'),
          newStatus: ActionStatus.Resolution,
        }),
        buildPastEventRow({
          id: 2,
          actionId: 1,
          date: new Date('2024-01-03T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        }),
        buildPastEventRow({
          id: 3,
          actionId: 1,
          date: new Date('2024-01-05T12:00:00Z'),
          newStatus: ActionStatus.Resolution,
        }),
      ];

      eventQueryMock.mockResolvedValueOnce(rows);

      actionActivityFindMock
        .mockResolvedValueOnce([
          {
            actionId: 1,
            userId: 10,
            type: ActionActivityType.USER_JOINED,
            createdAt: new Date('2024-01-01T00:00:00Z'),
          },
          {
            actionId: 2,
            userId: 10,
            type: ActionActivityType.USER_JOINED,
            createdAt: new Date('2024-01-06T00:00:00Z'),
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.findMissedDeadlineCandidates(now);

      const second = result.find((candidate) => candidate.actionId === 2);

      expect(result).toHaveLength(2);
      expect(second?.isSecondMiss).toBe(true);
    });

    it('resets the consecutive counter when a completion occurs between misses', async () => {
      const rows = [
        buildPastEventRow({
          id: 5,
          actionId: 3,
          date: new Date('2024-01-07T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        }),
        buildPastEventRow({
          id: 6,
          actionId: 3,
          date: new Date('2024-01-09T12:00:00Z'),
          newStatus: ActionStatus.Resolution,
        }),
        buildPastEventRow({
          id: 3,
          actionId: 2,
          date: new Date('2024-01-03T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        }),
        buildPastEventRow({
          id: 4,
          actionId: 2,
          date: new Date('2024-01-05T12:00:00Z'),
          newStatus: ActionStatus.Resolution,
        }),
        buildPastEventRow({
          id: 1,
          actionId: 1,
          date: new Date('2023-12-28T12:00:00Z'),
          newStatus: ActionStatus.MemberAction,
        }),
        buildPastEventRow({
          id: 2,
          actionId: 1,
          date: new Date('2023-12-30T12:00:00Z'),
          newStatus: ActionStatus.Resolution,
        }),
      ];

      eventQueryMock.mockResolvedValueOnce(rows);

      actionActivityFindMock
        .mockResolvedValueOnce([
          {
            actionId: 1,
            userId: 10,
            type: ActionActivityType.USER_JOINED,
            createdAt: new Date('2023-12-20T00:00:00Z'),
          },
          {
            actionId: 2,
            userId: 10,
            type: ActionActivityType.USER_JOINED,
            createdAt: new Date('2024-01-01T00:00:00Z'),
          },
          {
            actionId: 3,
            userId: 10,
            type: ActionActivityType.USER_JOINED,
            createdAt: new Date('2024-01-06T00:00:00Z'),
          },
        ])
        .mockResolvedValueOnce([
          {
            userId: 10,
            createdAt: new Date('2024-01-04T00:00:00Z'),
          },
        ]);

      const result = await service.findMissedDeadlineCandidates(now);

      const afterCompletion = result.find((candidate) => candidate.actionId === 2);
      const third = result.find((candidate) => candidate.actionId === 3);

      expect(afterCompletion?.isSecondMiss).toBe(false);
      expect(third?.isSecondMiss).toBe(true);
    });
  });
});
