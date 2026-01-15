/** @fileoverview Utils for relationships between actions and users */
import { Action } from 'src/actions/entities/action.entity';
import { User } from 'src/user/entities/user.entity';

export function computeIsContractActiveDuringEntireLatestMemberAction(params: {
  action: Pick<Action, 'events' | 'latestMemberActionEvent'>;
  user: Pick<User, 'contractEvents' | 'hasActiveContractInFullRange'>;
}): boolean {
  const { action, user } = params;
  const { event: latestMemberActionEvent, deadline } =
    action.latestMemberActionEvent;

  if (!latestMemberActionEvent) {
    return false;
  }

  return user.hasActiveContractInFullRange({
    startDate: latestMemberActionEvent.date,
    endDate: deadline,
  });
}

export function computeIsAwayDuringAnyOfLastMemberAction(params: {
  action: Pick<Action, 'events' | 'latestMemberActionEvent'>;
  user: Pick<User, 'awayRanges' | 'isAwayAtAnyPointInRange'>;
}): boolean {
  const { action, user } = params;

  const { event: lastMemberActionEvent, deadline } =
    action.latestMemberActionEvent;

  if (!lastMemberActionEvent) {
    return false;
  }

  return user.isAwayAtAnyPointInRange({
    startDate: lastMemberActionEvent.date,
    endDate: deadline,
  });
}

export function computeIsTaggedOrInManualCohort(params: {
  user: User;
  action: Action;
  includeSuspended: boolean;
}): boolean {
  const { user, action, includeSuspended } = params;

  if (action.useManualCohort) {
    return !!action.manualCohortUserIdSet?.has(user.id);
  }

  return (
    user.tags.some((tag) => action.participatingTagIdSet.has(tag.id)) &&
    (includeSuspended ||
      action.everyoneShouldComplete ||
      user.hasActiveContractInFullRange({
        startDate: action.latestMemberActionEvent?.event?.date,
        endDate: action.latestMemberActionEvent?.deadline,
      }))
  );
}
