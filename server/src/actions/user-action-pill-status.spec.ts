import { UserActionRelationPillStatus } from '../user/dto/user-action-relations.dto';
import { ActionActivityType } from './entities/action-activity.entity';
import {
  ACTIVITY_TYPE_TO_PILL_STATUS,
  resolveUserActionPillStatus,
  UserActionPillStatusInput,
} from './user-action-pill-status';

function input(
  overrides: Partial<UserActionPillStatusInput> = {},
): UserActionPillStatusInput {
  return {
    isJoined: false,
    isAway: false,
    optional: false,
    deadlinePassed: false,
    activityStatus: null,
    ...overrides,
  };
}

/**
 * Fold a chronological sequence of activity types into a single status, the
 * same way the service does: most recent status-bearing activity wins, and a
 * non-terminal activity (`?? prev`) leaves the prior status intact.
 */
function foldActivities(
  ...types: ActionActivityType[]
): UserActionRelationPillStatus | null {
  return types.reduce<UserActionRelationPillStatus | null>(
    (status, type) => ACTIVITY_TYPE_TO_PILL_STATUS[type] ?? status,
    null,
  );
}

describe('ACTIVITY_TYPE_TO_PILL_STATUS', () => {
  it('maps USER_COMPLETED to completed', () => {
    expect(
      ACTIVITY_TYPE_TO_PILL_STATUS[ActionActivityType.USER_COMPLETED],
    ).toBe(UserActionRelationPillStatus.Completed);
  });

  it('maps USER_WONT_COMPLETE to wont_complete', () => {
    expect(
      ACTIVITY_TYPE_TO_PILL_STATUS[ActionActivityType.USER_WONT_COMPLETE],
    ).toBe(UserActionRelationPillStatus.WontComplete);
  });

  it('returns null for dismissals (leaves underlying status untouched)', () => {
    expect(
      ACTIVITY_TYPE_TO_PILL_STATUS[ActionActivityType.USER_DISMISSED],
    ).toBeNull();
  });

  it('returns null for follow-up form submissions', () => {
    expect(
      ACTIVITY_TYPE_TO_PILL_STATUS[
        ActionActivityType.USER_SUBMITTED_FOLLOW_UP_FORM
      ],
    ).toBeNull();
  });
});

describe('ACTIVITY_TYPE_TO_PILL_STATUS folding', () => {
  it('is null with no activities', () => {
    expect(foldActivities()).toBeNull();
  });

  it('takes the status of a single terminal activity', () => {
    expect(foldActivities(ActionActivityType.USER_COMPLETED)).toBe(
      UserActionRelationPillStatus.Completed,
    );
  });

  it('is null when the only activities are non-terminal', () => {
    expect(
      foldActivities(
        ActionActivityType.USER_DISMISSED,
        ActionActivityType.USER_SUBMITTED_FOLLOW_UP_FORM,
      ),
    ).toBeNull();
  });

  it('keeps completed when a follow-up form is submitted afterwards', () => {
    expect(
      foldActivities(
        ActionActivityType.USER_COMPLETED,
        ActionActivityType.USER_SUBMITTED_FOLLOW_UP_FORM,
      ),
    ).toBe(UserActionRelationPillStatus.Completed);
  });

  it('keeps completed when the action is dismissed afterwards', () => {
    expect(
      foldActivities(
        ActionActivityType.USER_COMPLETED,
        ActionActivityType.USER_DISMISSED,
      ),
    ).toBe(UserActionRelationPillStatus.Completed);
  });

  it('lets a later terminal activity override an earlier one', () => {
    expect(
      foldActivities(
        ActionActivityType.USER_COMPLETED,
        ActionActivityType.USER_WONT_COMPLETE,
      ),
    ).toBe(UserActionRelationPillStatus.WontComplete);
  });
});

describe('resolveUserActionPillStatus', () => {
  it('defaults to not_required for a user who is neither joined, away, nor active', () => {
    expect(resolveUserActionPillStatus(input())).toBe(
      UserActionRelationPillStatus.NotRequired,
    );
  });

  describe('joined task status', () => {
    it('is todo for a joined, non-optional, not-yet-due action', () => {
      expect(resolveUserActionPillStatus(input({ isJoined: true }))).toBe(
        UserActionRelationPillStatus.Todo,
      );
    });

    it('is missed_deadline for a joined, non-optional, past-due action', () => {
      expect(
        resolveUserActionPillStatus(
          input({ isJoined: true, deadlinePassed: true }),
        ),
      ).toBe(UserActionRelationPillStatus.MissedDeadline);
    });

    it('is optional_task for a joined optional action', () => {
      expect(
        resolveUserActionPillStatus(input({ isJoined: true, optional: true })),
      ).toBe(UserActionRelationPillStatus.OptionalTask);
    });

    it('prefers optional_task over missed_deadline when an optional action is also past due', () => {
      expect(
        resolveUserActionPillStatus(
          input({ isJoined: true, optional: true, deadlinePassed: true }),
        ),
      ).toBe(UserActionRelationPillStatus.OptionalTask);
    });
  });

  describe('away', () => {
    it('shows away over a joined task status', () => {
      expect(
        resolveUserActionPillStatus(input({ isJoined: true, isAway: true })),
      ).toBe(UserActionRelationPillStatus.Away);
    });

    it('shows away even when the user is away but not joined', () => {
      expect(
        resolveUserActionPillStatus(input({ isJoined: false, isAway: true })),
      ).toBe(UserActionRelationPillStatus.Away);
    });
  });

  describe('terminal activity wins', () => {
    it('completed overrides away', () => {
      expect(
        resolveUserActionPillStatus(
          input({
            isAway: true,
            isJoined: true,
            activityStatus: foldActivities(ActionActivityType.USER_COMPLETED),
          }),
        ),
      ).toBe(UserActionRelationPillStatus.Completed);
    });

    it('wont_complete overrides a joined task status', () => {
      expect(
        resolveUserActionPillStatus(
          input({
            isJoined: true,
            activityStatus: foldActivities(
              ActionActivityType.USER_WONT_COMPLETE,
            ),
          }),
        ),
      ).toBe(UserActionRelationPillStatus.WontComplete);
    });

    it('completed applies even to a user who is not joined', () => {
      expect(
        resolveUserActionPillStatus(
          input({
            activityStatus: foldActivities(ActionActivityType.USER_COMPLETED),
          }),
        ),
      ).toBe(UserActionRelationPillStatus.Completed);
    });

    it('stays completed when a follow-up form is submitted after completion', () => {
      expect(
        resolveUserActionPillStatus(
          input({
            isJoined: true,
            activityStatus: foldActivities(
              ActionActivityType.USER_COMPLETED,
              ActionActivityType.USER_SUBMITTED_FOLLOW_UP_FORM,
            ),
          }),
        ),
      ).toBe(UserActionRelationPillStatus.Completed);
    });
  });

  describe('non-terminal activity falls through to underlying status', () => {
    it('a dismissal on a joined action still shows todo', () => {
      expect(
        resolveUserActionPillStatus(
          input({
            isJoined: true,
            activityStatus: foldActivities(ActionActivityType.USER_DISMISSED),
          }),
        ),
      ).toBe(UserActionRelationPillStatus.Todo);
    });

    it('a follow-up submission while away still shows away', () => {
      expect(
        resolveUserActionPillStatus(
          input({
            isAway: true,
            activityStatus: foldActivities(
              ActionActivityType.USER_SUBMITTED_FOLLOW_UP_FORM,
            ),
          }),
        ),
      ).toBe(UserActionRelationPillStatus.Away);
    });
  });
});
