import { Repository } from 'typeorm';
import { ActionEventReminderService } from './action-event-reminder.service';
import { ActionEventNotifType } from './entities/action-event-notif.entity';
import { ActionEvent } from 'src/actions/entities/action-event.entity';

describe('ActionEventReminderService', () => {
  let queryMock: jest.Mock;
  let repositoryMock: { query: jest.Mock };
  let service: ActionEventReminderService;
  const now = new Date('2024-01-10T12:00:00Z');

  const buildCurrentRow = (
    overrides: Partial<{
      id: number;
      actionId: number;
      date: Date | string;
      threeDayReminderNotifsSentAt: Date | string | null;
      oneDayReminderNotifsSentAt: Date | string | null;
    }>,
  ) => ({
    id: 0,
    actionId: 0,
    date: new Date('2024-01-01T00:00:00Z'),
    threeDayReminderNotifsSentAt: null,
    oneDayReminderNotifsSentAt: null,
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
    queryMock = jest.fn();
    repositoryMock = {
      query: queryMock,
    };
    service = new ActionEventReminderService(
      repositoryMock as unknown as Repository<ActionEvent>,
    );
  });

  it('returns 3-day reminder candidates when within window and unsent', async () => {
    const currentRow = buildCurrentRow({
      id: 1,
      actionId: 1,
      date: new Date('2024-01-08T12:00:00Z'),
    });
    const nextRow = buildNextRow({
      id: 2,
      actionId: 1,
      date: new Date('2024-01-12T11:00:00Z'),
    });

    queryMock
      .mockResolvedValueOnce([currentRow])
      .mockResolvedValueOnce([nextRow]);

    const result = await service.findDueReminderEvents(now);

    expect(result).toEqual([
      {
        actionId: 1,
        currentEventId: 1,
        nextEventId: 2,
        nextDate: nextRow.date,
        type: ActionEventNotifType.ThreeDayReminder,
      },
    ]);
  });

  it('prefers 1-day reminders when both windows are satisfied', async () => {
    const currentRow = buildCurrentRow({
      id: 10,
      actionId: 10,
      date: new Date('2024-01-09T12:00:00Z'),
    });
    const nextRow = buildNextRow({
      id: 11,
      actionId: 10,
      date: new Date('2024-01-10T18:00:00Z'),
    });

    queryMock
      .mockResolvedValueOnce([currentRow])
      .mockResolvedValueOnce([nextRow]);

    const result = await service.findDueReminderEvents(now);

    expect(result[0].type).toBe(ActionEventNotifType.OneDayReminder);
  });

  it('skips actions missing a future event', async () => {
    const currentRow = buildCurrentRow({
      id: 20,
      actionId: 20,
    });

    queryMock.mockResolvedValueOnce([currentRow]).mockResolvedValueOnce([]);

    const result = await service.findDueReminderEvents(now);

    expect(result).toHaveLength(0);
  });

  it('skips 3-day window if reminder already sent', async () => {
    const currentRow = buildCurrentRow({
      id: 30,
      actionId: 30,
      threeDayReminderNotifsSentAt: new Date('2024-01-07T00:00:00Z'),
    });
    const nextRow = buildNextRow({
      id: 31,
      actionId: 30,
      date: new Date('2024-01-12T12:00:00Z'),
    });

    queryMock
      .mockResolvedValueOnce([currentRow])
      .mockResolvedValueOnce([nextRow]);

    const result = await service.findDueReminderEvents(now);

    expect(result).toHaveLength(0);
  });

  it('falls back to 3-day reminder when 1-day already sent', async () => {
    const currentRow = buildCurrentRow({
      id: 35,
      actionId: 35,
      oneDayReminderNotifsSentAt: new Date('2024-01-09T20:00:00Z'),
    });
    const nextRow = buildNextRow({
      id: 36,
      actionId: 35,
      date: new Date('2024-01-10T18:00:00Z'),
    });

    queryMock
      .mockResolvedValueOnce([currentRow])
      .mockResolvedValueOnce([nextRow]);

    const result = await service.findDueReminderEvents(now);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe(ActionEventNotifType.ThreeDayReminder);
  });

  it('omits reminders when both flags already populated', async () => {
    const currentRow = buildCurrentRow({
      id: 37,
      actionId: 37,
      threeDayReminderNotifsSentAt: new Date('2024-01-08T00:00:00Z'),
      oneDayReminderNotifsSentAt: new Date('2024-01-09T20:00:00Z'),
    });
    const nextRow = buildNextRow({
      id: 38,
      actionId: 37,
      date: new Date('2024-01-10T18:00:00Z'),
    });

    queryMock
      .mockResolvedValueOnce([currentRow])
      .mockResolvedValueOnce([nextRow]);

    const result = await service.findDueReminderEvents(now);

    expect(result).toHaveLength(0);
  });

  it('orders results by the next event date and caps at 100', async () => {
    const currentEvents = Array.from({ length: 120 }, (_, idx) =>
      buildCurrentRow({
        id: 1000 + idx,
        actionId: 1000 + idx,
        date: new Date('2024-01-08T12:00:00Z'),
      }),
    );

    const nextEvents = currentEvents.map((event, idx) =>
      buildNextRow({
        id: 2000 + idx,
        actionId: event.actionId,
        date: new Date('2024-01-10T12:00:00Z'),
      }),
    );

    queryMock
      .mockResolvedValueOnce(currentEvents)
      .mockResolvedValueOnce(nextEvents);

    const result = await service.findDueReminderEvents(now);

    expect(result).toHaveLength(100);
    expect(result[0].nextDate <= result[1].nextDate).toBe(true);
  });

  it('ignores current events whose status is not eligible', async () => {
    queryMock.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    await service.findDueReminderEvents(now);

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('newStatus'),
      [now],
    );
  });
});
