/** @fileoverview Utils for relationships between actions and users */
import type { ActionActivity } from 'src/actions/entities/action-activity.entity';
import { ActionStatus } from 'src/actions/entities/action-event.entity';
import { Action } from 'src/actions/entities/action.entity';
import type { Community } from 'src/community/entities/community.entity';
import type { FormResponse } from 'src/tasks/entities/formresponse.entity';
import { User } from 'src/user/entities/user.entity';
import { findLeast } from 'src/utils/filter';
import type { Repository } from 'typeorm';

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

/**
 * Self-view "is this user expected to take this action?" predicate — source of
 * the viewer's own `ActionDto.shouldParticipate`.
 *
 * Distinct from {@link computeShouldParticipate} (the event-recipient variant
 * driven by a precomputed cohort-member set, for notifications/roster). This one
 * consumes the full cohort-*expression* result (`computeIsInCohortExpression`)
 * as `inCohort`, and stays pure/sync so the caller controls when the DB-hitting
 * cohort evaluation runs. Not yet unified.
 */
export function computeShouldParticipateInAction(params: {
  action: Pick<Action, 'events' | 'memberActionPhase' | 'onboarding'>;
  user: Pick<User, 'contractEvents' | 'hasActiveContractInFullRange'> | null;
  inCohort: boolean;
  dismissed: boolean;
}): boolean {
  const { action, user, inCohort, dismissed } = params;
  if (!user) {
    return false;
  }
  const hasMemberActionEvent = action.events.some(
    (event) => event.newStatus === ActionStatus.MemberAction,
  );
  return (
    hasMemberActionEvent &&
    !dismissed &&
    inCohort &&
    (action.onboarding ||
      computeIsContractActiveDuringEntireMemberAction({ action, user }))
  );
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
    onboarding: action.onboarding,
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
  onboarding: boolean;
  memberActionEventDate: Date | undefined | null;
  memberActionEventDeadline: Date | undefined | null;
  includeSuspended: boolean;
}): boolean {
  const {
    user,
    useManualCohort,
    manualCohortUserIdSet,
    participatingTagIdSet,
    onboarding,
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
      onboarding ||
      user.hasActiveContractInFullRange({
        startDate: memberActionEventDate,
        endDate: memberActionEventDeadline,
      }))
  );
}

/**
 * Determines whether a user should participate in a given action event based on
 * cohort membership, dismissal status, onboarding rules, and contract dates.
 */
export function computeShouldParticipate(params: {
  eventDate: Date;
  deadlineDate: Date | null;
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
    !onboarding &&
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
  return user.hasActiveContractAt(eventDate) || onboarding;
}
