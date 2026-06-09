import { UserActionRelationPillStatus } from '../user/dto/user-action-relations.dto';
import { ActionActivityType } from './entities/action-activity.entity';

/**
 * Maps each activity type to the pill status it implies, or `null` when the
 * activity type does not by itself determine a status. Dismissals and follow-up
 * form submissions leave the underlying status (away / todo / etc.) untouched.
 *
 * Callers fold activities in chronological (createdAt ASC) order with
 * `ACTIVITY_TYPE_TO_PILL_STATUS[type] ?? prev`, so the most recent
 * status-bearing activity wins and a later non-terminal activity (e.g. a
 * follow-up submission after a completion) leaves the prior status intact.
 */
export const ACTIVITY_TYPE_TO_PILL_STATUS: Record<
  ActionActivityType,
  UserActionRelationPillStatus | null
> = {
  [ActionActivityType.USER_COMPLETED]: UserActionRelationPillStatus.Completed,
  [ActionActivityType.USER_WONT_COMPLETE]:
    UserActionRelationPillStatus.WontComplete,
  [ActionActivityType.USER_DISMISSED]: null,
  [ActionActivityType.USER_SUBMITTED_FOLLOW_UP_FORM]: null,
};

export type UserActionPillStatusInput = {
  isJoined: boolean;
  /**
   * Whether the user is away during the action's member-action phase *and* in
   * the action's cohort. Both conditions are required and are checked upstream.
   */
  isAway: boolean;
  optional: boolean;
  deadlinePassed: boolean;
  /**
   * Status from the user's most recent status-bearing activity, or `null` when
   * no activity determines a status.
   */
  activityStatus: UserActionRelationPillStatus | null;
};

/**
 * Resolves a single user's pill status for a single action. Precedence: a
 * terminal activity wins, then away, then a joined participant's task status,
 * else not_required.
 */
export function resolveUserActionPillStatus(
  input: UserActionPillStatusInput,
): UserActionRelationPillStatus {
  if (input.activityStatus) {
    return input.activityStatus;
  }

  if (input.isAway) {
    return UserActionRelationPillStatus.Away;
  }

  if (input.isJoined) {
    if (input.optional) {
      return UserActionRelationPillStatus.OptionalTask;
    }
    if (input.deadlinePassed) {
      return UserActionRelationPillStatus.MissedDeadline;
    }
    return UserActionRelationPillStatus.Todo;
  }

  return UserActionRelationPillStatus.NotRequired;
}
