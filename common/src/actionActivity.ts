/**
 * Single source of truth for the action-activity taxonomy: the canonical
 * `ActionActivityType` enum.
 */
export enum ActionActivityType {
  USER_COMPLETED = "user_completed",
  USER_WONT_COMPLETE = "user_wont_complete",
  USER_DISMISSED = "user_dismissed",
  USER_SUBMITTED_FOLLOW_UP_FORM = "user_submitted_follow_up_form",
}

/** Which `ActionActivityType`s appear in feeds. */
const ACTION_ACTIVITY_FEED_VISIBLE = {
  user_completed: true,
  user_submitted_follow_up_form: true,
  user_wont_complete: false,
  user_dismissed: false,
} as const satisfies Record<ActionActivityType, boolean>;

export type FeedActionActivity = {
  [K in ActionActivityType]: (typeof ACTION_ACTIVITY_FEED_VISIBLE)[K] extends true
    ? K | `${K}`
    : never;
}[ActionActivityType];

export function actionActivityIsVisibleInFeed(
  type: ActionActivityType | keyof typeof ACTION_ACTIVITY_FEED_VISIBLE,
): type is FeedActionActivity {
  return ACTION_ACTIVITY_FEED_VISIBLE[type];
}

export const ACTION_ACTIVITY_FEED_VISIBLE_TYPES = Object.keys(
  ACTION_ACTIVITY_FEED_VISIBLE,
).filter(
  (key) => ACTION_ACTIVITY_FEED_VISIBLE[key as ActionActivityType],
) as FeedActionActivity[];

export const actionActivityTransitiveVerb = {
  user_completed: "completed",
  user_submitted_follow_up_form: "followed up on",
  user_wont_complete: "won't complete",
  user_dismissed: "dismissed",
} as const satisfies Record<ActionActivityType, string>;

export const actionActivityCommentable = {
  user_completed: true,
  user_submitted_follow_up_form: true,
  user_wont_complete: false,
  user_dismissed: false,
} as const satisfies Record<ActionActivityType, boolean>;
