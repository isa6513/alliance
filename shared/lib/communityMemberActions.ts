import type {
  UserActionRelationDetailDto,
  UserActionRelationPillStatus,
  UserActionSummaryDto,
} from "../client";
import { parseTimeInput } from "../forms/timeUtils";

/** Relation statuses that count toward "next task due" / have actions to complete */
export const DEADLINE_IN_CONSIDERATION: Record<
  UserActionRelationPillStatus,
  boolean
> = {
  away: false,
  completed: false,
  missed_deadline: false,
  not_required: false,
  optional_task: false,
  todo: true,
  wont_complete: false,
};

export function getDeadlineTimestampByUserId(params: {
  userActionRelations: Record<number, UserActionRelationDetailDto[]>;
  actions: UserActionSummaryDto[];
  now: number;
}): Map<number, number> {
  const { userActionRelations, actions, now } = params;
  const visibleActions = actions.filter((a) => a.status !== "planned");
  const visibleActionsById = new Map(
    visibleActions.map((action) => [action.id, action]),
  );

  return new Map(
    Object.entries(userActionRelations).map(([userIdKey, relations]) => {
      let deadline = Infinity;
      for (const relation of relations) {
        const action = visibleActionsById.get(relation.actionId);
        if (
          !action ||
          !DEADLINE_IN_CONSIDERATION[relation.status] ||
          action.memberActionDeadline === null ||
          action.memberActionDeadline < now
        ) {
          continue;
        }
        deadline = Math.min(deadline, action.memberActionDeadline);
      }
      return [+userIdKey, deadline];
    }),
  );
}

/** True when the user has at least one action to complete (finite next-task deadline). */
export function hasActionsToComplete(
  deadlineTimestampByUserId: Map<number, number>,
  userId: number,
): boolean {
  return (deadlineTimestampByUserId.get(userId) ?? Infinity) !== Infinity;
}

/** Contact info shape needed for sort tiebreak (preferred reminder time). */
export type MemberContactInfoForSort = {
  preferredReminderTimeLeaderTz?: string | null;
};

/**
 * Sort members by next task due (soonest first), then by preferred reminder time.
 * Use this for consistent ordering with the web app members table.
 */
export function sortMembersByNextTaskDue<T extends { id: number }>(
  members: T[],
  deadlineTimestampByUserId: Map<number, number>,
  memberContactInfo?: Record<number, MemberContactInfoForSort>,
): T[] {
  return [...members].sort((a, b) => {
    const deadlineA = deadlineTimestampByUserId.get(a.id) ?? Infinity;
    const deadlineB = deadlineTimestampByUserId.get(b.id) ?? Infinity;
    if (deadlineA < deadlineB) return -1;
    if (deadlineA > deadlineB) return 1;
    const preferredTimeA =
      memberContactInfo?.[a.id]?.preferredReminderTimeLeaderTz ?? "";
    const preferredTimeB =
      memberContactInfo?.[b.id]?.preferredReminderTimeLeaderTz ?? "";

    const timeA = parseTimeInput(preferredTimeA);
    const timeB = parseTimeInput(preferredTimeB);

    if (timeA && timeB) {
      return timeA.minutes - timeB.minutes;
    }

    return (timeA ? 1 : 0) - (timeB ? 1 : 0);
  });
}
