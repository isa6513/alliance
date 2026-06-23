import { ActionEvent, ActionStatus } from '../entities/action-event.entity';
import { memberActionDeadlineEvent } from './action-event';

function event(id: number, date: string, newStatus: ActionStatus): ActionEvent {
  return { id, date: new Date(date), newStatus } as ActionEvent;
}

describe('memberActionDeadlineEvent', () => {
  it('returns null when there is no member-action event', () => {
    const events = [
      event(1, '2026-01-01', ActionStatus.Planned),
      event(2, '2026-02-01', ActionStatus.OfficeAction),
    ];
    expect(memberActionDeadlineEvent(events)).toBeNull();
  });

  it('returns the first event after the member-action event', () => {
    const memberAction = event(2, '2026-02-01', ActionStatus.MemberAction);
    const resolution = event(3, '2026-03-01', ActionStatus.Resolution);
    const events = [
      event(1, '2026-01-01', ActionStatus.Planned),
      memberAction,
      resolution,
      event(4, '2026-04-01', ActionStatus.Completed),
    ];
    expect(memberActionDeadlineEvent(events)).toBe(resolution);
  });

  it('returns null when the member-action event is the last event', () => {
    const events = [
      event(1, '2026-01-01', ActionStatus.Planned),
      event(2, '2026-02-01', ActionStatus.MemberAction),
    ];
    expect(memberActionDeadlineEvent(events)).toBeNull();
  });

  it('ignores event order in the input array', () => {
    const memberAction = event(2, '2026-02-01', ActionStatus.MemberAction);
    const resolution = event(3, '2026-03-01', ActionStatus.Resolution);
    const events = [resolution, memberAction];
    expect(memberActionDeadlineEvent(events)).toBe(resolution);
  });
});
