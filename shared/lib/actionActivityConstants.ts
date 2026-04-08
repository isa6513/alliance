import { ActionActivityType } from "../client";

export const actionActivityViewable = {
  user_completed: true,
  user_submitted_follow_up_form: true,
  user_wont_complete: false,
  user_dismissed: false,
} as const satisfies Record<ActionActivityType, boolean>;

export type ViewableActionActivity = {
  [K in ActionActivityType]: (typeof actionActivityViewable)[K] extends true
    ? K
    : never;
}[ActionActivityType];

type ActionActivityVerbMapping = {
  [K in ViewableActionActivity]: string;
} & {
  [K in Exclude<ActionActivityType, ViewableActionActivity>]: null;
};

export const actionActivityTransitiveVerb = {
  user_completed: "completed",
  user_submitted_follow_up_form: "followed up on",
  user_wont_complete: null,
  user_dismissed: null,
} as const satisfies ActionActivityVerbMapping;

export const actionActivityIntransitiveVerb = {
  user_completed: "completed",
  user_submitted_follow_up_form: "followed-up",
  user_wont_complete: null,
  user_dismissed: null,
} as const satisfies ActionActivityVerbMapping;

export const actionActivityCommentable = {
  user_completed: true,
  user_submitted_follow_up_form: true,
  user_wont_complete: false,
  user_dismissed: false,
} as const satisfies {
  [K in ViewableActionActivity]: boolean;
} & {
  [K in Exclude<ActionActivityType, ViewableActionActivity>]: false;
};
