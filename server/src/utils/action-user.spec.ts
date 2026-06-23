import { ActionStatus } from '../actions/entities/action-event.entity';
import type { User } from '../user/entities/user.entity';
import {
  computeContractSignedAfterOnboardingStart,
  computeShouldParticipateInAction,
} from './action-user';

type Params = Parameters<typeof computeShouldParticipateInAction>[0];

const PHASE_START = new Date('2020-01-01');

function userWithContractSignedAt(
  date: Date | null,
): Pick<User, 'contractEvents' | 'hasActiveContractInFullRange'> {
  return {
    contractEvents: date ? [{ date }] : [],
    hasActiveContractInFullRange: () => false,
  } as unknown as Pick<User, 'contractEvents' | 'hasActiveContractInFullRange'>;
}

function makeAction(
  opts: {
    hasMemberActionEvent?: boolean;
    onboarding?: boolean;
  } = {},
): Params['action'] {
  const { hasMemberActionEvent = true, onboarding = false } = opts;
  return {
    events: hasMemberActionEvent
      ? [{ newStatus: ActionStatus.MemberAction, date: new Date('2020-01-01') }]
      : [
          {
            newStatus: ActionStatus.OfficeAction,
            date: new Date('2020-01-01'),
          },
        ],
    onboarding,
    memberActionPhase: {
      event: { date: new Date('2020-01-01') },
      deadline: new Date('2020-02-01'),
    },
  } as unknown as Params['action'];
}

function makeUser(hasActiveContract: boolean): Params['user'] {
  return {
    contractEvents: [],
    hasActiveContractInFullRange: () => hasActiveContract,
  } as unknown as Params['user'];
}

function input(overrides: Partial<Params> = {}): Params {
  return {
    action: makeAction(),
    user: makeUser(true),
    inCohort: true,
    dismissed: false,
    ...overrides,
  };
}

describe('computeShouldParticipateInAction', () => {
  it('participates when in cohort, with a contract active over the member action', () => {
    expect(computeShouldParticipateInAction(input())).toBe(true);
  });

  it('does not participate for a logged-out viewer', () => {
    expect(computeShouldParticipateInAction(input({ user: null }))).toBe(false);
  });

  it('does not participate when the action has no member-action event', () => {
    expect(
      computeShouldParticipateInAction(
        input({ action: makeAction({ hasMemberActionEvent: false }) }),
      ),
    ).toBe(false);
  });

  it('does not participate when the user has dismissed the action', () => {
    expect(computeShouldParticipateInAction(input({ dismissed: true }))).toBe(
      false,
    );
  });

  it('does not participate when the user is not in the cohort', () => {
    expect(computeShouldParticipateInAction(input({ inCohort: false }))).toBe(
      false,
    );
  });

  describe('contract requirement', () => {
    it('does not participate without an active contract', () => {
      expect(
        computeShouldParticipateInAction(input({ user: makeUser(false) })),
      ).toBe(false);
    });

    it('participates without an active contract for an onboarding action', () => {
      expect(
        computeShouldParticipateInAction(
          input({
            action: makeAction({ onboarding: true }),
            user: makeUser(false),
          }),
        ),
      ).toBe(true);
    });
  });

  describe('onboarding join timing', () => {
    // Excluded even when in the cohort: onboarding targets new members only.
    it('excludes an existing member who joined before the phase began', () => {
      expect(
        computeShouldParticipateInAction(
          input({
            action: makeAction({ onboarding: true }),
            user: userWithContractSignedAt(
              new Date(PHASE_START.getTime() - 1000),
            ),
          }),
        ),
      ).toBe(false);
    });

    it('includes a new member who joined at/after the phase began', () => {
      expect(
        computeShouldParticipateInAction(
          input({
            action: makeAction({ onboarding: true }),
            user: userWithContractSignedAt(
              new Date(PHASE_START.getTime() + 1000),
            ),
          }),
        ),
      ).toBe(true);
    });
  });
});

describe('computeContractSignedAfterOnboardingStart', () => {
  it('treats a user with no contract events as in time', () => {
    expect(
      computeContractSignedAfterOnboardingStart({
        user: userWithContractSignedAt(null),
        memberActionPhaseStart: PHASE_START,
      }),
    ).toBe(true);
  });

  it('is out of time when joined before the phase began', () => {
    expect(
      computeContractSignedAfterOnboardingStart({
        user: userWithContractSignedAt(new Date(PHASE_START.getTime() - 1000)),
        memberActionPhaseStart: PHASE_START,
      }),
    ).toBe(false);
  });

  it('is in time when joined exactly at the phase start', () => {
    expect(
      computeContractSignedAfterOnboardingStart({
        user: userWithContractSignedAt(PHASE_START),
        memberActionPhaseStart: PHASE_START,
      }),
    ).toBe(true);
  });

  it('is out of time when a contract holder has no member-action phase start', () => {
    expect(
      computeContractSignedAfterOnboardingStart({
        user: userWithContractSignedAt(PHASE_START),
        memberActionPhaseStart: null,
      }),
    ).toBe(false);
  });
});
