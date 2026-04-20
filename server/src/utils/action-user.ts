/** @fileoverview Utils for relationships between actions and users */
import { Action } from 'src/actions/entities/action.entity';
import { User } from 'src/user/entities/user.entity';
import type { Repository } from 'typeorm';
import type { ActionActivity } from 'src/actions/entities/action-activity.entity';
import type { FormResponse } from 'src/tasks/entities/formresponse.entity';
import type { Community } from 'src/community/entities/community.entity';
import { findLeast } from 'src/utils/filter';

export function computeIsContractActiveDuringEntireMemberAction(params: {
  action: Pick<Action, 'events' | 'memberActionPhase'>;
  user: Pick<User, 'contractEvents' | 'hasActiveContractInFullRange'>;
}): boolean {
  const { action, user } = params;
  const { event: memberActionEvent, deadline } = action.memberActionPhase;

  if (!memberActionEvent) {
    return false;
  }

  return user.hasActiveContractInFullRange({
    startDate: memberActionEvent.date,
    endDate: deadline,
  });
}

export function computeIsAwayDuringAnyOfMemberAction(params: {
  action: Pick<Action, 'events' | 'memberActionPhase'>;
  user: Pick<User, 'awayRanges' | 'isAwayAtAnyPointInRange'>;
}): boolean {
  const { action, user } = params;

  const { event: memberActionEvent, deadline } = action.memberActionPhase;

  if (!memberActionEvent) {
    return false;
  }

  return user.isAwayAtAnyPointInRange({
    startDate: memberActionEvent.date,
    endDate: deadline,
  });
}

/**
 * Optional repositories/services for evaluating advanced cohort leaf types.
 * When provided, CompletedAction, InProgressAction, FormFieldValue, and
 * GroupLead expressions will be evaluated properly. Without them, those
 * leaf types return false.
 */
export interface CohortEvaluationDeps {
  actionActivityRepository?: Repository<ActionActivity>;
  formResponseRepository?: Repository<FormResponse>;
  communityRepository?: Repository<Community>;
}

// --- Legacy functions for GeneralUpdate compatibility ---

export function computeIsTaggedOrInManualCohortAction(params: {
  user: User;
  action: Action;
  includeSuspended: boolean;
}): boolean {
  const { user, action, includeSuspended } = params;

  return computeIsTaggedOrInManualCohort({
    user,
    useManualCohort: false,
    manualCohortUserIdSet: null,
    participatingTagIdSet: new Set<string>(),
    everyoneShouldComplete: action.everyoneShouldComplete,
    memberActionEventDate: action.memberActionPhase?.event?.date,
    memberActionEventDeadline: action.memberActionPhase?.deadline,
    includeSuspended,
  });
}

export function computeIsTaggedOrInManualCohort(params: {
  user: Pick<User, 'id' | 'tags' | 'hasActiveContractInFullRange'>;
  useManualCohort: boolean;
  manualCohortUserIdSet: Set<number> | null;
  participatingTagIdSet: Set<string>;
  everyoneShouldComplete: boolean;
  memberActionEventDate: Date | undefined | null;
  memberActionEventDeadline: Date | undefined | null;
  includeSuspended: boolean;
}): boolean {
  const {
    user,
    useManualCohort,
    manualCohortUserIdSet,
    participatingTagIdSet,
    everyoneShouldComplete,
    memberActionEventDate,
    memberActionEventDeadline,
    includeSuspended,
  } = params;

  if (useManualCohort) {
    return !!manualCohortUserIdSet?.has(user.id);
  }

  return (
    user.tags.some((tag) => participatingTagIdSet.has(tag.id)) &&
    (includeSuspended ||
      everyoneShouldComplete ||
      user.hasActiveContractInFullRange({
        startDate: memberActionEventDate,
        endDate: memberActionEventDeadline,
      }))
  );
}

/**
 * Determines whether a user should participate in a given action event based on
 * cohort membership, dismissal status, onboarding rules, contract dates, and the
 * `everyoneShouldComplete` flag.
 */
export function computeShouldParticipate(params: {
  eventDate: Date;
  deadlineDate: Date | null;
  everyoneShouldComplete: boolean;
  cohortMemberIds: Set<number> | null;
  user: User;
  userDismissed: boolean;
  onboarding: boolean;
  includeSuspended?: boolean;
  includeDismissed?: boolean;
}): boolean {
  const {
    eventDate,
    deadlineDate,
    everyoneShouldComplete,
    cohortMemberIds,
    user,
    userDismissed,
    onboarding,
    includeSuspended = false,
    includeDismissed = false,
  } = params;

  if (!includeDismissed && userDismissed) {
    return false;
  }

  if (cohortMemberIds && !cohortMemberIds.has(user.id)) {
    return false;
  }

  if (
    !everyoneShouldComplete &&
    deadlineDate &&
    !user.hasActiveContractInFullRange({
      startDate: eventDate,
      endDate: deadlineDate,
    })
  ) {
    return false;
  }

  if (onboarding) {
    const earliestContractEvent = findLeast(
      user.contractEvents ?? [],
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    if (earliestContractEvent && earliestContractEvent.date < eventDate) {
      return false;
    }
  }

  if (includeSuspended) {
    return true;
  }
  return user.hasActiveContractAt(eventDate) || everyoneShouldComplete;
}
