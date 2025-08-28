export enum Features {
  Forum = "forum",
  PublicSignup = "public_signup",
  BugReporting = "bug_reporting",
}

export const PROD_FLAGS: Record<Features, boolean> = {
  [Features.Forum]: true,
  [Features.PublicSignup]: false,
  [Features.BugReporting]: true,
};

export const DEV_FLAGS: Record<Features, boolean> = {
  [Features.Forum]: true,
  [Features.PublicSignup]: true,
  [Features.BugReporting]: true,
};

export const isEnabled = (feature: Features, env: string) => {
  if (env === "development") {
    return DEV_FLAGS[feature];
  }
  return PROD_FLAGS[feature];
};
