/** @fileoverview Utils for relationships between actions and users */
import { ContractEventType } from 'src/user/entities/contract-event.entity';
import { findLeast } from './filter';
import { Action } from 'src/actions/entities/action.entity';
import { User } from 'src/user/entities/user.entity';
import { Tag } from 'src/user/entities/tag.entity';
import {
  ActionActivity,
  ActionActivityType,
} from 'src/actions/entities/action-activity.entity';
import { getLatestMemberActionAndDeadline } from './action';

export function isInManualCohort(params: {
  action: Pick<Action, 'manualCohortUserIds' | 'useManualCohort'>;
  user: Pick<User, 'id'>;
}): boolean {
  const { user, action } = params;
  if (!action.useManualCohort) {
    return false;
  }
  return action.manualCohortUserIds?.some((m) => m === user.id) ?? false;
}

export function hasOverlappingTags(params: {
  actionParticipatingTagIds: Set<number>;
  userTags: Iterable<number> | Iterable<Tag>;
}): boolean {
  const { actionParticipatingTagIds, userTags } = params;
  for (const tagOrId of userTags) {
    if (typeof tagOrId === 'number') {
      if (actionParticipatingTagIds.has(tagOrId)) {
        return true;
      }
    } else {
      if (actionParticipatingTagIds.has(tagOrId.id)) {
        return true;
      }
    }
  }
  return false;
}

export function isContractActiveDuringEntireLatestMemberAction(params: {
  action: Pick<Action, 'events'>;
  user: Pick<User, 'contractEvents'>;
}): boolean {
  const { action, user } = params;
  const { event: latestMemberActionEvent, endDate } =
    getLatestMemberActionAndDeadline({
      action,
    });

  if (!latestMemberActionEvent) {
    return false;
  }

  const latestContractEventBeforeMemberAction = findLeast(
    user.contractEvents ?? [],
    (a, b) => b.date.getTime() - a.date.getTime(), // reverse order
    (event) => event.date < latestMemberActionEvent.date,
  );
  if (
    !latestContractEventBeforeMemberAction ||
    latestContractEventBeforeMemberAction.type === ContractEventType.SUSPENDED
  ) {
    return false;
  }

  const eventsDuringMemberAction = (user.contractEvents ?? []).filter(
    (event) =>
      event.date > latestMemberActionEvent.date &&
      (!endDate || event.date < endDate),
  );

  return !eventsDuringMemberAction.some(
    (event) => event.type === ContractEventType.SUSPENDED,
  );
}

export function hasWithdrawn(params: {
  actionActivities: Pick<ActionActivity, 'type' | 'userId'>[];
  user: Pick<User, 'id'>;
}): boolean {
  const { actionActivities, user } = params;

  return actionActivities.some(
    (activity) =>
      activity.userId === user.id &&
      activity.type === ActionActivityType.USER_DECLINED,
  );
}

export function hasCompleted(params: {
  actionActivities: Pick<ActionActivity, 'type' | 'userId'>[];
  user: Pick<User, 'id'>;
}): boolean {
  const { actionActivities, user } = params;

  return actionActivities.some(
    (activity) =>
      activity.userId === user.id &&
      activity.type === ActionActivityType.USER_COMPLETED,
  );
}

export function hasDismissed(params: {
  actionActivities: Pick<ActionActivity, 'type' | 'userId'>[];
  user: Pick<User, 'id'>;
}): boolean {
  const { actionActivities, user } = params;

  return actionActivities.some(
    (activity) =>
      activity.userId === user.id &&
      activity.type === ActionActivityType.USER_DISMISSED,
  );
}
