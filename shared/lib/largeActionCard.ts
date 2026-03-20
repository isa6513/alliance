import { ActionDto, UserActionRelation } from "../client";
import {
  ActionWithAwayStatus,
  TaskAwayStatus,
  deadlineHasPassed,
} from "./actionUtils";
import {
  TASK_DISMISS_HEADER_AWAY,
  TASK_DISMISS_HEADER_DEADLINE,
  TASK_DISMISS_MESSAGE_CURRENTLY_AWAY,
  TASK_DISMISS_MESSAGE_WILL_BE_AWAY,
  TASK_DISMISS_MESSAGE_WAS_AWAY,
  TASK_DISMISS_MESSAGE_AFTER_DEADLINE,
  TASK_OPTIONAL_HEADER,
  TASK_OPTIONAL_MESSAGE,
} from "./copy";

export interface LargeActionCardPropsShared {
  action: ActionWithAwayStatus;
  userRelation: UserActionRelation;
  onUpdateActionState: () => void;
  dismissProps?: {
    header: string;
    message: string;
    onDismiss: () => void;
  };
}

const AWAY_STATUS_MESSAGES = {
  [TaskAwayStatus.AWAY_CURRENTLY]: TASK_DISMISS_MESSAGE_CURRENTLY_AWAY,
  [TaskAwayStatus.AWAY_LATER]: TASK_DISMISS_MESSAGE_WILL_BE_AWAY,
  [TaskAwayStatus.AWAY_PREVIOUSLY]: TASK_DISMISS_MESSAGE_WAS_AWAY,
} as const satisfies Record<
  Exclude<TaskAwayStatus, TaskAwayStatus.NOT_AWAY>,
  string
>;

/**
 * Pure data computation — returns the banner header/message for a task that can
 * be dismissed (away, deadline passed, or optional).  The caller is responsible
 * for attaching the `onDismiss` callback before passing to a component.
 */
export function getTaskDismissInfo(
  action: ActionWithAwayStatus,
): { header: string; message: string } | undefined {
  if (action.onboarding) return undefined;

  if (action.awayStatus !== TaskAwayStatus.NOT_AWAY) {
    return {
      header: TASK_DISMISS_HEADER_AWAY,
      message: AWAY_STATUS_MESSAGES[action.awayStatus],
    };
  }

  if (deadlineHasPassed(action, new Date())) {
    return {
      header: TASK_DISMISS_HEADER_DEADLINE,
      message: TASK_DISMISS_MESSAGE_AFTER_DEADLINE,
    };
  }

  if (action.optional) {
    return {
      header: TASK_OPTIONAL_HEADER,
      message: TASK_OPTIONAL_MESSAGE,
    };
  }

  return undefined;
}

export function getLastAndNextEvent(action: ActionDto) {
  const now = new Date();
  const pastEvents = action.events.filter(
    (event) => new Date(event.date) <= now,
  );

  const futureEvents = action.events.filter(
    (event) => new Date(event.date) > now,
  );

  const lastEvent =
    pastEvents.length > 0 ? pastEvents[pastEvents.length - 1] : null;
  const nextEvent = futureEvents.length > 0 ? futureEvents[0] : null;

  return { lastEvent, nextEvent };
}
