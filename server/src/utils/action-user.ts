/** @fileoverview Utils for relationships between actions and users */
import { ContractEventType } from 'src/user/entities/contract-event.entity';
import { findLeast } from './filter';
import { Action } from 'src/actions/entities/action.entity';
import { User } from 'src/user/entities/user.entity';
import { Tag } from 'src/user/entities/tag.entity';
import {
  ActionEvent,
  ActionStatus,
} from 'src/actions/entities/action-event.entity';

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

export function getLatestMemberActionWithDeadline(params: {
  action: Pick<Action, 'events'>;
}):
  | { event: ActionEvent; endDate: Date }
  | {
      event: ActionEvent;
      endDate: null;
    }
  | {
      event: null;
      endDate: null;
    } {
  const {
    action: { events },
  } = params;
  const latestMemberActionEvent = findLeast(
    events,
    (a, b) => b.date.getTime() - a.date.getTime(), // reverse order
    (event) => event.newStatus === ActionStatus.MemberAction,
  );
  if (!latestMemberActionEvent) {
    return { event: null, endDate: null };
  }

  const earliestDeadline = findLeast(
    events,
    (a, b) => a.date.getTime() - b.date.getTime(),
    (event) =>
      event.newStatus !== ActionStatus.MemberAction &&
      event.date > latestMemberActionEvent.date,
  );

  return {
    event: latestMemberActionEvent,
    endDate: earliestDeadline?.date ?? null,
  };
}

export function isContractActiveDuringEntireLatestMemberAction(params: {
  action: Pick<Action, 'events'>;
  user: Pick<User, 'contractEvents'>;
}): boolean {
  const { action, user } = params;
  const { event: latestMemberActionEvent, endDate } =
    this.getLatestMemberActionWithDeadline({
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
