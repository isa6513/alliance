import { findLeast } from 'src/utils/filter';
import { ActionEvent, ActionStatus } from '../entities/action-event.entity';

/**
 * The event that ends the member-action phase: the earliest event after the
 * action's member-action event. An action has at most one member-action event,
 * so any later event closes the phase.
 */
export function memberActionDeadlineEvent(
  events: ActionEvent[],
): ActionEvent | null {
  const memberActionEvent = events.find(
    (event) => event.newStatus === ActionStatus.MemberAction,
  );
  if (!memberActionEvent) {
    return null;
  }
  return (
    findLeast(
      events,
      (a, b) => a.date.getTime() - b.date.getTime(),
      (event) => event.date > memberActionEvent.date,
    ) ?? null
  );
}
