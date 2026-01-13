import { ActionActivity } from 'src/actions/entities/action-activity.entity';
import { Action } from 'src/actions/entities/action.entity';
import { User } from 'src/user/entities/user.entity';

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

export function actionByIdGetter(params: { actions: Action[] }): {
  (actionId: number): Action | null;
  map: Map<number, Action>;
} {
  const { actions } = params;

  const map = new Map<number, Action>();
  for (const action of actions) {
    map.set(action.id, action);
  }

  function getter(actionId: number): Action | null {
    return map.get(actionId) ?? null;
  }
  getter.map = map;
  return getter;
}

export function userByIdGetter(params: { users: User[] }): {
  (userId: number): User | null;
  map: Map<number, User>;
} {
  const { users } = params;

  const map = new Map<number, User>();
  for (const user of users) {
    map.set(user.id, user);
  }

  function getter(userId: number): User | null {
    return map.get(userId) ?? null;
  }
  getter.map = map;
  return getter;
}
