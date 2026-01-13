/** @fileoverview Utils for relationships between actions and users */
import { Action } from 'src/actions/entities/action.entity';
import { User } from 'src/user/entities/user.entity';
import { Tag } from 'src/user/entities/tag.entity';
import {
  ActionActivity,
  ActionActivityType,
} from 'src/actions/entities/action-activity.entity';
import { computeLatestMemberActionAndDeadline } from './action';
import {
  computeIsContractActiveInFullRange,
  computeIsAwayInRange,
} from './user';

export function getIsInManualCohort(params: {
  manualCohortUserIds?: Set<number>;
  useManualCohort?: boolean;
  user: Pick<User, 'id'>;
}): boolean {
  const { user, manualCohortUserIds, useManualCohort } = params;
  if (!useManualCohort) {
    return false;
  }
  return manualCohortUserIds?.has(user.id) ?? false;
}

export function computeHasOverlappingTags(params: {
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

export function computeIsContractActiveDuringEntireLatestMemberAction(params: {
  action: Pick<Action, 'events'>;
  user: Pick<User, 'contractEvents'>;
}): boolean {
  const { action, user } = params;
  const { event: latestMemberActionEvent, endDate } =
    computeLatestMemberActionAndDeadline({
      action,
    });

  if (!latestMemberActionEvent) {
    return false;
  }

  return computeIsContractActiveInFullRange({
    user,
    startDate: latestMemberActionEvent.date,
    endDate,
  });
}

export function computeIsAwayDuringAnyOfLastMemberAction(params: {
  action: Pick<Action, 'events'>;
  user: Pick<User, 'awayRanges'>;
}): boolean {
  const { action, user } = params;

  const { event: lastMemberActionEvent, endDate } =
    computeLatestMemberActionAndDeadline({
      action,
    });

  if (!lastMemberActionEvent) {
    return false;
  }

  return computeIsAwayInRange({
    user,
    startDate: lastMemberActionEvent.date,
    endDate,
  });
}

export function computeHasWithdrawn(params: {
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

export function computeHasCompleted(params: {
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

export function computeHasDismissed(params: {
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

export function computeHasJoinedCommitmentfulAction(params: {
  user: Pick<User, 'id'>;
  actionActivities: Pick<ActionActivity, 'type' | 'userId'>[];
}): boolean {
  const { actionActivities, user } = params;

  return actionActivities.some(
    (activity) =>
      activity.userId === user.id &&
      activity.type === ActionActivityType.USER_JOINED,
  );
}

export function actionActivitiesByActionThenUserGetter(params: {
  actionActivities: Iterable<ActionActivity>;
}): {
  (actionId: number, userId: number): ActionActivity[];
  map: Map<number, Map<number, ActionActivity[]>>;
} {
  const { actionActivities } = params;

  const actionActivitiesByActionThenUser = new Map<
    number,
    Map<number, ActionActivity[]>
  >();
  function getActivities(actionId: number, userId: number): ActionActivity[] {
    if (!actionActivitiesByActionThenUser.has(actionId)) {
      actionActivitiesByActionThenUser.set(
        actionId,
        new Map<number, ActionActivity[]>(),
      );
    }
    if (!actionActivitiesByActionThenUser.get(actionId)!.has(userId)) {
      actionActivitiesByActionThenUser.get(actionId)!.set(userId, []);
    }
    return actionActivitiesByActionThenUser.get(actionId)!.get(userId)!;
  }
  for (const actionActivity of actionActivities) {
    getActivities(actionActivity.actionId, actionActivity.userId).push(
      actionActivity,
    );
  }
  function getter(actionId: number, userId: number): ActionActivity[] {
    if (!actionActivitiesByActionThenUser.has(actionId)) {
      return [];
    }
    if (!actionActivitiesByActionThenUser.get(actionId)!.has(userId)) {
      return [];
    }
    return actionActivitiesByActionThenUser.get(actionId)!.get(userId)!;
  }
  getter.map = actionActivitiesByActionThenUser;
  return getter;
}
