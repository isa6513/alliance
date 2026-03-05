export enum Features {
  Forum = "forum",
  PublicSignup = "public_signup",
  Messaging = "messaging",
  PushNotifications = "push_notifications",
  GeneralUpdatesLink = "general_updates_link",
}

export const PROD_FLAGS: Record<Features, boolean> = {
  [Features.Forum]: true,
  [Features.PublicSignup]: false,
  [Features.Messaging]: true,
  [Features.PushNotifications]: false,
  [Features.GeneralUpdatesLink]: false,
};

export const DEV_FLAGS: Record<Features, boolean> = {
  [Features.Forum]: true,
  [Features.PublicSignup]: false,
  [Features.Messaging]: true,
  [Features.PushNotifications]: true,
  [Features.GeneralUpdatesLink]: true,
};

export const isEnabled = (feature: Features, env: string) => {
  if (env === "development" || env === "staging") {
    return DEV_FLAGS[feature];
  }
  return PROD_FLAGS[feature];
};
