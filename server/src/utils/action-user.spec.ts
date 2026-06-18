import { ActionStatus } from '../actions/entities/action-event.entity';
import { computeShouldParticipateInAction } from './action-user';

type Params = Parameters<typeof computeShouldParticipateInAction>[0];

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
});
