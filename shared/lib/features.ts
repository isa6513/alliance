export enum Features {
  Forum = "forum",
  PublicSignup = "public_signup",
  SingleAction = "single_action",
}

export const PROD_FLAGS: Record<Features, boolean> = {
  [Features.Forum]: true,
  [Features.PublicSignup]: false,
  [Features.SingleAction]: false,
};

export const DEV_FLAGS: Record<Features, boolean> = {
  [Features.Forum]: true,
  [Features.PublicSignup]: true,
  [Features.SingleAction]: false,
};

export const isEnabled = (feature: Features, env: string) => {
  if (env === "development") {
    return DEV_FLAGS[feature];
  }
  return PROD_FLAGS[feature];
};
