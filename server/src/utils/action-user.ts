/** @fileoverview Utils for relationships between actions and users */
import type { ActionActivity } from 'src/actions/entities/action-activity.entity';
import { ActionStatus } from 'src/actions/entities/action-event.entity';
import { Action } from 'src/actions/entities/action.entity';
import type { Community } from 'src/community/entities/community.entity';
import type { FormResponse } from 'src/tasks/entities/formresponse.entity';
import { User } from 'src/user/entities/user.entity';
import { findLeast } from 'src/utils/filter';
import type { Repository } from 'typeorm';

/**
 * Onboarding "joined in time?" gate. Targets *new* members, so a user qualifies
 * only if their first contract was signed at or after the member-action phase began.
 *
 * Edge cases:
 * - No contract events → in time (brand-new signup).
 * - Contract event but no phase start → out of time: can't onboard into a phase
 *   that hasn't started.
 *
 * Single source of this rule, shared by {@link computeShouldParticipateCore}
 * (both `shouldParticipate` variants) and `ActionsService.isEligibleForAction`
 * (`canParticipate`).
 */
export function computeContractSignedAfterOnboardingStart(params: {
  user: Pick<User, 'contractEvents'>;
  memberActionPhaseStart: Date | null;
}): boolean {
  const { user, memberActionPhaseStart } = params;

  const earliestContractEvent = findLeast(
    user.contractEvents ?? [],
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  if (!earliestContractEvent) {
    return true;
  }
  if (!memberActionPhaseStart) {
    return false;
  }
  return earliestContractEvent.date >= memberActionPhaseStart;
}

/**
 * Shared rule for both `shouldParticipate` variants: dismissal, cohort
 * membership, and the contract requirement — onboarding actions need the first
 * contract signed at/after the phase start; all others need an active contract
 * across the whole member-action window (`deadlineDate: null` = open-ended).
 */
function computeShouldParticipateCore(params: {
  /** Member-action phase start; also the onboarding join-timing reference. */
  eventDate: Date;
  deadlineDate: Date | null;
  inCohort: boolean;
  dismissed: boolean;
  onboarding: boolean;
  user: Pick<User, 'contractEvents' | 'hasActiveContractInFullRange'>;
  /**
   * Skip the contract-lapse exclusion (analytics wants the historical base
   * set and handles contract state itself).
   */
  includeSuspended?: boolean;
  includeDismissed?: boolean;
}): boolean {
  const {
    eventDate,
    deadlineDate,
    inCohort,
    dismissed,
    onboarding,
    user,
    includeSuspended = false,
    includeDismissed = false,
  } = params;

  if (!includeDismissed && dismissed) {
    return false;
  }
  if (!inCohort) {
    return false;
  }
  if (onboarding) {
    return computeContractSignedAfterOnboardingStart({
      user,
      memberActionPhaseStart: eventDate,
    });
  }
  return (
    includeSuspended ||
    user.hasActiveContractInFullRange({
      startDate: eventDate,
      endDate: deadlineDate,
    })
  );
}

/**
 * Self-view "is this user expected to take this action?" predicate — source of
 * the viewer's own `ActionDto.shouldParticipate`.
 *
 * Distinct from {@link computeShouldParticipate} (the event-recipient variant
 * driven by a precomputed cohort-member set, for notifications/roster). This one
 * consumes the full cohort-*expression* result (`computeIsInCohortExpression`)
 * as `inCohort`, and stays pure/sync so the caller controls when the DB-hitting
 * cohort evaluation runs. Both delegate to {@link computeShouldParticipateCore}.
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
  const { event, deadlineEvent } = action.memberActionPhase;
  if (!event) {
    return false;
  }
  return computeShouldParticipateCore({
    eventDate: event.date,
    deadlineDate: deadlineEvent?.date ?? null,
    inCohort,
    dismissed,
    onboarding: action.onboarding,
    user,
  });
}

/**
 * Window-overlap away check: is the user away at *any* point during the whole
 * member-action phase? Time-independent. Used for participation rosters and the
 * `usersJoined` counter — i.e. "could this user have done it at all?".
 *
 * Distinct from {@link computeMemberActionAwayStatus}, which is the now-relative
 * 4-valued status the UI renders. Two different questions; don't conflate them.
 */
export function computeIsAwayDuringAnyOfMemberAction(params: {
  action: Pick<Action, 'events' | 'memberActionPhase'>;
  user: Pick<User, 'awayRanges' | 'isAwayAtAnyPointInRange'>;
}): boolean {
  const { action, user } = params;

  const { event: memberActionEvent, deadlineEvent } = action.memberActionPhase;

  if (!memberActionEvent) {
    return false;
  }

  return user.isAwayAtAnyPointInRange({
    startDate: memberActionEvent.date,
    endDate: deadlineEvent?.date ?? null,
  });
}

/**
 * Now-relative away status for a user's member action, as rendered on the home
 * feed (away banner, sidebar visibility, task-count badge).
 *
 * This is the single source of truth that used to live on the client as
 * `getAwayStatusAt` in `shared/lib/actionUtils.ts`. It is surfaced on
 * `ActionDto.awayStatus` so clients read a field instead of recomputing it.
 *
 * Distinct from {@link computeIsAwayDuringAnyOfMemberAction} (window-overlap
 * boolean for rosters/counters).
 */
export enum TaskAwayStatus {
  AwayPreviously = 'away_previously',
  AwayCurrently = 'away_currently',
  AwayLater = 'away_later',
  NotAway = 'not_away',
}

function findActionEventWindowAt(
  events: { date: Date }[],
  date: Date,
): { startDate: Date | null; endDate: Date | null } {
  const event = events.find((e) => e.date <= date) ?? null;
  const nextEvent = events.find((e) => e.date > date) ?? null;
  return { startDate: event?.date ?? null, endDate: nextEvent?.date ?? null };
}

export function computeMemberActionAwayStatus(params: {
  action: Pick<Action, 'events'>;
  user: Pick<User, 'awayRanges'>;
  now: Date;
}): TaskAwayStatus {
  const { action, user, now } = params;

  const memberActionEvent = action.events.find(
    (event) =>
      event.date <= now && event.newStatus === ActionStatus.MemberAction,
  );
  if (!memberActionEvent) {
    return TaskAwayStatus.NotAway;
  }

  const { startDate, endDate } = findActionEventWindowAt(
    action.events,
    memberActionEvent.date,
  );
  if (!startDate) {
    return TaskAwayStatus.NotAway;
  }

  for (const awayRange of user.awayRanges ?? []) {
    const { startDate: awayStartDate, endDate: awayEndDate } = awayRange;
    if (awayStartDate <= now && now < awayEndDate) {
      return TaskAwayStatus.AwayCurrently;
    }
    if (startDate < awayEndDate && awayEndDate < now) {
      return TaskAwayStatus.AwayPreviously;
    }
    if (now <= awayStartDate && (!endDate || awayStartDate < endDate)) {
      return TaskAwayStatus.AwayLater;
    }
  }
  return TaskAwayStatus.NotAway;
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
    memberActionEventDeadline: action.memberActionPhase?.deadlineEvent?.date,
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
 * Runs per member-action event, so `eventDate` is the phase start.
 */
export function computeShouldParticipate(params: {
  eventDate: Date;
  deadlineDate: Date | null;
  cohortMemberIds: Set<number>;
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
    includeSuspended,
    includeDismissed,
  } = params;

  return computeShouldParticipateCore({
    eventDate,
    deadlineDate,
    inCohort: cohortMemberIds.has(user.id),
    dismissed: userDismissed,
    onboarding,
    user,
    includeSuspended,
    includeDismissed,
  });
}

/**
 * "Expected and able" recipient predicate: {@link computeShouldParticipate}
 * AND not away at any point during the member-action window. Single source
 * for every consumer of the participation roster — notification recipients
 * (`ActionEventRecipientService`) and suite stats (`ActionsService`) — so a
 * user the roster/pill counts as away is consistently excluded everywhere.
 * `user` must have `awayRanges` loaded.
 */
export function computeIsParticipatingRecipient(
  params: Parameters<typeof computeShouldParticipate>[0],
): boolean {
  const { user, eventDate, deadlineDate } = params;
  return (
    computeShouldParticipate(params) &&
    !user.isAwayAtAnyPointInRange({
      startDate: eventDate,
      endDate: deadlineDate,
    })
  );
}
